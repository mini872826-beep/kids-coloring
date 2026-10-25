"""在 Kaggle 免費 GPU 上用 Seed-VC（唱歌版，保留原本音高）把機器唱的人聲換成自然歌聲，再配上八音盒伴奏。
JOBS 由 tools/kaggle_svc/kaggle.sh 填進來（tools/sing_vc.py --plan 產生）。
做好的 mp3 放在 /kaggle/working/out/，用來模仿的範本人聲也放一份在 /kaggle/working/out/ref/。"""
import json, os, subprocess, time, traceback

JOBS = json.loads(r'''__JOBS__''')
RAW = 'https://raw.githubusercontent.com/mini872826-beep/kids-coloring/__BRANCH__/'
SVC = '/kaggle/tmp/seed-vc'
VENV = '/kaggle/tmp/venv/bin/python'
os.makedirs('/kaggle/working/out/ref', exist_ok=True)
open('/kaggle/working/log.txt', 'w').close()
LOG = open('/kaggle/working/log.txt', 'a')   # 用附加模式，才不會蓋掉 gen.py 寫的紀錄


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
import glob, hashlib, json, os, shutil, subprocess, sys, time, traceback, urllib.request
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
def get(path):
    local = '/kaggle/tmp/dl/' + path.replace('/', '_')
    if not os.path.exists(local):
        os.makedirs('/kaggle/tmp/dl', exist_ok=True)
        urllib.request.urlretrieve(raw + path, local)
    return local

refs = {}
def reference(ref):
    key = json.dumps(ref, sort_keys=True)
    if key in refs:
        return refs[key]
    src = get(ref['path'])
    name = os.path.basename(ref['path'])[:-4]
    out = '/kaggle/working/out/ref/' + name + '.wav'
    if ref.get('sep'):
        # 把伴奏去掉只留人聲（demucs），再把中間沒唱的空白剪掉
        run([sys.executable, '-m', 'demucs', '--two-stems', 'vocals', '-n', 'htdemucs', '-o', '/kaggle/tmp/sep', src])
        src = glob.glob('/kaggle/tmp/sep/**/vocals.*', recursive=True)
        log('sep', src)
        src = [f for f in src if os.path.basename(os.path.dirname(f)) == os.path.basename(get(ref['path']))[:-4]][0]
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af',
         'silenceremove=start_periods=1:start_threshold=-40dB:stop_periods=-1:stop_duration=0.4:stop_threshold=-40dB',
         '-t', '24', '-ac', '1', '-ar', '44100', out])
    refs[key] = out
    log('ref', name)
    return out

import inference
args = SimpleNamespace(f0_condition=True, auto_f0_adjust=False, semi_tone_shift=0, checkpoint=None, config=None,
                       fp16=False, length_adjust=1.0, diffusion_steps=40, inference_cfg_rate=0.7, output='', source='', target='')
t = time.time()
models = inference.load_models(args)
inference.load_models = lambda a: models      # 模型只載一次
log('loaded %.0fs' % (time.time() - t))
for job in jobs:
    out = '/kaggle/working/out/' + job['file']
    try:
        t = time.time()
        vox = '/kaggle/tmp/vox.wav'
        run(['ffmpeg', '-v', 'error', '-y', '-i', get(job['vox']), '-ar', '44100', vox])
        odir = '/kaggle/tmp/vc/' + job['id']
        shutil.rmtree(odir, ignore_errors=True)
        args.source, args.target, args.output = vox, reference(job['ref']), odir
        args.diffusion_steps, args.inference_cfg_rate = job['steps'], job['cfg']
        inference.main(args)
        vc = glob.glob(odir + '/*.wav')[0]
        # 人聲放前面、八音盒輕輕在後面，最後限幅避免爆音
        run(['ffmpeg', '-v', 'error', '-y', '-i', vc, '-i', get(job['acc']), '-filter_complex',
             f"[0:a]loudnorm=I=-17:TP=-2,aresample=44100,volume={job['vox_gain']}[a];"
             f"[1:a]loudnorm=I=-27:TP=-2,aresample=44100,volume={job['acc_gain']}[b];"
             '[a][b]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.9',
             '-ac', '1', '-b:a', '96k', out])
        log('ok', job['file'], '%.0fs' % (time.time() - t))
    except Exception:
        log('FAILED', job['file'], traceback.format_exc()[-1500:])
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
    sh(f'uv pip install --python {VENV} julius dora-search openunmix lameenc')
    sh(f'uv pip install --python {VENV} --no-deps demucs==4.0.1')   # 4.1 多要一個 sphn 套件
    json.dump(JOBS, open('/kaggle/tmp/jobs.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open('/kaggle/tmp/raw.txt', 'w').write(RAW)
    open('/kaggle/tmp/gen.py', 'w', encoding='utf-8').write(GEN)
    log('setup %.0fs' % (time.time() - t0))
    r = subprocess.run(f'{VENV} /kaggle/tmp/gen.py', shell=True, cwd=SVC)
    log('gen exit', r.returncode)
except Exception:
    log('SETUP EXCEPTION', traceback.format_exc()[-3000:])
log('done')
