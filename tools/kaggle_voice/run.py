"""在 Kaggle 免費 GPU 上用 BreezyVoice 錄中文旁白（模仿 tools/voice/prompt.wav 志工的聲音）。
JOBS 由 tools/kaggle_voice/kaggle.sh 填進來：[[文字, 輸出檔名], ...]，做好的 mp3 放在 /kaggle/working/out/。"""
import json, os, subprocess, sys, time, traceback, urllib.request

JOBS = json.loads(r'''__JOBS__''')
PROMPT_TEXT = '''__PROMPT_TEXT__'''
RAW = 'https://raw.githubusercontent.com/mini872826-beep/kids-coloring/__BRANCH__/'
OUT = '/kaggle/working/out'
BV = '/kaggle/tmp/bv'
VENV = '/kaggle/tmp/venv/bin/python'
os.makedirs(OUT, exist_ok=True)
LOG = open('/kaggle/working/log.txt', 'w')


def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    LOG.write(s + '\n')
    LOG.flush()


def sh(cmd, cwd=None):
    log('$', cmd)
    r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    log((r.stdout or '')[-1500:], (r.stderr or '')[-2500:])
    if r.returncode:
        raise RuntimeError(f'failed: {cmd}')


GEN = r'''
import json, os, subprocess, sys, time, traceback
BV = '/kaggle/tmp/bv'
sys.path.insert(0, BV)
sys.path.insert(0, os.path.join(BV, 'third_party', 'Matcha-TTS'))
os.chdir(BV)
LOG = open('/kaggle/working/log.txt', 'a')
def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    LOG.write(s + '\n')
    LOG.flush()
import onnxruntime as ort
_S = ort.InferenceSession
class S(_S):
    def __init__(self, *a, **k):
        k.setdefault('providers', ['CPUExecutionProvider'])
        super().__init__(*a, **k)
ort.InferenceSession = S
from single_inference import single_inference, CustomCosyVoice
from g2pw import G2PWConverter
jobs = json.load(open('/kaggle/tmp/jobs.json', encoding='utf-8'))
prompt_text = open('/kaggle/tmp/prompt.txt', encoding='utf-8').read().strip()
t0 = time.time()
cosy = CustomCosyVoice('MediaTek-Research/BreezyVoice-300M')
conv = G2PWConverter()
log('model loaded %.0fs' % (time.time() - t0))
TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse'
done = 0
for text, name in jobs:
    if time.time() - t0 > 10.5 * 3600:
        log('time limit, stop'); break
    out = f'/kaggle/working/out/{name}'
    if os.path.exists(out):
        continue
    try:
        t = time.time()
        wav = '/kaggle/tmp/one.wav'
        single_inference('/kaggle/tmp/prompt.wav', text, wav, cosy, conv, prompt_text)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', TRIM, '-ar', '24000', '-ac', '1', '-b:a', '48k', out], check=True)
        done += 1
        log('ok %d/%d %.1fs %s' % (done, len(jobs), time.time() - t, text[:20]))
    except Exception:
        log('FAIL', text, traceback.format_exc()[-800:])
log('gen done', done)
'''

try:
    t0 = time.time()
    sh('nvidia-smi -L')
    sh(f'git clone --depth 1 --recursive https://github.com/mtkresearch/BreezyVoice.git {BV}')
    # BreezyVoice 要 Python 3.10，Kaggle 是 3.13：用 uv 建 3.10 環境
    sh('pip install -q uv')
    sh('uv venv -p 3.10 /kaggle/tmp/venv')
    pip = f'uv pip install --python {VENV}'
    sh(f"sed -e 's/onnxruntime-gpu/onnxruntime/' -e '/deepspeed/d' -e '/openai-whisper/d' -e '/gradio/d' {BV}/requirements.txt > /kaggle/tmp/req.txt")
    sh(f'{pip} "setuptools<80" wheel pip')
    sh(f'{pip} torch==2.3.1 torchaudio==2.3.1 --index-url https://download.pytorch.org/whl/cu118')
    sh(f'{VENV} -m pip install -q --no-build-isolation openai-whisper==20231117')
    sh(f'{pip} -r /kaggle/tmp/req.txt --index-strategy unsafe-best-match')
    sh(f'{pip} "ruamel.yaml<0.18"')
    urllib.request.urlretrieve(RAW + 'tools/voice/prompt.wav', '/kaggle/tmp/prompt.wav')
    open('/kaggle/tmp/prompt.txt', 'w', encoding='utf-8').write(PROMPT_TEXT)
    json.dump(JOBS, open('/kaggle/tmp/jobs.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open('/kaggle/tmp/gen.py', 'w', encoding='utf-8').write(GEN)
    log('setup %.0fs' % (time.time() - t0))
    LOG.flush()
    r = subprocess.run(f'{VENV} /kaggle/tmp/gen.py', shell=True, cwd=BV, env={**os.environ, 'PYTHONUTF8': '1'})
    log('gen exit', r.returncode)
except Exception:
    log('SETUP EXCEPTION', traceback.format_exc()[-3000:])
log('done')
