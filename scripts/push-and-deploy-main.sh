#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEFAULT_COMMIT_MESSAGE="更新项目并执行部署"

cd "${REPO_ROOT}"

CURRENT_BRANCH="$(git branch --show-current)"
if [ "${CURRENT_BRANCH}" != "main" ]; then
    echo "当前分支是 ${CURRENT_BRANCH}，请切换到 main 后再执行部署。"
    exit 1
fi

COMMIT_MESSAGE="${*:-$DEFAULT_COMMIT_MESSAGE}"

git add .

if git diff --cached --quiet; then
    echo "没有可提交的代码变更，跳过 commit。"
else
    git commit -m "${COMMIT_MESSAGE}"
fi

git push origin main

bash "${SCRIPT_DIR}/deploy-main.sh"
