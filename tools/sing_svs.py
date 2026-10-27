"""兒歌「AI 歌手照歌譜唱」：把每首歌的歌詞、音高、每個音多長交給 SoulX-Singer（Kaggle 免費 GPU），
它照譜直接唱出自然的歌聲，再配上 tools/sing.py 做的八音盒伴奏。
時間軸和 tools/sing.py 一樣（都由 tools/accomp.py 決定），所以 audio/sing/index.json 的 times 可以直接亮字幕。
Kaggle 唱好的人聲放 audio/sing-svs/stems/，這裡再用 tools/tighten.py 對拍（audio/sing-svs/tight/），
跟伴奏混成成品 audio/sing-svs/<id>-<hash>-t1.mp3，index.json 記 {id: {file, times}}。
用法：python tools/sing_svs.py songs.json --plan jobs.json [id,id]   列出還沒做的（交給 tools/kaggle_svs/kaggle.sh）
      python tools/sing_svs.py songs.json                           整理 index.json、刪掉舊檔
"""
import hashlib, json, math, os, sys

sys.path.insert(0, os.path.dirname(__file__))
import accomp                                # noqa: E402  伴奏和時間軸
from sing import syllables, tokens            # noqa: E402  跟照譜唱用同一套斷字
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'kaggle_svs'))
from phonemes import FIX                      # noqa: E402  多音字讀音

OUT = 'audio/sing-svs'
VERSION = 'v4'   # v4：英文多音節的字一個音節唱一個音（v3：範本錄音剪到標記的那段）
SETTINGS = {'steps': 32, 'cfg': 3, 'vox_gain': 1.0, 'acc_gain': 0.85}


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
    """每一句一段：字、音高、長度、種類（1 = 空白、2 = 新的字、3 = 同一個字拉到下一個音）。
    時間軸和 tools/accomp.py 的伴奏一樣；句子之間沒空檔時，最後一個音收短一點讓歌手換氣。"""
    english = song['kind'] == 'en-song'
    lines = song['sing'] or song['lines']
    beat, starts, secs, _ = accomp.timeline(song)
    allm = [m for line in song['notes'] for m, _ in line]
    shift = -12 * round((sum(allm) / len(allm) - 67) / 12)   # 和 sing.py 一樣移到 G4 附近
    ends = secs[1:] + [secs[-1] + math.ceil(sum(b for _, b in song['notes'][-1]) / accomp.meter(song) - 1e-6)
                       * accomp.meter(song) * beat]
    segs, prev_end = [], 0
    for line, notes, t, slot_end in zip(lines, song['notes'], secs, ends):
        pad = max(.02, min(.25, t - prev_end))      # 前面留一點空白，但不要蓋到上一句
        words, pitch, dur, kind = ['<SP>'], [0], [pad], [1]
        last = None
        for tok, (m, b) in zip(tokens(line, english), notes):
            if tok is None:                          # ~：前一個音拉長
                word, kind_ = last, 3
            else:
                word, first = part(*tok)
                kind_ = 2 if first else 3
                # 英文多音節的字（Twin-kle）：每個音節各唱一個音，寫成 Twinkle#0/2、Twinkle#1/2，
                # tools/kaggle_svs/phonemes.py 會把發音切開。不然 AI 會照說話習慣把後面的音節唱早（搶拍）
                if english and word == tok[0] and tok[2] > 1:
                    word, kind_ = f'{tok[0]}#{tok[1]}/{tok[2]}', 2
            last = word
            words.append(word)
            pitch.append(m + shift + accomp.transpose(song))
            dur.append(b * beat)
            kind.append(kind_)
        # 下一句前面也要留 0.25 秒空白，再加上換氣的時間：不夠就讓最後一個音收短一點
        room = slot_end - .25 - (t + sum(dur[1:]))
        breath = min(.3 * beat, dur[-1] * .3)
        if room < breath:
            dur[-1] -= min(breath - room, dur[-1] * .6)
        tail = max(.02, slot_end - .25 - (t + sum(dur[1:])))
        words.append('<SP>'); pitch.append(0); dur.append(tail); kind.append(1)
        start = t - pad
        dur = [round(x, 3) for x in dur]
        segs.append({'time': [round(start * 1000), round((start + sum(dur)) * 1000)],
                     'words': words, 'pitch': pitch, 'dur': dur, 'type': kind})
        prev_end = start + sum(dur)
    return segs


