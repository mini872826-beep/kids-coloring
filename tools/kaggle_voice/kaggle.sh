#!/usr/bin/env bash
# 用法：tools/kaggle_voice/kaggle.sh jobs.json 分支名 輸出資料夾
# 把要錄的句子丟到 Kaggle 免費 GPU 用 BreezyVoice 錄，跑完把 mp3 抓回來
set -u
JOBS_FILE=$1; BRANCH=$2; DEST=$3
KID="$KAGGLE_USERNAME/kids-voice"
rm -rf /tmp/kv && mkdir -p /tmp/kv
python3 - "$JOBS_FILE" "$BRANCH" <<'PY'
import json, sys
src = open('tools/kaggle_voice/run.py', encoding='utf-8').read()
jobs = json.load(open(sys.argv[1], encoding='utf-8'))
src = src.replace('__JOBS__', json.dumps(jobs, ensure_ascii=False)).replace('__BRANCH__', sys.argv[2])
src = src.replace('__PROMPT_TEXT__', open('tools/voice/prompt.txt', encoding='utf-8').read().strip())
open('/tmp/kv/run.py', 'w', encoding='utf-8').write(src)
PY
cat > /tmp/kv/kernel-metadata.json <<META
{"id": "$KID", "title": "kids-voice", "code_file": "run.py", "language": "python",
 "kernel_type": "script", "is_private": "true", "enable_gpu": "true", "enable_internet": "true",
 "machine_shape": "NvidiaTeslaT4", "dataset_sources": [], "competition_sources": [], "kernel_sources": [], "model_sources": []}
META
kaggle kernels push -p /tmp/kv || exit 1
for i in $(seq 1 600); do
  sleep 30
  s=$(kaggle kernels status "$KID" 2>&1)
  case "$s" in *complete*|*error*|*ERROR*|*cancel*) echo "$s"; break;; esac
  [ $((i % 20)) = 0 ] && echo "$s"
done
mkdir -p /tmp/kv-out "$DEST"
kaggle kernels output "$KID" -p /tmp/kv-out/ >/dev/null || true
cp /tmp/kv-out/log.txt "$DEST/kaggle-voice-log.txt" 2>/dev/null
grep -E "^ok |FAIL|EXCEPTION|setup|loaded|gen done" /tmp/kv-out/log.txt | tail -30
cp /tmp/kv-out/out/*.mp3 "$DEST"/ 2>/dev/null
ls "$DEST" | wc -l
