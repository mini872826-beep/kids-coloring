#!/usr/bin/env bash
# 把 run.py 丟到 Kaggle 免費 GPU 跑，跑完把結果抓回 trial/
set -u
KID="$KAGGLE_USERNAME/kids-songs-trial"
mkdir -p /tmp/k && cp tools/kaggle_sing/run.py /tmp/k/
cat > /tmp/k/kernel-metadata.json <<META
{"id": "$KID", "title": "kids-songs-trial", "code_file": "run.py", "language": "python",
 "kernel_type": "script", "is_private": "true", "enable_gpu": "true", "enable_internet": "true",
 "machine_shape": "NvidiaTeslaT4", "dataset_sources": [], "competition_sources": [], "kernel_sources": [], "model_sources": []}
META
kaggle kernels push -p /tmp/k || exit 1
for i in $(seq 1 90); do
  sleep 40
  s=$(kaggle kernels status "$KID" 2>&1)
  echo "$s"
  case "$s" in *complete*|*error*|*ERROR*|*cancel*) break;; esac
done
mkdir -p trial
kaggle kernels output "$KID" -p trial/ || true
ls -la trial/