def plan(songs, sung):
    jobs = []
    for s in songs:
        if s['id'] not in sung:
            continue
        src = sung[s['id']]['file']
        segs = segments(s)
        lang = 'English' if s['kind'] == 'en-song' else 'Mandarin'
        # 這首歌用到的多音字讀音也算進去：改了讀音，只有用到那個字的歌會重唱
        lyrics = ''.join(s['sing'] or s['lines'])
        fixes = sorted((w, py) for w, py in FIX.items() if w in lyrics)
        h = hashlib.sha1(json.dumps([VERSION, src, segs, SETTINGS] + ([fixes] if fixes else []),
                                    ensure_ascii=False).encode()).hexdigest()[:8]
        jobs.append({'id': s['id'], 'file': f"{s['id']}-{h}.mp3", 'lang': lang, 'segments': segs,
                     'acc': 'audio/sing/stems/' + src[:-4] + '-acc.mp3', **SETTINGS})
    return jobs


TIGHT_TAG = '-t1'   # 對拍的方法改了就換號碼：成品換新檔名，平板上存的舊歌才不會一直用


def finish(song, j):
    """人聲對拍（tools/tighten.py），再跟伴奏混成成品。回傳成品檔名"""
    import subprocess, tempfile
    import tighten
    stem, tight = os.path.join(OUT, 'stems', j['file']), os.path.join(OUT, 'tight', j['file'])
    final = j['file'][:-4] + TIGHT_TAG + '.mp3'
    if not os.path.exists(tight):
        os.makedirs(os.path.dirname(tight), exist_ok=True)
        with tempfile.TemporaryDirectory() as d:
            a, b = os.path.join(d, 'a.wav'), os.path.join(d, 'b.wav')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', stem, '-ar', '24000', '-ac', '1', a], check=True)
            n = tighten.tighten(song, a, b)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', b, '-b:a', '96k', tight], check=True)
        print('tighten', j['id'], n, 'notes')
    if not os.path.exists(os.path.join(OUT, final)):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tight, '-i', j['acc'], '-filter_complex',
                        f"[0:a]loudnorm=I=-17:TP=-2,aresample=44100,volume={j['vox_gain']}[a];"
                        f"[1:a]loudnorm=I=-23:TP=-2,aresample=44100,volume={j['acc_gain']}[b];"
                        '[a][b]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.9',
                        '-ac', '1', '-b:a', '96k', os.path.join(OUT, final)], check=True)
    return final


def main():
    songs = json.load(open(sys.argv[1], encoding='utf-8'))
    sung = json.load(open('audio/sing/index.json', encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    jobs = plan(songs, sung)
    if len(sys.argv) > 2 and sys.argv[2] == '--plan':
        only = set(filter(None, sys.argv[4].split(','))) if len(sys.argv) > 4 else None
        # 只要「只有人聲」的版本（Kaggle 唱的）在，成品就在這裡對拍、混音
        todo = [j for j in jobs if not os.path.exists(os.path.join(OUT, 'stems', j['file']))
                and (not only or j['id'] in only)]
        json.dump(todo, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'{len(todo)} songs to sing')
        return
    old = json.load(open(os.path.join(OUT, 'index.json'), encoding='utf-8')) if os.path.exists(os.path.join(OUT, 'index.json')) else {}
    byid = {x['id']: x for x in songs}
    index, keep = {}, set()
    for j in jobs:
        if os.path.exists(os.path.join(OUT, 'stems', j['file'])):
            final = finish(byid[j['id']], j)
            index[j['id']] = {'file': final, 'times': sung[j['id']]['times']}
            keep |= {j['file'], final}
        elif j['id'] in old and os.path.exists(os.path.join(OUT, old[j['id']]['file'])):
            # 新的還沒做好（或沒下載到）：先留著舊的，不要讓這首歌沒有 AI 歌手
            index[j['id']] = old[j['id']]
            keep.add(old[j['id']]['file'])
            keep.add(old[j['id']]['file'].replace(TIGHT_TAG, ''))
            print('keep old:', j['id'])
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(OUT, f))
    for sub in ('stems', 'tight'):                # 只有人聲的版本、對好拍的人聲（檔名跟 Kaggle 的成品一樣）
        d = os.path.join(OUT, sub)
        for f in os.listdir(d) if os.path.isdir(d) else []:
            if f not in keep:
                os.remove(os.path.join(d, f))
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as fp:
        json.dump(index, fp, ensure_ascii=False, indent=0, sort_keys=True)
    print(len(index), 'songs sung by the AI singer')


if __name__ == '__main__':
    main()
