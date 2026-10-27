"""英文兒歌換成小朋友的歌聲（爸爸試聽後選的「溫柔可愛的女孩」，範本 tools/voice/kid-sing-ref.mp3）：
AI 歌手（tools/sing_svs.py）唱好、對好拍的人聲 → Kaggle 上的 Seed-VC 換成小朋友的音色（音高、節奏不變）
→ 這裡再對一次拍（tools/tighten.py）、配上伴奏 → audio/sing-kid/<id>-<hash>-t1.mp3，index.json 記 {id: {file, times}}。
用法：python tools/sing_kid.py songs.json --plan jobs.json   列出還沒換的（交給 tools/kidvoice/kaggle.sh，輸出到 audio/sing-kid/stems）
      python tools/sing_kid.py songs.json                    對拍、混音、整理 index.json
"""
import hashlib, json, os, sys

sys.path.insert(0, os.path.dirname(__file__))
import sing_svs   # noqa: E402

OUT = 'audio/sing-kid'
REF = 'tools/voice/kid-sing-ref.mp3'
VERSION = 'v1'


def plan(songs):
    ai = json.load(open('audio/sing-svs/index.json', encoding='utf-8'))
    sung = json.load(open('audio/sing/index.json', encoding='utf-8'))
    ref = hashlib.sha1(open(REF, 'rb').read()).hexdigest()[:8]
    jobs = []
    for j in sing_svs.plan(songs, sung):
        s = next(x for x in songs if x['id'] == j['id'])
        if s['kind'] != 'en-song' or j['id'] not in ai:
            continue
        tight = os.path.join(sing_svs.OUT, 'tight', j['file'])
        if not os.path.exists(tight):
            continue
        h = hashlib.sha1(f'{VERSION}|{j["file"]}|{ref}'.encode()).hexdigest()[:8]
        jobs.append({'id': j['id'], 'vox': tight, 'ref': REF, 'out': f"{j['id']}-{h}.mp3",
                     'acc': j['acc'], 'vox_gain': j['vox_gain'], 'acc_gain': j['acc_gain']})
    return jobs


def main():
    songs = json.load(open(sys.argv[1], encoding='utf-8'))
    sung = json.load(open('audio/sing/index.json', encoding='utf-8'))
    jobs = plan(songs)
    os.makedirs(os.path.join(OUT, 'stems'), exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[2] == '--plan':
        todo = [{k: j[k] for k in ('vox', 'ref', 'out')} for j in jobs
                if not os.path.exists(os.path.join(OUT, 'stems', j['out']))]
        json.dump(todo, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'{len(todo)} songs to turn into a child voice')
        return
    byid = {x['id']: x for x in songs}
    old = json.load(open(os.path.join(OUT, 'index.json'), encoding='utf-8')) if os.path.exists(os.path.join(OUT, 'index.json')) else {}
    index, keep = {}, set()
    for j in jobs:
        if os.path.exists(os.path.join(OUT, 'stems', j['out'])):
            final = sing_svs.finish(byid[j['id']], dict(j, file=j['out']), out=OUT)
            index[j['id']] = {'file': final, 'times': sung[j['id']]['times']}
            keep |= {j['out'], final}
        elif j['id'] in old and os.path.exists(os.path.join(OUT, old[j['id']]['file'])):
            index[j['id']] = old[j['id']]           # 新的還沒好：先留舊的
            keep |= {old[j['id']]['file'], old[j['id']]['file'].replace(sing_svs.TIGHT_TAG, '')}
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(OUT, f))
    for sub in ('stems', 'tight'):
        d = os.path.join(OUT, sub)
        for f in os.listdir(d) if os.path.isdir(d) else []:
            if f not in keep:
                os.remove(os.path.join(d, f))
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as fp:
        json.dump(index, fp, ensure_ascii=False, indent=0, sort_keys=True)
    print(len(index), 'English songs in a child voice')


if __name__ == '__main__':
    main()
