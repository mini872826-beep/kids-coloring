"""試聽用：同樣幾句話，用 BreezyVoice 和幾個免費的微軟台灣聲音各錄一次，放到 trial/ 給爸爸聽。"""
import asyncio, os, subprocess, sys, time

SENTENCES = [
    '小紅帽要去外婆家，媽媽說：「路上不要跟陌生人說話喔！」',
    '哇！你畫得好漂亮，真是太棒了！',
    '三角龍有三根角，長頸龍脖子好長好長。',
    '蘋果的英文是 apple，跟我念：apple。',
]
os.makedirs('trial', exist_ok=True)


ROOT = os.path.abspath('.')


def mp3(wav, name):
    os.makedirs(f'{ROOT}/trial', exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-b:a', '64k', f'{ROOT}/trial/{name}.mp3'], check=True)


def push(msg):
    """做好一部分就先推上去，爸爸不用等全部做完"""
    sh = lambda c: subprocess.run(c, shell=True, cwd=ROOT)
    sh('git config user.name "github-actions[bot]"')
    sh('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"')
    sh(f'git add trial && git commit -q -m "{msg}" && for i in 1 2 3; do git pull --rebase -q origin voice-trial && git push -q origin HEAD:voice-trial && break; sleep 5; done')


async def edge():
    import edge_tts
    for voice in ['zh-TW-HsiaoYuNeural', 'zh-TW-HsiaoChenNeural', 'zh-TW-YunJheNeural']:
        for i, s in enumerate(SENTENCES):
            try:
                await edge_tts.Communicate(s, voice, rate='-8%').save(f'trial/{voice.split("-")[2]}-{i + 1}.mp3')
            except Exception as e:
                print('skip', voice, i + 1, e)


def pick_voices(n=3):
    """從 Common Voice 台灣志工錄音（CC0）挑幾個：女生、二三十歲、評價好、長度適中"""
    from datasets import load_dataset, Audio
    ds = load_dataset('JacobLinCool/common_voice_19_0_zh-TW', split='validated_without_test', streaming=True)
    ds = ds.cast_column('audio', Audio(decode=False))
    os.makedirs('prompts', exist_ok=True)
    picked, seen = [], set()
    for k, row in enumerate(ds):
        if k > 40000 or len(picked) >= n:
            break
        g, a = str(row.get('gender', '')), str(row.get('age', ''))
        if 'fem' not in g or a not in ('twenties', 'thirties'):
            continue
        if int(row.get('up_votes') or 0) < 2 or int(row.get('down_votes') or 0) > 0:
            continue
        cid = row.get('client_id')
        if cid in seen or len(row['sentence']) < 12:
            continue
        i = len(picked) + 1
        src = f'prompts/v{i}.mp3'
        open(src, 'wb').write(row['audio']['bytes'])
        wav = os.path.abspath(f'prompts/v{i}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', '16000', '-ac', '1', wav], check=True)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav],
                                   capture_output=True, text=True).stdout or 0)
        if not 3.5 <= dur <= 12:
            continue
        seen.add(cid)
        picked.append((wav, row['sentence'], f'voice{i}'))
        print('picked', i, g, a, '%.1fs' % dur, row['sentence'], flush=True)
        mp3(wav, f'voice{i}-original')
    with open(f'{ROOT}/trial/voices.txt', 'w', encoding='utf-8') as f:
        for k, (_, text, name) in enumerate(picked):
            f.write(f'{name}: {text}\n')
    push('Volunteer voices (originals)')
    return picked


def breezy(prompts, sentences):
    bv = os.path.abspath('bv')
    sys.path.insert(0, bv)
    sys.path.insert(0, os.path.join(bv, 'third_party', 'Matcha-TTS'))
    here = os.getcwd()
    os.chdir(bv)
    # 新版 onnxruntime 一定要指定 providers，g2pw 沒寫：幫它預設用 CPU
    import onnxruntime as ort
    _Session = ort.InferenceSession

    class Session(_Session):
        def __init__(self, *a, **k):
            k.setdefault('providers', ['CPUExecutionProvider'])
            super().__init__(*a, **k)
    ort.InferenceSession = Session
    from single_inference import single_inference, CustomCosyVoice
    from g2pw import G2PWConverter
    t0 = time.time()
    cosy = CustomCosyVoice('MediaTek-Research/BreezyVoice-300M')
    conv = G2PWConverter()
    print('load model %.0fs' % (time.time() - t0), flush=True)
    for wav, text, name in prompts:
        for i, s in enumerate(sentences):
            t = time.time()
            out = os.path.join(here, f'trial/{name}-{i + 1}.wav')
            single_inference(wav, s, out, cosy, conv, text)
            print('%s %d: %.0fs' % (name, i + 1, time.time() - t), flush=True)
            mp3(out, f'{name}-{i + 1}')
            os.remove(out)
        push(f'BreezyVoice {name}')
    os.chdir(here)


if sys.argv[1] == 'edge':
    asyncio.run(edge())
elif sys.argv[1] == 'cv':
    voices = pick_voices()
    breezy(voices, SENTENCES[:2])
else:
    prompt = '在密碼學中，加密是將明文資訊改變為難以讀取的密文內容，使之不可讀的方法。只有擁有解密方法的對象，經由解密過程，才能將密文還原為正常可讀的內容。'
    breezy([(os.path.abspath('bv/data/example.wav'), prompt, 'breezy')], SENTENCES)
