"""用 AI 聲音把每一句錄成 mp3（中文：BreezyVoice 模仿志工的聲音，在 Kaggle GPU 上錄——故事用志工 2，其他用志工 1；
英文：微軟 Ana。BreezyVoice 還沒錄到的中文句子，先用微軟曉臻頂著，下次再補），放在 audio/，並寫出 audio/index.json（句子 -> 檔名）。

GitHub Actions 每次推上新內容會自動跑（.github/workflows/voice.yml），
只會錄新增或改過的句子；刪掉的句子對應的 mp3 也會一起清掉。
用法：STORY_PHRASES=stories.json python tools/gen_voice.py phrases.json
（stories.json 由 node tools/phrases.js --story 產生，這些句子用志工 2 的聲音）
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
# 錄好的檔頭尾各有快一秒的靜音，句子之間會卡卡的；用 ffmpeg 修掉（名字加 trim，修過的才算數）
TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse'


def is_english(text):
    return all(ord(ch) < 128 for ch in text)


def voice_for(text):
    return VOICE_EN if is_english(text) else VOICE


BREEZY = 'breezy-v1'   # 換聲音範本或改念法時換號碼，全部重錄


# 錄壞要重錄的句子（tools/voice/redo.json）：換個檔名，才不會又撿回舊的壞錄音
REDO = set(json.load(open('tools/voice/redo.json', encoding='utf-8'))) if os.path.exists('tools/voice/redo.json') else set()


# 講故事用志工 2（起伏比較多），其他旁白用志工 1。換誰念就換檔名，會自動重錄
STORY = set(json.load(open(os.environ['STORY_PHRASES'], encoding='utf-8'))) if os.environ.get('STORY_PHRASES') else set()


def speaker(text):
    return 'v2' if text in STORY else 'v1'


def breezy_name(text):
    tag = BREEZY + '-redo1' if text in REDO else BREEZY
    if speaker(text) != 'v1':
        tag += '-' + speaker(text) + '-loud'   # loud：音量調到和志工 1 一樣（志工 2 原本小聲很多）
    return hashlib.sha1(f'{tag}|trim|{text}'.encode('utf-8')).hexdigest()[:12] + '.mp3'


def file_name(text):
    # 聲音設定也算進去，換聲音時會全部重錄
    key = f'{voice_for(text)}|{RATE}|{PITCH}|trim|{text}'
    return hashlib.sha1(key.encode('utf-8')).hexdigest()[:12] + '.mp3'


def trim(path):
    tmp = path + '.tmp.mp3'
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', path, '-af', TRIM,
           '-ar', '24000', '-ac', '1', '-b:a', '48k', tmp]
    if subprocess.run(cmd).returncode == 0 and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
    elif os.path.exists(tmp):
        os.remove(tmp)


async def record(text, path):
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, voice_for(text), rate=RATE, pitch='+0Hz' if is_english(text) else PITCH).save(path)
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
        jobs = [[t, breezy_name(t), speaker(t)] for t in phrases
                if not is_english(t) and not os.path.exists(os.path.join(OUT, breezy_name(t)))]
        json.dump(jobs, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
        print(f'{len(jobs)} phrases need BreezyVoice')
        return
    index = {}
    for text in phrases:
        if not is_english(text) and os.path.exists(os.path.join(OUT, breezy_name(text))):
            index[text] = breezy_name(text)
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


asyncio.run(main())
