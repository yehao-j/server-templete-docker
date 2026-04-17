#!/usr/bin/env bash

set -euo pipefail

ssh -o StrictHostKeyChecking=accept-new root@121.43.62.173 <<'EOF'
set -e

if [ ! -d "/root/AtomicServer/.git" ]; then
  cd /root
  git clone git@github.com:yehao-j/AtomicServer.git AtomicServer
fi

cd /root/AtomicServer
git pull origin main
docker compose down && docker compose up -d --build

echo "Waiting for service health check..."

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1/api/health >/dev/null; then
    echo "Deployment succeeded and health check passed."
    exit 0
  fi

  sleep 2
done

echo "Deployment finished but health check did not pass in time."
exit 1
EOF
