"""試聽：37 個注音符號用幾種方法念，再用語音辨識（Whisper）檢查念得對不對。
結果放在 listen/zhuyin/（網址 /listen/zhuyin/），爸爸媽媽聽了選一種。
  now      現在 App 裡的（MiniMax 大姊姊念「同音字」：ㄅ念「玻」）
  mm_sym   MiniMax 大姊姊直接念符號本身（「ㄅ」）
  ms_sym   微軟曉臻（台灣）直接念符號本身
  ms_char  微軟曉臻（台灣）念同音字
"""
import asyncio, html, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(__file__))
import minimax_voice as mv   # noqa: E402

OUT = 'listen/zhuyin'
PY = {'ㄅ': 'bo', 'ㄆ': 'po', 'ㄇ': 'mo', 'ㄈ': 'fo', 'ㄉ': 'de', 'ㄊ': 'te', 'ㄋ': 'ne', 'ㄌ': 'le', 'ㄍ': 'ge', 'ㄎ': 'ke',
      'ㄏ': 'he', 'ㄐ': 'ji', 'ㄑ': 'qi', 'ㄒ': 'xi', 'ㄓ': 'zhi', 'ㄔ': 'chi', 'ㄕ': 'shi', 'ㄖ': 'ri', 'ㄗ': 'zi', 'ㄘ': 'ci',
      'ㄙ': 'si', 'ㄧ': 'yi', 'ㄨ': 'wu', 'ㄩ': 'yu', 'ㄚ': 'a', 'ㄛ': 'o', 'ㄜ': 'e', 'ㄝ': 'ê', 'ㄞ': 'ai', 'ㄟ': 'ei',
      'ㄠ': 'ao', 'ㄡ': 'ou', 'ㄢ': 'an', 'ㄣ': 'en', 'ㄤ': 'ang', 'ㄥ': 'eng', 'ㄦ': 'er'}
KINDS = {'now': '現在的', 'mm_sym': 'MiniMax 大姊姊念符號', 'ms_sym': '微軟曉臻念符號', 'ms_char': '微軟曉臻念同音字'}


def symbols():
    src = open('js/words.js', encoding='utf-8').read()
    return re.findall(r"\{ z: '(.)', say: '(.)'", src)


def norm(src, dst):
    mv.save(open(src, 'rb').read(), dst)


async def ms(text, path):
    import edge_tts
    await edge_tts.Communicate(text, 'zh-TW-HsiaoChenNeural', rate='-10%').save('/tmp/ms.mp3')
    norm('/tmp/ms.mp3', path)


def record():
    os.makedirs(OUT, exist_ok=True)
    idx = json.load(open('audio/index.json', encoding='utf-8'))
    for z, c in symbols():
        n = PY[z]
        jobs = {'now': lambda: subprocess.run(['cp', 'audio/' + idx[c], f'{OUT}/{n}-now.mp3'], check=True),
                'mm_sym': lambda: mv.save(mv.say(z), f'{OUT}/{n}-mm_sym.mp3'),
                'ms_sym': lambda: asyncio.run(ms(z, f'{OUT}/{n}-ms_sym.mp3')),
                'ms_char': lambda: asyncio.run(ms(c, f'{OUT}/{n}-ms_char.mp3'))}
        for k, f in jobs.items():
            try:
                f()
            except Exception as e:
                print('FAIL', z, k, str(e)[:200])


def check():
    from faster_whisper import WhisperModel
    from pypinyin import lazy_pinyin
    m = WhisperModel('medium', device='cpu', compute_type='int8')
    res = {}
    for z, c in symbols():
        n = PY[z]
        for k in KINDS:
            f = f'{OUT}/{n}-{k}.mp3'
            if not os.path.exists(f):
                continue
            subprocess.run(['ffmpeg', '-v', 'quiet', '-y', '-i', f, '-af', 'adelay=500,apad=pad_dur=1', '-ar', '16000', '/tmp/x.wav'])
            segs, _ = m.transcribe('/tmp/x.wav', language='zh', beam_size=5)
            t = ''.join(s.text for s in segs).strip()
            heard = ' '.join(lazy_pinyin(re.sub(r'[^一-鿿]', '', t)))
            res[f'{n}-{k}'] = {'text': t, 'py': heard}
            print(z, k, t, heard, flush=True)
    json.dump(res, open(f'{OUT}/check.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def page():
    chk = json.load(open(f'{OUT}/check.json', encoding='utf-8')) if os.path.exists(f'{OUT}/check.json') else {}
    rows = []
    for z, c in symbols():
        n = PY[z]
        cells = []
        for k in KINDS:
            f = f'{n}-{k}.mp3'
            if not os.path.exists(f'{OUT}/{f}'):
                cells.append('<td>—</td>')
                continue
            h = chk.get(f'{n}-{k}', {})
            ok = h.get('py', '').split()[:1] == [n.replace('ê', 'ei')] or h.get('py', '') == n
            cells.append(f'<td><button onclick="new Audio(\'{f}\').play()">▶</button> '
                         f'<small class="{"ok" if ok else "no"}">{html.escape(h.get("text", ""))}</small></td>')
        rows.append(f'<tr><th>{z}<small>{c}・{n}</small></th>{"".join(cells)}</tr>')
    head = ''.join(f'<th>{v}</th>' for v in KINDS.values())
    open(f'{OUT}/index.html', 'w', encoding='utf-8').write(f'''<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>注音試聽</title>
<style>body{{font:18px system-ui;margin:12px;background:#fffdf5}}table{{border-collapse:collapse;width:100%}}
td,th{{border:1px solid #ddd;padding:6px;text-align:center}}th small{{display:block;color:#888;font-size:12px}}
button{{font-size:22px;border-radius:12px;border:0;background:#ffd43b;padding:4px 12px}}
small.ok{{color:#2b8a3e}}small.no{{color:#c92a2a}}</style>
<h2>注音符號：哪一種念法最標準？</h2><p>綠字＝語音辨識聽到的跟標準一樣，紅字＝不一樣（只是參考，請用耳朵聽）</p>
<table><tr><th>符號</th>{head}</tr>{"".join(rows)}</table>''')


if __name__ == '__main__':
    {'record': record, 'check': check, 'page': page}[sys.argv[1]]()
