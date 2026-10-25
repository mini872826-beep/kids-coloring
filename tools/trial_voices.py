"""試聽用：同樣幾句話，用 BreezyVoice 和幾個免費的微軟台灣聲音各錄一次，放到 trial/ 給爸爸聽。"""
import asyncio, os, subprocess, sys, time

SENTENCES = [
    '小紅帽要去外婆家，媽媽說：「路上不要跟陌生人說話喔！」',
    '哇！你畫得好漂亮，真是太棒了！',
    '三角龍有三根角，長頸龍脖子好長好長。',
    '蘋果的英文是 apple，跟我念：apple。',
]
os.makedirs('trial', exist_ok=True)


def mp3(wav, name):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-b:a', '64k', f'trial/{name}.mp3'], check=True)


async def edge():
    import edge_tts
    for voice in ['zh-TW-HsiaoYuNeural', 'zh-TW-HsiaoChenNeural', 'zh-TW-YunJheNeural']:
        for i, s in enumerate(SENTENCES):
            await edge_tts.Communicate(s, voice, rate='-8%').save(f'trial/{voice.split("-")[2]}-{i + 1}.mp3')


def breezy():
    sys.path.insert(0, 'bv')
    sys.path.insert(0, 'bv/third_party/Matcha-TTS')
    os.chdir('bv')
    from single_inference import single_inference, CustomCosyVoice
    from g2pw import G2PWConverter
    t0 = time.time()
    cosy = CustomCosyVoice('MediaTek-Research/BreezyVoice-300M')
    conv = G2PWConverter()
    print('load model %.0fs' % (time.time() - t0), flush=True)
    prompt = '在密碼學中，加密是將明文資訊改變為難以讀取的密文內容，使之不可讀的方法。只有擁有解密方法的對象，經由解密過程，才能將密文還原為正常可讀的內容。'
    for i, s in enumerate(SENTENCES):
        t = time.time()
        single_inference('data/example.wav', s, f'../trial/breezy-{i + 1}.wav', cosy, conv, prompt)
        print('breezy %d: %.0fs' % (i + 1, time.time() - t), flush=True)
    os.chdir('..')
    for i in range(len(SENTENCES)):
        mp3(f'trial/breezy-{i + 1}.wav', f'breezy-{i + 1}')
        os.remove(f'trial/breezy-{i + 1}.wav')


if sys.argv[1] == 'edge':
    asyncio.run(edge())
else:
    breezy()
