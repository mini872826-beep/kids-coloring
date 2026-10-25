"""兒歌「原本旋律＋自然歌聲」：拿 tools/sing.py 唱好的人聲（音高、節拍都照歌譜，跟字幕對得上），
在 Kaggle 免費 GPU 上用 Seed-VC 只把聲音換成自然的人聲，再跟八音盒伴奏混在一起。
旋律和時間完全不變，所以 audio/sing/index.json 的 times 可以直接拿來亮字幕。
輸出 audio/sing-vc/<id>-<hash>.mp3，index.json 記 {id: {file, times}}。
用法：python tools/sing_vc.py songs.json --plan jobs.json [id,id]   列出還沒做的（交給 tools/kaggle_svc/kaggle.sh）
      python tools/sing_vc.py songs.json                           整理 index.json、刪掉舊檔
"""
import hashlib, json, os, sys

OUT = 'audio/sing-vc'
VERSION = 'v1'
# 要模仿的歌聲（Kaggle 上會先把伴奏去掉，只留人聲當範本）
REF = {
    'song': {'path': 'audio/sing-ai/little-star-new-beeee6d3.mp3', 'sep': True},
    'en-song': {'path': 'audio/sing-ai/en-twinkle-new-191155e6.mp3', 'sep': True},
}
SETTINGS = {'steps': 40, 'cfg': 0.7, 'vox_gain': 1.0, 'acc_gain': 0.35}


def plan(songs, sung, refs=REF):
    jobs = []
    for s in songs:
        if s['kind'] not in refs or s['id'] not in sung:
            continue
        src = sung[s['id']]['file']
        ref = refs[s['kind']]
        h = hashlib.sha1(json.dumps([VERSION, src, ref, SETTINGS]).encode()).hexdigest()[:8]
        jobs.append({'id': s['id'], 'file': f"{s['id']}-{h}.mp3", 'vox': 'audio/sing/stems/' + src[:-4] + '-vox.mp3',
                     'acc': 'audio/sing/stems/' + src[:-4] + '-acc.mp3', 'ref': ref, **SETTINGS})
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
        print(f'{len(todo)} songs to convert')
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
    print(len(index), 'songs with natural voice')


if __name__ == '__main__':
    main()
