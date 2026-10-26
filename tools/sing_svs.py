"""兒歌「AI 歌手照歌譜唱」：把每首歌的歌詞、音高、每個音多長交給 SoulX-Singer（Kaggle 免費 GPU），
它照譜直接唱出自然的歌聲，再配上 tools/sing.py 做的八音盒伴奏。
時間軸和 tools/sing.py 完全一樣（第一句 0.6 秒開始、每句中間空半拍），所以 audio/sing/index.json 的 times 可以直接亮字幕。
輸出 audio/sing-svs/<id>-<hash>.mp3，index.json 記 {id: {file, times}}。
用法：python tools/sing_svs.py songs.json --plan jobs.json [id,id]   列出還沒做的（交給 tools/kaggle_svs/kaggle.sh）
      python tools/sing_svs.py songs.json                           整理 index.json、刪掉舊檔
"""
import hashlib, json, os, sys

sys.path.insert(0, os.path.dirname(__file__))
from sing import TEMPO, syllables, tokens   # noqa: E402  跟照譜唱用同一套斷字和速度

OUT = 'audio/sing-svs'
VERSION = 'v1'
SETTINGS = {'steps': 32, 'cfg': 3, 'vox_gain': 1.0, 'acc_gain': 0.3}


def part(word, i, k):
    """多音節的字唱到第 i 個音節時，要唱哪個字、是不是這個字的開頭（E-I-E-I-O 這種拆成一個一個字母）"""
    if '-' in word:
        n = 0
        for p in [x for x in word.split('-') if x]:
            c = syllables(p)
            if i < n + c:
                return p, i == n
            n += c
    return word, i == 0


def segments(song):
    """每一句一段：[(開始秒數, 字, 音高, 長度, 種類)]；種類 1 = 空白、2 = 新的字、3 = 同一個字拉到下一個音"""
    english = song['kind'] == 'en-song'
    lines = song['sing'] or song['lines']
    beat = 60 / (song['bpm'] * TEMPO)
    allm = [m for line in song['notes'] for m, _ in line]
    shift = -12 * round((sum(allm) / len(allm) - 67) / 12)   # 和 sing.py 一樣移到 G4 附近
    gap = beat * .5
    pad = min(.3, gap * .6)
    t, segs = .6, []
    for line, notes in zip(lines, song['notes']):
        words, pitch, dur, kind = ['<SP>'], [0], [pad], [1]
        last = None
        for tok, (m, b) in zip(tokens(line, english), notes):
            word, first = (last, False) if tok is None else part(*tok)
            last = word
            words.append(word)
            kind.append(2 if first else 3)
            pitch.append(m + shift)
            dur.append(round(b * beat, 3))
        tail = round(max(.02, min(.1, gap - pad - .02)), 3)
        words.append('<SP>'); pitch.append(0); dur.append(tail); kind.append(1)
        start = t - pad
        segs.append({'time': [round(start * 1000), round((start + sum(dur)) * 1000)],
                     'words': words, 'pitch': pitch, 'dur': [round(x, 3) for x in dur], 'type': kind})
        t += sum(b for _, b in notes) * beat + gap
    return segs


def plan(songs, sung):
    jobs = []
    for s in songs:
        if s['id'] not in sung:
            continue
        src = sung[s['id']]['file']
        segs = segments(s)
        lang = 'English' if s['kind'] == 'en-song' else 'Mandarin'
        h = hashlib.sha1(json.dumps([VERSION, src, segs, SETTINGS], ensure_ascii=False).encode()).hexdigest()[:8]
        jobs.append({'id': s['id'], 'file': f"{s['id']}-{h}.mp3", 'lang': lang, 'segments': segs,
                     'acc': 'audio/sing/stems/' + src[:-4] + '-acc.mp3', **SETTINGS})
    return jobs


def main():
    songs = json.load(open(sys.argv[1], encoding='utf-8'))
    sung = json.load(open('audio/sing/index.json', encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    jobs = plan(songs, sung)
    if len(sys.argv) > 2 and sys.argv[2] == '--plan':
        only = set(filter(None, sys.argv[4].split(','))) if len(sys.argv) > 4 else None
        todo = [j for j in jobs if not os.path.exists(os.path.join(OUT, j['file'])) and (not only or j['id'] in only)]
        json.dump(todo, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'{len(todo)} songs to sing')
        return
    index, keep = {}, set()
    for j in jobs:
        if os.path.exists(os.path.join(OUT, j['file'])):
            index[j['id']] = {'file': j['file'], 'times': sung[j['id']]['times']}
            keep.add(j['file'])
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(OUT, f))
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as fp:
        json.dump(index, fp, ensure_ascii=False, indent=0, sort_keys=True)
    print(len(index), 'songs sung by the AI singer')


if __name__ == '__main__':
    main()
