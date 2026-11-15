"""讀音檢查（AI 的耳朵）：把 audio/ 裡每一段錄音用語音辨識聽一遍，跟應該念的讀音比對，列出可疑的。

  中文：wav2vec2 的中文辨識（CTC，一個音一個字，沒有「猜句子」的語言模型，聽到「餅錢」就寫「饼钱」），
        聽到的字轉成拼音，跟應有的台灣讀音比（指定讀音 tools/voice/minimax.json ＋ 繁體多音字規則 ＋ 台灣讀音表）。
        最可疑：多音字念成它的另一個讀音（乾 gan → qian、著 zhe → zhu），這種幾乎一定是真的念錯。
  注音：學注音的發音（key 是注音本身），注音直接換成拼音來比。
  英文：wav2vec2 英文辨識，跟句子比字錯率。
結果：listen/check/report.json 和 listen/check/index.html（可以點來聽）

用法：python tools/hear_check.py [只檢查前 N 段]
"""
import difflib, json, os, re, subprocess, sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import gen_voice as gv   # noqa: E402

OUT = 'listen/check'
ZH_MODEL = 'jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn'
EN_MODEL = 'facebook/wav2vec2-large-960h-lv60-self'

# 台灣和大陸讀音不同的詞（教育部的台灣讀音）；拼音工具預設是大陸讀音
TW = {'垃圾': 'le4 se4', '星期': 'xing1 qi2', '期': 'qi2', '企鵝': 'qi4 e2', '危險': 'wei2 xian3', '微笑': 'wei2 xiao4',
      '頭髮': 'tou2 fa3', '研究': 'yan2 jiu4', '細菌': 'xi4 jun4', '擁抱': 'yong3 bao4', '寂寞': 'ji2 mo4', '質': 'zhi2',
      '暴露': 'bao4 lu4', '亞洲': 'ya3 zhou1', '友誼': 'you3 yi2', '曝光': 'pu4 guang1', '一會兒': 'yi1 hui3 er',
      '蝸牛': 'gua1 niu2', '泊': 'bo2', '鹿柴': 'lu4 zhai4', '咳咳': 'ke2 ke2', '朝辭': 'zhao1 ci2', '朝起': 'zhao1 qi3', '和': None}

ZY_INIT = {'ㄅ': 'b', 'ㄆ': 'p', 'ㄇ': 'm', 'ㄈ': 'f', 'ㄉ': 'd', 'ㄊ': 't', 'ㄋ': 'n', 'ㄌ': 'l', 'ㄍ': 'g', 'ㄎ': 'k', 'ㄏ': 'h',
           'ㄐ': 'j', 'ㄑ': 'q', 'ㄒ': 'x', 'ㄓ': 'zh', 'ㄔ': 'ch', 'ㄕ': 'sh', 'ㄖ': 'r', 'ㄗ': 'z', 'ㄘ': 'c', 'ㄙ': 's'}
ZY_FIN = {'ㄚ': 'a', 'ㄛ': 'o', 'ㄜ': 'e', 'ㄝ': 'e', 'ㄞ': 'ai', 'ㄟ': 'ei', 'ㄠ': 'ao', 'ㄡ': 'ou', 'ㄢ': 'an', 'ㄣ': 'en',
          'ㄤ': 'ang', 'ㄥ': 'eng', 'ㄦ': 'er', 'ㄧ': 'i', 'ㄨ': 'u', 'ㄩ': 'v',
          'ㄧㄚ': 'ia', 'ㄧㄛ': 'io', 'ㄧㄝ': 'ie', 'ㄧㄞ': 'iai', 'ㄧㄠ': 'iao', 'ㄧㄡ': 'iu', 'ㄧㄢ': 'ian', 'ㄧㄣ': 'in',
          'ㄧㄤ': 'iang', 'ㄧㄥ': 'ing', 'ㄨㄚ': 'ua', 'ㄨㄛ': 'uo', 'ㄨㄞ': 'uai', 'ㄨㄟ': 'ui', 'ㄨㄢ': 'uan', 'ㄨㄣ': 'un',
          'ㄨㄤ': 'uang', 'ㄨㄥ': 'ong', 'ㄩㄝ': 've', 'ㄩㄢ': 'van', 'ㄩㄣ': 'vn', 'ㄩㄥ': 'iong'}
