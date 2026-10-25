"""AI 歌手（ACE-Step）唱的兒歌：每首做兩個版本放在 audio/sing-ai/，index.json 記下檔名。
  new   ：照歌詞重新作曲（AI 自己的旋律）
  cover ：拿 audio/sing/ 裡旋律正確的版本當參考，保留原本旋律、換成自然的人聲
用法：python tools/sing_ai.py songs.json --plan jobs.json   列出還沒做的（交給 tools/kaggle_sing/kaggle.sh）
      python tools/sing_ai.py songs.json                    整理 index.json、刪掉舊檔
"""
import hashlib, json, os, sys

OUT = 'audio/sing-ai'
VERSION = 'v1'
STYLE = {
    'song': ("children's nursery rhyme for toddlers, sweet gentle young female voice singing clearly in Mandarin Chinese "
             "with a Taiwanese accent, music box, glockenspiel, soft piano, warm and cheerful", 'zh'),
    'en-song': ("classic English nursery rhyme for toddlers, sweet clear young female voice, music box, glockenspiel, "
                "soft piano, gentle, warm and cheerful", 'en'),
}


def lyrics(lines):
    blocks = [lines[i:i + 4] for i in range(0, len(lines), 4)]
    return '\n'.join(f'[verse]\n' + '\n'.join(b) for b in blocks)


def plan(songs, sung):
    jobs = []
    for s in songs:
        if s['kind'] not in STYLE or s['id'] not in sung:
            continue
        caption, lang = STYLE[s['kind']]
        lyr = lyrics(s['lines'])
        for style in ('new', 'cover'):
            src = sung[s['id']]['file'] if style == 'cover' else ''
            h = hashlib.sha1(json.dumps([VERSION, style, caption, lyr, src], ensure_ascii=False).encode()).hexdigest()[:8]
            job = {'id': s['id'], 'style': style, 'file': f"{s['id']}-{style}-{h}.mp3", 'lang': lang,
                   'caption': caption, 'lyrics': lyr, 'task': 'cover' if style == 'cover' else 'text2music'}
            if style == 'cover':
                job['src'] = src
            else:
                job['duration'] = max(30, len(s['lines']) * 6 + 12)
            jobs.append(job)
    return jobs


def main():
    songs = json.load(open(sys.argv[1], encoding='utf-8'))
    sung = json.load(open('audio/sing/index.json', encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    jobs = plan(songs, sung)
    if len(sys.argv) > 2 and sys.argv[2] == '--plan':
        todo = [j for j in jobs if not os.path.exists(os.path.join(OUT, j['file']))]
        json.dump(todo, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'{len(todo)} AI songs to make')
        return
    index, keep = {}, set()
    for j in jobs:
        if os.path.exists(os.path.join(OUT, j['file'])):
            index.setdefault(j['id'], {})[j['style']] = j['file']
            keep.add(j['file'])
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(OUT, f))
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as fp:
        json.dump(index, fp, ensure_ascii=False, indent=0, sort_keys=True)
    print(len(index), 'songs have AI versions')


if __name__ == '__main__':
    main()
