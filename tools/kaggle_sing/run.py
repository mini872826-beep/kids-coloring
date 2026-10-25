"""在 Kaggle 免費 GPU 上用 ACE-Step 1.5 把兒歌唱成像真人唱的版本。
JOBS 由 tools/kaggle_sing/kaggle.sh 填進來（tools/sing_ai.py --plan 產生）：
  new：照歌詞重新作曲；cover：拿 App 裡旋律正確的版本（audio/sing/）當參考，保留旋律換成自然人聲。
做好的 mp3 放在 /kaggle/working/out/。"""
import json, os, subprocess, sys, time, traceback

JOBS = json.loads(r'''__JOBS__''')
RAW = 'https://raw.githubusercontent.com/mini872826-beep/kids-coloring/__BRANCH__/'
ACE = '/kaggle/tmp/ace'
VENV = '/kaggle/tmp/venv/bin/python'
os.makedirs('/kaggle/working/out', exist_ok=True)
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
import json, os, sys, time, traceback, urllib.request, shutil, types
sys.path.insert(0, '/kaggle/tmp/ace')
os.chdir('/kaggle/tmp/ace')
LOG = open('/kaggle/working/log.txt', 'a')
def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    LOG.write(s + '\n')
    LOG.flush()
import torch
# T4 是舊顯卡（沒有 bfloat16），程式會自動用 float16 但會溢位：強制改用 float32
import acestep.core.generation.handler.init_service_orchestrator as _o
_p = types.ModuleType('torch32'); _p.__dict__.update(torch.__dict__); _p.float16 = torch.float32; _p.bfloat16 = torch.float32
_o.torch = _p
from acestep.handler import AceStepHandler
AceStepHandler._get_vae_dtype = lambda self, device=None: torch.float32
from acestep.llm_inference import LLMHandler
from acestep.inference import GenerationParams, GenerationConfig, generate_music
jobs = json.load(open('/kaggle/tmp/jobs.json', encoding='utf-8'))
raw = open('/kaggle/tmp/raw.txt').read().strip()
dit = AceStepHandler()
msg, ok = dit.initialize_service(project_root='/kaggle/tmp/ace', config_path='acestep-v15-turbo', device='auto', offload_to_cpu=True)
log('dit', ok, msg)
llm = LLMHandler()
for job in jobs:
    out = '/kaggle/working/out/' + job['file']
    try:
        kw = dict(task_type=job['task'], caption=job['caption'], lyrics=job['lyrics'], vocal_language=job['lang'],
                  inference_steps=8, shift=3.0, seed=42)
        if job['task'] == 'cover':
            src = '/kaggle/tmp/src.mp3'
            urllib.request.urlretrieve(raw + 'audio/sing/' + job['src'], src)
            kw.update(src_audio=src, audio_cover_strength=0.8)
        else:
            kw.update(thinking=False, duration=job['duration'])
        t = time.time()
        res = generate_music(dit, llm, params=GenerationParams(**kw),
                             config=GenerationConfig(batch_size=1, audio_format='mp3'), save_dir='/kaggle/tmp/gen')
        ok = False
        for a in (res.audios or []):
            p = a.get('path')
            if res.success and p and os.path.exists(p):
                shutil.copy(p, out)
                ok = True
                break
        log('ok' if ok else 'FAILED', job['file'], '%.0fs' % (time.time() - t), getattr(res, 'status_message', '')[:300])
    except Exception:
        log('FAILED', job['file'], traceback.format_exc()[-1500:])
log('gen done')
'''

try:
    t0 = time.time()
    sh('nvidia-smi -L')
    sh(f'git clone --depth 1 https://github.com/ace-step/ACE-Step-1.5 {ACE}')
    # ACE-Step 要 Python 3.11～3.12，Kaggle 是 3.13：用 uv 另外建一個 3.12 的環境
    sh('pip install -q uv')
    sh('uv venv -p 3.12 /kaggle/tmp/venv')
    sh(f'uv pip install --python {VENV} -e .', cwd=ACE)
    sh(f'{VENV} -m acestep.model_downloader', cwd=ACE)
    json.dump(JOBS, open('/kaggle/tmp/jobs.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open('/kaggle/tmp/raw.txt', 'w').write(RAW)
    open('/kaggle/tmp/gen.py', 'w', encoding='utf-8').write(GEN)
    log('setup %.0fs' % (time.time() - t0))
    r = subprocess.run(f'{VENV} /kaggle/tmp/gen.py', shell=True, cwd=ACE)
    log('gen exit', r.returncode)
except Exception:
    log('SETUP EXCEPTION', traceback.format_exc()[-3000:])
log('done')
