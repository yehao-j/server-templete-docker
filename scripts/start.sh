#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/compose.dev.yaml"

docker compose -f "${COMPOSE_FILE}" stop

docker compose -f "${COMPOSE_FILE}" start

docker compose -f "${COMPOSE_FILE}" logs -f