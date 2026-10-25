"""用 AI 聲音把每一句錄成 mp3，放在 audio/，並寫出 audio/index.json（句子 -> 檔名）。

GitHub Actions 每次推上新內容會自動跑（.github/workflows/voice.yml），
只會錄新增或改過的句子；刪掉的句子對應的 mp3 也會一起清掉。
用法：python tools/gen_voice.py phrases.json
"""
import asyncio
import hashlib
import json
import os
import sys

import edge_tts

VOICE = 'zh-TW-HsiaoYuNeural'   # 台灣口音、溫柔的女生聲音
VOICE_EN = 'en-US-AnaNeural'    # 英文：美國小朋友的聲音
RATE = '-8%'                     # 講慢一點，小朋友比較聽得懂
PITCH = '+6Hz'
OUT = 'audio'


def is_english(text):
    return all(ord(ch) < 128 for ch in text)


def voice_for(text):
    return VOICE_EN if is_english(text) else VOICE


def file_name(text):
    # 聲音設定也算進去，換聲音時會全部重錄
    key = f'{voice_for(text)}|{RATE}|{PITCH}|{text}'
    return hashlib.sha1(key.encode('utf-8')).hexdigest()[:12] + '.mp3'


async def record(text, path):
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, voice_for(text), rate=RATE, pitch='+0Hz' if is_english(text) else PITCH).save(path)
            if os.path.getsize(path) > 0:
                return
        except Exception as e:  # 網路不穩就再試
            print(f'retry {attempt + 1}: {text} ({e})')
        await asyncio.sleep(2 * (attempt + 1))
    if os.path.exists(path):
        os.remove(path)
    print(f'FAILED: {text}')


async def main():
    phrases = json.load(open(sys.argv[1], encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    index = {}
    for text in phrases:
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
