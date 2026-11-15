"""讀音自我修正：讀音檢查（tools/hear_check.py）標出可疑的錄音，這裡自己想辦法錄出念對的版本。

每一段可疑的錄音：
  1. 先「看」：這句話寫什麼、照意思應該怎麼念（台灣讀音，hear_check.expected_zh；注音直接換成拼音）。
  2. 錄幾個不同的版本：
       中文（MiniMax 大姊姊）：把念錯的字指定讀音／整句每個字都指定讀音，各錄一次
       注音（微軟）：曉臻、曉雨，念代表字或另一個同音字
  3. 用兩隻「耳朵」聽每個版本：
       wav2vec2（只聽聲音，念錯就寫錯字）＋ Whisper（會「理解」整句話，聽得懂上下文）
     兩隻耳朵聽到的讀音都跟應有的讀音比，算分數。
  4. 明顯比原本好（而且夠好）就換上：檔案放 audio/fx-*.mp3，記在 tools/voice/override.json，
     gen_voice.py 之後重建清單也會用它；挑不出更好的就留原本的，寫在報告裡。
結果：listen/check/fix.json、listen/check/fix.html（換之前／之後都可以點來聽）

用法：MINIMAX_API_KEY=... python tools/hear_fix.py [最多幾段]
"""
import asyncio, hashlib, html, json, os, re, shutil, sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import gen_voice as gv      # noqa: E402
import hear_check as hc     # noqa: E402
import minimax_voice as mv  # noqa: E402

OUT = 'listen/check'
OVR = 'tools/voice/override.json'
TMP = '/tmp/fx'
# 注音符號的另一個同音字（代表字念不好時試試看）
ALT = {'ㄓ': ['之', '蜘'], 'ㄔ': ['痴', '嗤'], 'ㄕ': ['師', '獅'], 'ㄖ': ['日'], 'ㄗ': ['資', '滋'], 'ㄘ': ['疵', '雌'],
       'ㄙ': ['思', '絲'], 'ㄩ': ['迂', '淤'], 'ㄜ': ['鵝', '額'], 'ㄝ': ['欸'], 'ㄨ': ['烏', '屋'], 'ㄧ': ['衣', '一'],
       'ㄈ': ['佛'], 'ㄌ': ['勒'], 'ㄋ': ['訥'], 'ㄤ': ['骯'], 'ㄥ': ['鞥'], 'ㄟ': ['誒']}
VOICES = ['zh-TW-HsiaoChenNeural', 'zh-TW-HsiaoYuNeural']


class Whisper:
    def __init__(self):
        from faster_whisper import WhisperModel
        self.m = WhisperModel('small', device='cpu', compute_type='int8')

    def __call__(self, x):
        segs, _ = self.m.transcribe(x, language='zh', beam_size=5)
        return ''.join(s.text for s in segs)


def score(ears, exp, path, carrier):
    """兩隻耳朵各聽一次，跟應有的讀音比，回傳 (分數 0~1, 兩隻耳朵聽到的)"""
    x = hc.load(path)
    short = len(exp) <= 2
    if short:
        x = np.concatenate([carrier, x])
    want = [hc.tw(p) for p in exp]
    total, heard = 0, []
    for ear in ears:
        t = ear(x)
        _, hp = hc.heard_py(t)
        got = [hc.tw(p) for p in hp]
        if short:   # 去掉前面的「答案是」
            got = got[3:] if len(got) > len(want) + 1 else got[-len(want):]
        r = __import__('difflib').SequenceMatcher(a=want, b=got, autojunk=False).ratio() if want else 1
        total += r
        heard.append(t)
    return total / len(ears), heard


def mm_candidates(key, rep):
    """MiniMax 的幾個版本：(說明, 指定讀音清單)"""
    base = gv.mm_fix(key)
    chars, exp = hc.expected_zh(key)
    out = []
    bad = {(s['char'], s['want']) for s in rep.get('poly', []) + rep.get('subs', []) if s.get('char') and s.get('want')}
    if bad:
        out.append(('念錯的字指定讀音', base + [f'{c}/({p})' for c, p in sorted(bad)]))
    # 整句每個字都指定讀音（一段一段的漢字）
    runs, k = [], 0
    for m in re.finditer(r'[一-鿿]+', key):
        w = m.group()
        runs.append(f'{w}/' + ''.join(f'({p})' for p in exp[k:k + len(w)]))
        k += len(w)
    if all('None' not in r for r in runs):
        out.append(('整句每個字都指定讀音', runs))
        out.append(('整句指定讀音（再錄一次）', runs))
    return out


