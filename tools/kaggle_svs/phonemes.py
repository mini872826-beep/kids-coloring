"""把歌詞的字轉成 SoulX-Singer 用的發音：中文 zh_拼音+聲調、英文 en_ARPAbet（一個字的音用 - 連起來）。
中文先轉成簡體再查拼音（g2pM 只認得簡體）；音庫裡沒有的拼音聲調，換成同一個拼音的其他聲調。"""
import re

LETTERS = {  # 單獨的大寫字母（ABC 歌）要唸字母的名字
    'A': 'EY1', 'B': 'B-IY1', 'C': 'S-IY1', 'D': 'D-IY1', 'E': 'IY1', 'F': 'EH1-F', 'G': 'JH-IY1', 'H': 'EY1-CH',
    'I': 'AY1', 'J': 'JH-EY1', 'K': 'K-EY1', 'L': 'EH1-L', 'M': 'EH1-M', 'N': 'EH1-N', 'O': 'OW1', 'P': 'P-IY1',
    'Q': 'K-Y-UW1', 'R': 'AA1-R', 'S': 'EH1-S', 'T': 'T-IY1', 'U': 'Y-UW1', 'V': 'V-IY1',
    'W': 'D-AH1-B-AH0-L-Y-UW0', 'X': 'EH1-K-S', 'Y': 'W-AY1', 'Z': 'Z-IY1', 'Cs': 'S-IY1-Z',
    'dickory': 'D-IH1-K-ER0-IY0', 'Dickory': 'D-IH1-K-ER0-IY0',
}
_g2p_en = _g2p_zh = _t2s = None


def _load():
    global _g2p_en, _g2p_zh, _t2s
    if _g2p_en is None:
        from g2p_en import G2p
        from g2pM import G2pM
        import opencc
        _g2p_en, _g2p_zh, _t2s = G2p(), G2pM(), opencc.OpenCC('t2s')


def english(word, phoneset):
    w = re.sub(r"[^A-Za-z']", '', word)
    ph = LETTERS.get(w) or '-'.join(p for p in _g2p_en(w.lower()) if p.strip() and p not in ',.?!')
    ph = [p if 'en_' + p in phoneset else re.sub(r'\d', '', p) + '1' for p in ph.split('-')]
    return 'en_' + '-'.join(p for p in ph if 'en_' + p in phoneset)


# 多音字：這些詞照這裡念（g2pM 有時會選錯，例如「數一數」的數要念 shu3、「蘿蔔」念 luo2 bo5）
FIX = {'數一數': 'shu3 yi4 shu3', '數數': 'shu3 shu3', '數到': 'shu3 dao4', '數綿羊': 'shu3 mian2 yang2',
       '蘿蔔': 'luo2 bo5', '長在': 'zhang3 zai4', '長大': 'zhang3 da4', '載著': 'zai4 zhe5',
       '呱': 'gua1'}


def mandarin(chars, phoneset):
    simp = _t2s.convert(''.join(chars))
    pys = list(_g2p_zh(simp, tone=True, char_split=False))
    text = ''.join(chars)
    for w, py in FIX.items():
        k = text.find(w)
        while k >= 0:
            pys[k:k + len(w)] = py.split()
            k = text.find(w, k + 1)
    out = []
    for ch, py in zip(chars, pys):
        p = 'zh_' + py.replace('ü', 'u:').replace('v', 'u:')
        if p not in phoneset:
            base = re.sub(r'\d$', '', p)
            p = next((base + t for t in '41235' if base + t in phoneset), None)
            if p is None:
                raise ValueError(f'沒有這個音：{ch} {py}')
        out.append(p)
    return out


def convert(words, types, lang, phoneset):
    """words / types：一個音一個（種類 1 = 空白、2 = 新的字、3 = 前一個字拉長）→ 同樣長度的發音"""
    _load()
    new = [w for w, t in zip(words, types) if t == 2]
    ph = iter([english(w, phoneset) for w in new] if lang == 'English' else mandarin(new, phoneset))
    out = []
    for w, t in zip(words, types):
        out.append('<SP>' if t == 1 else next(ph) if t == 2 else out[-1])
    return out
