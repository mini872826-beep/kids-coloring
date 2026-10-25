"""檢查每首兒歌：每一句的字（英文是音節）要剛好一個字配一個音符，不然唱出來字和旋律會對不上。
用法：python tools/check_songs.py songs.json      （有對不上的就列出來並回傳錯誤）"""
import json, os, re, sys

src = open(os.path.join(os.path.dirname(__file__), 'sing.py'), encoding='utf-8').read()
g = {}
exec(src.split('# ---------------- 錄音')[0].replace('import pyworld as pw', '').replace('import soundfile as sf', ''), g)
bad = 0
for s in json.load(open(sys.argv[1], encoding='utf-8')):
    lines = s['sing'] or s['lines']
    if len(lines) != len(s['notes']):
        print(f"{s['id']}: 有 {len(lines)} 句歌詞，但有 {len(s['notes'])} 句旋律")
        bad += 1
    for i, (l, n) in enumerate(zip(lines, s['notes'])):
        t = g['tokens'](l, s['kind'] == 'en-song')
        if len(t) != len(n):
            print(f"{s['id']} 第 {i + 1} 句「{l}」：{len(t)} 個字/音節，{len(n)} 個音符 →", [x[0] if x else '~' for x in t])
            bad += 1
print('全部對齊' if not bad else f'{bad} 句對不上')
sys.exit(1 if bad else 0)
