"""用 AI 聲音把每一句錄成 mp3（中文：BreezyVoice 模仿志工 1 的聲音，在 Kaggle GPU 上錄；中文旁白都改用 MiniMax 台灣腔講故事大姊姊，BreezyVoice 只補 MiniMax 沒錄到的；
英文：微軟 Ana。BreezyVoice 還沒錄到的中文句子，先用微軟曉臻頂著，下次再補），放在 audio/，並寫出 audio/index.json（句子 -> 檔名）。

GitHub Actions 每次推上新內容會自動跑（.github/workflows/voice.yml），
只會錄新增或改過的句子；刪掉的句子對應的 mp3 也會一起清掉。
用法：MINIMAX_PHRASES=minimax.json python tools/gen_voice.py phrases.json
（minimax.json 由 node tools/phrases.js --minimax 產生，這些句子用 MiniMax 的聲音，tools/minimax_voice.py 錄）
"""
import asyncio
import hashlib
import json
import os
import shutil
import subprocess
import sys

import edge_tts

VOICE = 'zh-TW-HsiaoChenNeural' # 台灣口音、溫柔的大姊姊聲音（爸爸試聽後選的）
VOICE_EN = 'en-US-AnaNeural'    # 英文：美國小朋友的聲音
RATE = '-8%'                     # 講慢一點，小朋友比較聽得懂
PITCH = '+0Hz'
OUT = 'audio'
# 大班學英文（school/）的慢速英文：句子前面加「slow75:」「slow50:」就是 0.75 倍、0.5 倍（1 倍 = RATE 的 -8%）
SLOW = {'slow75:': '-31%', 'slow50:': '-54%'}


def split_slow(text):
    """'slow75:I see the sea.' → ('I see the sea.', '-31%')；一般的句子 → (句子, None)"""
    for tag, rate in SLOW.items():
        if text.startswith(tag):
            return text[len(tag):], rate
    return text, None
# 錄好的檔頭尾各有快一秒的靜音，句子之間會卡卡的；用 ffmpeg 修掉（名字加 trim，修過的才算數）
TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse'


# 注音符號和單一個字的標準發音（學注音用，key 是注音本身，例如「ㄅ」「ㄅㄚˊ」）：
# MiniMax 大姊姊單獨念一個字常常念歪（ㄆ 念成「泡」、ㄦ 像英文），改用微軟曉臻（台灣標準發音）念代表字，音量調到和大姊姊一樣
ZY_TAG = 'zy1'
ZY_RATE = '-10%'


def zhuyin_read():
    try:
        out = subprocess.run(['node', 'tools/phrases.js', '--zhuyin-read'], capture_output=True, text=True, check=True).stdout
        return json.loads(out)
    except Exception as e:
        print('no zhuyin readings:', e)
        return {}


ZY = zhuyin_read()


def is_english(text):
    return all(ord(ch) < 128 for ch in split_slow(text)[0])


def voice_for(text):
    return VOICE_EN if is_english(text) else VOICE


BREEZY = 'breezy-v1'   # 換聲音範本或改念法時換號碼，全部重錄


# 錄壞要重錄的句子（tools/voice/redo.json）：換個檔名，才不會又撿回舊的壞錄音
REDO = set(json.load(open('tools/voice/redo.json', encoding='utf-8'))) if os.path.exists('tools/voice/redo.json') else set()


# 中文旁白都用 MiniMax 的台灣腔講故事大姊姊（tools/minimax_voice.py 錄）。
# MiniMax 還沒錄到的句子，先用以前的 BreezyVoice 錄音或微軟曉臻頂著
STORY = set(json.load(open(os.environ['MINIMAX_PHRASES'], encoding='utf-8'))) if os.environ.get('MINIMAX_PHRASES') else set()
MM = json.load(open('tools/voice/minimax.json', encoding='utf-8'))
# 故事的句子念慢一點（node tools/phrases.js --story），其他快一點
TALES = set(json.load(open(os.environ['STORY_PHRASES'], encoding='utf-8'))) if os.environ.get('STORY_PHRASES') else set()


def mm_speed(text):
    return MM['speed'] if text in TALES else MM.get('speed_other', MM['speed'])


def mm_fix(text):
    """這句話裡要指定讀音的詞（tools/voice/minimax.json 的 pronounce），照 MiniMax 的格式：詞/(拼音)"""
    return [f'{w}/{py}' for w, py in MM.get('pronounce', {}).items() if not w.startswith('_') and w in text]


