"""小朋友歌聲試聽：
  python tools/kidvoice/trial.py refs       用 MiniMax 做幾個小朋友說話的範本 → listen/kid/ref-*.mp3
  python tools/kidvoice/trial.py jobs X     列出要在 Kaggle 換聲音的歌（寫到 X）
  python tools/kidvoice/trial.py page       做試聽網頁 listen/kid/index.html
"""
import json, os, sys, urllib.request

OUT = 'listen/kid'
SONGS = [('en-twinkle', 'Twinkle Twinkle Little Star'), ('en-rain', 'Rain Rain Go Away'), ('en-row', 'Row Row Row Your Boat')]
TEXT = ("Hi! My name is Lily, and I am six years old. I love singing songs with my friends! "
        "Twinkle, twinkle, little star. Come on, let's sing together, one, two, three!")
REFS = {'playful': ('MiniMax English_PlayfulGirl（卡通、兒童節目的女孩）', 'English_PlayfulGirl'),
        'softgirl': ('MiniMax English_Soft-spokenGirl（溫柔可愛的女孩）', 'English_Soft-spokenGirl'),
        'design': ('MiniMax 聲音設計：6 歲美國小女孩', None)}
DESIGN = ('A cheerful six-year-old American little girl, a real young child with a high, bright, sweet voice, '
          'speaking clearly and happily, full of energy, like singing nursery rhymes in kindergarten.')


def post(path, body):
    req = urllib.request.Request('https://api.minimax.io' + path, data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + os.environ['MINIMAX_API_KEY'].strip(),
                                          'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req, timeout=120).read())


def refs():
    os.makedirs(OUT, exist_ok=True)
    for key, (_, vid) in REFS.items():
        path = f'{OUT}/ref-{key}.mp3'
        if os.path.exists(path):
            continue
        try:
            if vid is None:
                r = post('/v1/voice_design', {'prompt': DESIGN, 'preview_text': TEXT})
                vid = r.get('voice_id')
                print('design', json.dumps(r.get('base_resp')), vid)
            r = post('/v1/t2a_v2', {'model': 'speech-02-hd', 'text': TEXT, 'stream': False,
                                    'voice_setting': {'voice_id': vid, 'speed': 1.0},
                                    'audio_setting': {'format': 'mp3', 'sample_rate': 32000}})
            open(path, 'wb').write(bytes.fromhex(r['data']['audio']))
            print('ok', key)
        except Exception as e:
            print('FAILED', key, str(e)[:200])


def jobs(dest):
    ai = json.load(open('audio/sing-svs/index.json', encoding='utf-8'))
    sung = json.load(open('audio/sing/index.json', encoding='utf-8'))
    out = []
    for sid, _ in SONGS:
        for key in REFS:
            if os.path.exists(f'{OUT}/ref-{key}.mp3'):
                out.append({'vox': 'audio/sing-svs/stems/' + ai[sid]['file'],
                            'acc': 'audio/sing/stems/' + sung[sid]['file'][:-4] + '-acc.mp3',
                            'ref': f'{OUT}/ref-{key}.mp3', 'out': f'{sid}-{key}.mp3'})
    json.dump(out, open(dest, 'w'), ensure_ascii=False)
    print(len(out), 'jobs')


def page():
    ai = json.load(open('audio/sing-svs/index.json', encoding='utf-8'))
    cards = []
    for sid, title in SONGS:
        rows = [f'<div class="row"><b>現在的 AI 歌手</b><audio controls preload="none" src="../../audio/sing-svs/{ai[sid]["file"]}"></audio></div>']
        for key, (label, _) in REFS.items():
            if os.path.exists(f'{OUT}/{sid}-{key}.mp3'):
                rows.append(f'<div class="row"><b>小朋友：{label}</b><audio controls preload="none" src="{sid}-{key}.mp3"></audio></div>')
        cards.append(f'<div class="card"><h2>{title}</h2>{"".join(rows)}</div>')
    refs_html = ''.join(f'<div class="row"><b>{label}</b><audio controls preload="none" src="ref-{k}.mp3"></audio></div>'
                        for k, (label, _) in REFS.items() if os.path.exists(f'{OUT}/ref-{k}.mp3'))
    html = f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>小朋友歌聲試聽</title>
<style>:root{{--bg:#f4f8ff;--card:#fff;--ink:#1f2a44;--sub:#5b6785}}
@media (prefers-color-scheme: dark){{:root{{--bg:#111827;--card:#1f2937;--ink:#f3f4f6;--sub:#9ca3af}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 -apple-system,"PingFang TC","Noto Sans TC",sans-serif}}
main{{max-width:640px;margin:0 auto;padding:20px 16px 48px}} h1{{font-size:24px;margin:8px 0}} p{{color:var(--sub)}}
.card{{background:var(--card);border-radius:16px;padding:14px 16px;margin:0 0 14px;box-shadow:0 2px 8px rgba(0,0,0,.06)}}
.card h2{{font-size:19px;margin:0 0 6px}} .row{{margin:10px 0}} .row b{{display:block;font-size:15px;margin-bottom:4px}} audio{{width:100%}}</style>
</head><body><main><h1>小朋友歌聲試聽</h1>
<p>同一首歌：上面是現在的 AI 歌手，下面是把聲音換成小朋友（音準、節奏不變）。聽聽看哪個最像小朋友、最好聽。</p>
{"".join(cards)}<div class="card"><h2>小朋友說話的範本（AI 模仿的對象）</h2>{refs_html}</div></main></body></html>'''
    open(f'{OUT}/index.html', 'w', encoding='utf-8').write(html)


if __name__ == '__main__':
    {'refs': refs, 'jobs': lambda: jobs(sys.argv[2]), 'page': page}[sys.argv[1]]()
