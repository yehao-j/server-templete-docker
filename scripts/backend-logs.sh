#!/usr/bin/env bash

set -euo pipefail

SERVICE_NAME="${1:-backend}"

ssh -o StrictHostKeyChecking=accept-new root@121.43.62.173 <<EOF
set -e

cd /root/AtomicServer
docker compose logs -f --tail 200 "${SERVICE_NAME}"
EOF