ZY_SYM = {'ㄅ': 'bo', 'ㄆ': 'po', 'ㄇ': 'mo', 'ㄈ': 'fo', 'ㄉ': 'de', 'ㄊ': 'te', 'ㄋ': 'ne', 'ㄌ': 'le', 'ㄍ': 'ge', 'ㄎ': 'ke',
          'ㄏ': 'he', 'ㄐ': 'ji', 'ㄑ': 'qi', 'ㄒ': 'xi', 'ㄓ': 'zhi', 'ㄔ': 'chi', 'ㄕ': 'shi', 'ㄖ': 'ri', 'ㄗ': 'zi', 'ㄘ': 'ci',
          'ㄙ': 'si', 'ㄧ': 'yi', 'ㄨ': 'wu', 'ㄩ': 'yu', 'ㄝ': 'ê'}
TONE = {'ˊ': '2', 'ˇ': '3', 'ˋ': '4', '˙': '5'}


def zhuyin_py(z):
    """注音 → 拼音（ㄌㄠˇ → lao3）"""
    tone = next((TONE[c] for c in z if c in TONE), '1')
    body = ''.join(c for c in z if c not in TONE)
    if body in ZY_SYM:
        return ZY_SYM[body] + tone
    if body in ZY_FIN and body[0] not in ZY_INIT:
        f = ZY_FIN[body]
        f = {'i': 'yi', 'u': 'wu', 'v': 'yu', 'ia': 'ya', 'io': 'yo', 'ie': 'ye', 'iai': 'yai', 'iao': 'yao', 'iu': 'you',
             'ian': 'yan', 'in': 'yin', 'iang': 'yang', 'ing': 'ying', 'ua': 'wa', 'uo': 'wo', 'uai': 'wai', 'ui': 'wei',
             'uan': 'wan', 'un': 'wen', 'uang': 'wang', 'ong': 'weng', 've': 'yue', 'van': 'yuan', 'vn': 'yun',
             'iong': 'yong'}.get(f, f)
        return f + tone
    i, f = ZY_INIT.get(body[0], ''), ZY_FIN.get(body[1:], '')
    if i in ('j', 'q', 'x') and f.startswith('v'):
        f = 'u' + f[1:]
    return i + f.replace('v', 'ü') + tone


def norm(py):
    """比對用：去掉聲調、ü/v 統一"""
    return re.sub(r'\d', '', py or '').replace('ü', 'v').replace('ê', 'e')


def tw(py):
    """台灣口音聽起來一樣的算對：ㄓㄗ、ㄔㄘ、ㄕㄙ 不分，ㄣㄥ 不分（辨識模型是用大陸口音學的）"""
    p = norm(py)
    p = re.sub(r'^(z|c|s)h', r'\1', p)
    return re.sub(r'(e|i)ng$', r'\1n', p)


def expected_zh(text):
    """這句話「應該」怎麼念：每個漢字一個拼音（帶聲調），標點不算"""
    import opencc
    from pypinyin import lazy_pinyin, Style
    cc = opencc.OpenCC('t2s')
    text = re.sub(r'\d+', num_zh, text)   # 「白紙 21」的數字也要念
    chars = [c for c in text if '一' <= c <= '鿿']
    s = cc.convert(text)
    py = lazy_pinyin(s, style=Style.TONE3, neutral_tone_with_five=True, errors=lambda x: [None] * len(x))
    pos = [i for i, c in enumerate(text) if '一' <= c <= '鿿']
    if len(s) != len(text) or len(py) != len(text):
        py = lazy_pinyin([cc.convert(c) for c in chars], style=Style.TONE3, neutral_tone_with_five=True)
        out = list(py)
    else:
        out = [py[i] for i in pos]
    # 指定讀音（和錄音時給 MiniMax 的一樣）、台灣讀音表
    fixes = [(f.split('/')[0], re.findall(r'\((\w+)\)', f.split('/', 1)[1])) for f in gv.mm_fix(text)]
    fixes += [(w, p.split()) for w, p in TW.items() if p and w in text]
    for w, p in fixes:
        if len(p) != len(w):
            continue
        for m in re.finditer(re.escape(w), text):
            for k in range(len(w)):
                if m.start() + k in pos:
                    out[pos.index(m.start() + k)] = p[k]
    return [c for c in chars], out