async def edge(text, voice, path):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate=gv.ZY_RATE, pitch=gv.PITCH).save(path)
    gv.trim(path)
    gv.loud(path)


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 150
    rep = json.load(open(f'{OUT}/report.json', encoding='utf-8'))
    idx = json.load(open('audio/index.json', encoding='utf-8'))
    ovr = json.load(open(OVR, encoding='utf-8')) if os.path.exists(OVR) else {}
    sus = [t for t, r in rep.items() if r.get('kind') == 'zy' and r.get('err', 0) > .34]
    sus += [t for t, r in rep.items() if r.get('kind') == 'zh' and not re.search(r'\d', t)
            and (r.get('poly') or r.get('err', 0) > .34)]
    sus = [t for t in sus if t in idx][:limit]
    print(len(sus), 'suspects', flush=True)
    ears = [hc.Ear(hc.ZH_MODEL), Whisper()]
    carrier = hc.load('audio/' + idx[hc.CARRIER])[:-3200]
    os.makedirs(TMP, exist_ok=True)
    log = []
    for n, key in enumerate(sus):
        zy = hc.kind(key) == 'zy'
        exp = [hc.zhuyin_py(key)] if zy else hc.expected_zh(key)[1]
        cur = 'audio/' + idx[key]
        cands = [('原本的', cur)]
        try:
            if zy:
                texts = [gv.ZY[key]] + [a for a in ALT.get(key, []) if a != gv.ZY[key]]
                for v in VOICES:
                    for t in texts:
                        p = f'{TMP}/{n}-{len(cands)}.mp3'
                        asyncio.run(edge(t, v, p))
                        cands.append((f'{v.split("-")[2][:-6]} 念「{t}」', p))
            elif mv.KEY:
                for why, fix in mm_candidates(key, rep[key]):
                    p = f'{TMP}/{n}-{len(cands)}.mp3'
                    mv.save(mv.say(key, fix), p)
                    cands.append((why, p))
        except Exception as e:
            print('record failed', key, str(e)[:200], flush=True)
        scored = []
        for why, p in cands:
            s, heard = score(ears, exp, p, carrier)
            scored.append({'why': why, 'path': p, 'score': round(s, 3), 'heard': heard})
        best = max(scored, key=lambda c: c['score'])   # 同分時 max 取第一個（原本的）
        now = scored[0]
        take = best is not now and best['score'] >= now['score'] + .2 and best['score'] >= .75
        entry = {'key': key, 'want': ' '.join(p or '?' for p in exp), 'cands': scored, 'take': take}
        if take:
            name = 'fx-' + hashlib.sha1(f'{key}|{best["why"]}|{best["path"]}'.encode()).hexdigest()[:12] + '.mp3'
            shutil.copy(best['path'], 'audio/' + name)
            ovr[key] = {'file': name, 'was': ovr.get(key, {}).get('was', idx[key]), 'why': best['why']}
            idx[key] = name
            entry['file'] = name
        log.append(entry)
        print(n, key[:20], now['score'], '->', best['score'], best['why'] if take else '(keep)', flush=True)
    json.dump(ovr, open(OVR, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(idx, open('audio/index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    # 報告：每個版本都留一份可以聽
    os.makedirs(f'{OUT}/fx', exist_ok=True)
    for f in os.listdir(f'{OUT}/fx'):
        os.remove(f'{OUT}/fx/{f}')
    rows = []
    for i, e in enumerate(log):
        cells = []
        for j, c in enumerate(e['cands']):
            f = f'fx/{i}-{j}.mp3'
            shutil.copy(c['path'], f'{OUT}/{f}')
            c['path'] = f
            mark = ' ✅' if (e['take'] and e.get('file') and c is max(e['cands'], key=lambda c: c['score'])) else ''
            cells.append(f'<div><button onclick="new Audio(\'{f}\').play()">▶</button> {html.escape(c["why"])}{mark}'
                         f' <small>{c["score"]}｜{html.escape(" / ".join(c["heard"]))}</small></div>')
        rows.append(f'<tr><td><b>{html.escape(e["key"])}</b><br><small>{e["want"]}</small></td><td>{"".join(cells)}</td></tr>')
    json.dump(log, open(f'{OUT}/fix.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    took = sum(e['take'] for e in log)
    open(f'{OUT}/fix.html', 'w', encoding='utf-8').write(f'''<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>讀音自我修正</title>
<style>body{{font:16px system-ui;margin:12px;background:#fffdf5}}table{{border-collapse:collapse;width:100%}}
td{{border:1px solid #ddd;padding:6px;vertical-align:top}}button{{font-size:18px;border:0;border-radius:10px;background:#ffd43b;padding:2px 10px}}
small{{color:#666}}</style><h2>讀音自我修正</h2>
<p>可疑的 {len(log)} 段，各錄了幾個版本、用兩隻耳朵聽；換上 {took} 段（✅）。分數 1 = 兩隻耳朵聽到的都跟應有的讀音一樣。</p>
<table>{"".join(rows)}</table>''')
    print('took', took, 'of', len(log))


if __name__ == '__main__':
    main()
