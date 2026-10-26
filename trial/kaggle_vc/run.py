"""試聽用：在 Kaggle 免費 GPU 上用 Seed-VC（說話版）把「會講故事的聲音」換成志工 1 的音色，
起伏、停頓、快慢都保留原本的。JOBS: [{"src": 倉庫裡的 mp3, "out": 輸出檔名}]。"""
import json, os, subprocess, time, traceback

JOBS = json.loads(r'''__JOBS__''')
RAW = 'https://raw.githubusercontent.com/mini872826-beep/kids-coloring/__BRANCH__/'
SVC = '/kaggle/tmp/seed-vc'
VENV = '/kaggle/tmp/venv/bin/python'
os.makedirs('/kaggle/working/out', exist_ok=True)
open('/kaggle/working/log.txt', 'w').close()
LOG = open('/kaggle/working/log.txt', 'a')


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
import glob, json, os, shutil, subprocess, sys, time, traceback, urllib.request
from types import SimpleNamespace
sys.path.insert(0, '/kaggle/tmp/seed-vc')
os.chdir('/kaggle/tmp/seed-vc')
LOG = open('/kaggle/working/log.txt', 'a')
def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    LOG.write(s + '\n')
    LOG.flush()
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(' '.join(cmd) + '\n' + r.stderr[-1500:])
jobs = json.load(open('/kaggle/tmp/jobs.json', encoding='utf-8'))
raw = open('/kaggle/tmp/raw.txt').read().strip()
ref = '/kaggle/tmp/ref.wav'
urllib.request.urlretrieve(raw + 'tools/voice/prompt.wav', '/kaggle/tmp/ref0.wav')
run(['ffmpeg', '-v', 'error', '-y', '-i', '/kaggle/tmp/ref0.wav', '-ar', '22050', '-ac', '1', ref])
import inference
args = SimpleNamespace(f0_condition=False, auto_f0_adjust=False, semi_tone_shift=0, checkpoint=None, config=None,
                       fp16=False, length_adjust=1.0, diffusion_steps=30, inference_cfg_rate=0.7, output='', source='', target='')
t = time.time()
models = inference.load_models(args)
inference.load_models = lambda a: models
log('loaded %.0fs' % (time.time() - t))
for job in jobs:
    out = '/kaggle/working/out/' + job['out']
    try:
        src = '/kaggle/tmp/src.wav'
        urllib.request.urlretrieve(raw + job['src'], '/kaggle/tmp/src.mp3')
        run(['ffmpeg', '-v', 'error', '-y', '-i', '/kaggle/tmp/src.mp3', '-ar', '22050', '-ac', '1', src])
        odir = '/kaggle/tmp/vc'
        shutil.rmtree(odir, ignore_errors=True)
        args.source, args.target, args.output = src, ref, odir
        inference.main(args)
        vc = glob.glob(odir + '/*.wav')[0]
        run(['ffmpeg', '-v', 'error', '-y', '-i', vc, '-af', 'loudnorm=I=-19:TP=-2', '-ar', '24000', '-ac', '1', '-b:a', '64k', out])
        log('ok', job['out'])
    except Exception:
        log('FAILED', job['out'], traceback.format_exc()[-1200:])
log('gen done')
'''

try:
    t0 = time.time()
    sh('nvidia-smi -L')
    sh(f'git clone --depth 1 https://github.com/Plachtaa/seed-vc {SVC}')
    # Seed-VC 建議 Python 3.10，Kaggle 是 3.13：用 uv 另外建一個 3.10 的環境
    sh('pip install -q uv')
    sh('uv venv -p 3.10 /kaggle/tmp/venv')
    sh(f'uv pip install --python {VENV} torch==2.4.0 torchaudio==2.4.0 torchvision==0.19.0 --index-url https://download.pytorch.org/whl/cu121')
    req = [l for l in open(f'{SVC}/requirements.txt').read().splitlines()
           if l.strip() and '--index-url' not in l and not l.startswith(('torch', 'gradio', 'FreeSimpleGUI', 'sounddevice'))]
    open('/kaggle/tmp/req.txt', 'w').write('\n'.join(req))
    sh(f'uv pip install --python {VENV} -r /kaggle/tmp/req.txt torch==2.4.0 torchaudio==2.4.0 '
       '--extra-index-url https://download.pytorch.org/whl/cu121 --index-strategy unsafe-best-match')
    json.dump(JOBS, open('/kaggle/tmp/jobs.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open('/kaggle/tmp/raw.txt', 'w').write(RAW)
    open('/kaggle/tmp/gen.py', 'w', encoding='utf-8').write(GEN)
    log('setup %.0fs' % (time.time() - t0))
    r = subprocess.run(f'{VENV} /kaggle/tmp/gen.py', shell=True, cwd=SVC)
    log('gen exit', r.returncode)
except Exception:
    log('SETUP EXCEPTION', traceback.format_exc()[-3000:])
log('done')