def mm_name(text):
    key = f"minimax|{MM['voice_id']}|{MM['model']}|{mm_speed(text)}|loud|{text}"
    if mm_fix(text):   # 指定讀音的句子換檔名，才會重錄
        key += '|' + ','.join(mm_fix(text))
    return hashlib.sha1(key.encode('utf-8')).hexdigest()[:12] + '.mp3'


def breezy_name(text, spk='v1'):
    tag = BREEZY + '-redo1' if text in REDO else BREEZY
    if spk != 'v1':
        tag += '-' + spk + '-loud'   # 以前故事用過志工 2（loud：音量調到和志工 1 一樣）
    return hashlib.sha1(f'{tag}|trim|{text}'.encode('utf-8')).hexdigest()[:12] + '.mp3'


def file_name(text):
    # 聲音設定也算進去，換聲音時會全部重錄
    if text in ZY:
        return hashlib.sha1(f'{VOICE}|{ZY_TAG}|{ZY_RATE}|{text}|{ZY[text]}'.encode('utf-8')).hexdigest()[:12] + '.mp3'
    key = f'{voice_for(text)}|{split_slow(text)[1] or RATE}|{PITCH}|trim|{text}'
    return hashlib.sha1(key.encode('utf-8')).hexdigest()[:12] + '.mp3'


def trim(path):
    tmp = path + '.tmp.mp3'
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', path, '-af', TRIM,
           '-ar', '24000', '-ac', '1', '-b:a', '48k', tmp]
    if subprocess.run(cmd).returncode == 0 and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
    elif os.path.exists(tmp):
        os.remove(tmp)


def loud(path, db=-21.8):
    """音量調到和 MiniMax 大姊姊一樣（tools/minimax_voice.py 的 LOUD）"""
    import numpy as np
    import soundfile as sf
    wav = path + '.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', '24000', '-ac', '1', wav], check=True)
    y, fs = sf.read(wav)
    y = y * 10 ** ((db - 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)) / 20)
    sf.write(wav, y / max(1, np.abs(y).max() / 0.89), fs)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-b:a', '48k', path], check=True)
    os.remove(wav)


async def record(text, path):
    if text in ZY:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(ZY[text], VOICE, rate=ZY_RATE, pitch=PITCH).save(path)
                if os.path.getsize(path) > 0:
                    trim(path)
                    loud(path)
                    return
            except Exception as e:
                print(f'retry {attempt + 1}: {text} ({e})')
            await asyncio.sleep(2 * (attempt + 1))
        print(f'FAILED: {text}')
        return
    for attempt in range(4):
        try:
            words, slow = split_slow(text)
            await edge_tts.Communicate(words, voice_for(text), rate=slow or RATE, pitch='+0Hz' if is_english(text) else PITCH).save(path)
            if os.path.getsize(path) > 0:
                trim(path)
                return
        except Exception as e:  # 網路不穩就再試
            print(f'retry {attempt + 1}: {text} ({e})')
        await asyncio.sleep(2 * (attempt + 1))
    if os.path.exists(path):
        os.remove(path)
    print(f'FAILED: {text}')


async def main():
    if not shutil.which('ffmpeg'):
        sys.exit('需要 ffmpeg 來修掉靜音')
    phrases = json.load(open(sys.argv[1], encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[2] == '--plan':
        # 列出還沒有 BreezyVoice 錄音的中文句子，交給 tools/kaggle_voice/kaggle.sh 去錄
        jobs = [[t, breezy_name(t), 'v1'] for t in phrases
                if not is_english(t) and t not in STORY and t not in ZY and not os.path.exists(os.path.join(OUT, breezy_name(t)))]
        json.dump(jobs, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'{len(jobs)} phrases need BreezyVoice')
        return
    index = {}
    for text in phrases:
        if text in STORY and os.path.exists(os.path.join(OUT, mm_name(text))):
            index[text] = mm_name(text)
            continue
        # MiniMax 還沒錄到的：用以前 BreezyVoice 的錄音（志工 1，或故事以前的志工 2）
        old = [] if text in ZY else [n for n in (breezy_name(text), breezy_name(text, 'v2')) if os.path.exists(os.path.join(OUT, n))]
        if not is_english(text) and old:
            index[text] = old[0]
            continue
        name = file_name(text)
        path = os.path.join(OUT, name)
        if not (os.path.exists(path) and os.path.getsize(path) > 0):
            print('record:', text)
            await record(text, path)
        if os.path.exists(path):
            index[text] = name

    keep = set(index.values())
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in keep:
            os.remove(os.path.join(OUT, f))

    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as fp:
        json.dump(index, fp, ensure_ascii=False, indent=0, sort_keys=True)
    print(f'{len(index)} / {len(phrases)} phrases have audio')


if __name__ == '__main__':
    asyncio.run(main())