def cc_s(t):
    import opencc
    return opencc.OpenCC('t2s').convert(t)


def readings(ch):
    """一個字所有可能的讀音（不帶聲調）"""
    import opencc
    from pypinyin import pinyin, Style
    s = opencc.OpenCC('t2s').convert(ch)
    r = set()
    for c in set(ch + s):
        r |= {norm(p) for p in pinyin(c, style=Style.TONE3, heteronym=True)[0]}
    return r


def num_zh(m):
    """Whisper 會把聽到的「三十二」寫成 32：換回國字再比"""
    n, d = int(m.group()), '零一二三四五六七八九'
    if n < 10:
        return d[n]
    if n < 100:
        return ('' if n < 20 else d[n // 10]) + '十' + (d[n % 10] if n % 10 else '')
    return ''.join(d[int(c)] for c in m.group())


def heard_py(text):
    from pypinyin import lazy_pinyin, Style
    text = re.sub(r'\d+', num_zh, text)
    t = re.sub(r'[^一-鿿]', '', text)
    py = lazy_pinyin(t, style=Style.TONE3, neutral_tone_with_five=True)
    return list(t), [HEARD_FIX.get(c, p) for c, p in zip(t, py)]


# 聽到的字 pypinyin 會挑錯讀音的（呱呱墜地的 gu）：兒歌裡都是這個音
HEARD_FIX = {'呱': 'gua1'}


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                         capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    return np.pad(x, (3200, 3200))


class Ear:
    def __init__(self, name):
        import torch
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
        self.torch = torch
        self.proc = Wav2Vec2Processor.from_pretrained(name)
        self.model = Wav2Vec2ForCTC.from_pretrained(name).eval()

    def __call__(self, x):
        with self.torch.no_grad():
            v = self.proc(x, sampling_rate=16000, return_tensors='pt').input_values
            ids = self.model(v).logits.argmax(-1)
        return self.proc.batch_decode(ids)[0]


def kind(key):
    if re.search(r'[一-鿿]', key):
        return 'zh'
    if re.search(r'[㄀-ㄯ]', key):
        return 'zy'
    return 'en'


CARRIER = '答案是'   # 很短的錄音（一兩個字）前面接這句，辨識才有上下文，不會亂猜
CARRIER_PY = ['da2', 'an4', 'shi4']


def check_zh(ear, key, path, zy=False, carrier=None):
    if zy:
        exp_c, exp = [key], [zhuyin_py(key)]
    else:
        exp_c, exp = expected_zh(key)
    x = load(path)
    short = carrier is not None and len(exp) <= 2
    if short:
        x = np.concatenate([carrier, x])
    heard = ear(x)
    hc, hp = heard_py(heard)
    if short:   # 去掉「答案是」那三個字
        sm0 = difflib.SequenceMatcher(a=[tw(p) for p in hp], b=[tw(p) for p in CARRIER_PY], autojunk=False)
        m = sm0.find_longest_match(0, len(hp), 0, 3)
        cut = m.a + m.size + (3 - m.b - m.size) if m.size else 3
        hc, hp = hc[cut:], hp[cut:]
    a, b = [tw(p) for p in exp], [tw(p) for p in hp]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    subs, poly = [], []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            continue
        for k in range(max(i2 - i1, j2 - j1)):
            e = i1 + k if i1 + k < i2 else None
            h = j1 + k if j1 + k < j2 else None
            item = {'char': exp_c[e] if e is not None else '', 'want': exp[e] if e is not None else '',
                    'heard': hp[h] if h is not None else '', 'heard_char': hc[h] if h is not None else ''}
            subs.append(item)
            # 多音字念成它自己的另一個讀音：幾乎一定是真的念錯
            # （聽到的字跟原本的字一樣時看不出念哪個音，不算；「地」念輕聲的 de 是對的）
            if e is not None and h is not None and not zy and norm(hp[h]) in readings(exp_c[e]) - {norm(exp[e])} \
                    and hc[h] not in (exp_c[e], cc_s(exp_c[e])) and not (exp_c[e] == '地' and norm(hp[h]) == 'de'):
                poly.append(item)
    err = 1 - sm.ratio() if a else 0
    return {'heard': heard, 'want': ' '.join(p or '?' for p in exp), 'got': ' '.join(hp), 'err': round(err, 3),
            'subs': subs, 'poly': poly}


def words(t):
    return re.findall(r"[a-z']+", t.lower().replace('’', "'"))


def check_en(ear, key, path):
    text = key.split(':', 1)[1] if key.startswith('slow') else key
    heard = ear(load(path))
    a, b = words(text), words(heard)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    miss = [' '.join(a[i1:i2]) + ' → ' + ' '.join(b[j1:j2]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    return {'heard': heard.lower(), 'want': ' '.join(a), 'err': round(1 - sm.ratio(), 3) if a else 0, 'subs': miss}


def main():
    idx = json.load(open('audio/index.json', encoding='utf-8'))
    items = sorted(idx.items())
    if len(sys.argv) > 1:
        items = items[:int(sys.argv[1])]
    os.makedirs(OUT, exist_ok=True)
    res = {}
    for k, ear_name in (('zh', ZH_MODEL), ('en', EN_MODEL)):
        ear = Ear(ear_name)
        todo = [(t, f) for t, f in items if (kind(t) in ('zh', 'zy')) == (k == 'zh')]
        carrier = load('audio/' + idx[CARRIER])[:-3200] if k == 'zh' and CARRIER in idx else None
        print(k, len(todo), flush=True)
        for n, (t, f) in enumerate(todo):
            try:
                r = check_en(ear, t, 'audio/' + f) if k == 'en' else check_zh(ear, t, 'audio/' + f, kind(t) == 'zy', carrier)
            except Exception as e:
                r = {'error': str(e)[:200]}
            res[t] = {'file': f, 'kind': kind(t), **r}
            if n % 100 == 0:
                print(n, t[:30], r.get('err'), flush=True)
    second_opinion(res, idx)
    json.dump(res, open(f'{OUT}/report.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    page(res)


def second_opinion(res, idx):
    """第二隻耳朵：wav2vec2 是大陸模型，台灣捲舌音、短短的字常聽錯。
    可疑的中文／注音再給 Whisper（會理解意思）聽一次；Whisper 聽起來是對的，就標 w_ok。"""
    import hear_fix as hf
    sus = [t for t, r in res.items() if r.get('kind') in ('zh', 'zy') and (r.get('poly') or r.get('err', 0) > .34)]
    w = hf.Whisper()
    # 英文也一樣：wav2vec2 沒有字典，狀聲詞、名字常拼錯；Whisper 聽起來對就標 w_ok
    wen = hf.Whisper('en', w.m)
    for t, r in res.items():
        if r.get('kind') == 'en' and r.get('err', 0) > .3:
            try:
                r2 = check_en(wen, t, 'audio/' + r['file'])
                r['whisper'], r['w_ok'] = r2['heard'], r2['err'] <= .3
            except Exception as e:
                r['whisper'] = 'error: ' + str(e)[:100]
    print('english second opinion:', sum(bool(r.get('w_ok')) for r in res.values() if r.get('kind') == 'en'), flush=True)
    carrier = load('audio/' + idx[CARRIER])[:-3200]
    for t in sus:
        r = res[t]
        try:
            exp = [zhuyin_py(t)] if r['kind'] == 'zy' else expected_zh(t)[1]
            sc, heard = hf.score([w], exp, 'audio/' + r['file'], carrier)
            r['whisper'], r['w_score'], r['w_ok'] = heard[0], round(sc, 3), sc >= .66
        except Exception as e:
            r['whisper'] = 'error: ' + str(e)[:100]
    print('second opinion:', sum(bool(res[t].get('w_ok')) for t in sus), 'of', len(sus), 'OK by Whisper', flush=True)


def page(res=None):
    import html
    res = res or json.load(open(f'{OUT}/report.json', encoding='utf-8'))
    play = lambda f: f'<button onclick="new Audio(\'../../audio/{f}\').play()">▶</button>'
    esc = html.escape

    def row(t, r, extra):
        return f'<tr><td>{play(r["file"])}</td><td>{esc(t)}</td><td>{extra}</td></tr>'
    ok2 = [(t, r) for t, r in res.items() if r.get('w_ok')]
    poly = [(t, r) for t, r in res.items() if r.get('poly') and not r.get('w_ok')]
    zh = sorted([(t, r) for t, r in res.items() if r.get('kind') in ('zh', 'zy') and not r.get('poly') and not r.get('w_ok')
                 and r.get('err', 0) > .34], key=lambda x: -x[1]['err'])
    en = sorted([(t, r) for t, r in res.items() if r.get('kind') == 'en' and not r.get('w_ok') and r.get('err', 0) > .3], key=lambda x: -x[1]['err'])
    fmt = lambda s: '、'.join(f'{esc(x["char"])} 應念 <b>{x["want"]}</b>，聽到 <b class=no>{x["heard"]}</b>（{esc(x["heard_char"])}）' for x in s)
    sec = [
        ('1. 多音字念成另一個讀音（兩隻耳朵都覺得不對）', poly, lambda r: fmt(r['poly'])),
        ('2. 中文聽起來差很多（兩隻耳朵都覺得不對）', zh, lambda r: f'應：{r["want"]}<br>聽：{esc(r["got"])}（{r["err"]}）'),
        ('（兩隻耳朵意見不同）第一隻耳朵聽起來怪，懂意思的 Whisper 聽起來是對的（大多沒問題）', ok2,
         lambda r: f'應：{r["want"]}<br>第一隻耳朵：{esc(r.get("got") or r.get("heard", ""))}<br>Whisper：{esc(r.get("whisper", ""))}'),
        ('3. 英文聽起來差很多（兩隻耳朵都覺得不對）', en, lambda r: f'聽到：{esc(r["heard"])}<br>{esc("；".join(r["subs"][:4]))}（{r["err"]}）'),
    ]
    body = ''.join(f'<h3>{h}：{len(rows)} 段</h3><table>{"".join(row(t, r, f(r)) for t, r in rows)}</table>' for h, rows, f in sec)
    n = {k: sum(1 for r in res.values() if r.get('kind') == k) for k in ('zh', 'zy', 'en')}
    open(f'{OUT}/index.html', 'w', encoding='utf-8').write(f'''<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>讀音檢查</title>
<style>body{{font:16px system-ui;margin:12px;background:#fffdf5}}table{{border-collapse:collapse;width:100%}}
td{{border:1px solid #ddd;padding:6px;vertical-align:top}}button{{font-size:20px;border:0;border-radius:10px;background:#ffd43b;padding:2px 10px}}
.no{{color:#c92a2a}}</style><h2>讀音檢查</h2>
<p>聽了中文 {n["zh"]} 段、注音 {n["zy"]} 段、英文 {n["en"]} 段。下面是聽起來可疑的（語音辨識只是參考，請用耳朵確認）。</p>{body}''')


if __name__ == '__main__':
    page() if sys.argv[1:] == ['page'] else main()
