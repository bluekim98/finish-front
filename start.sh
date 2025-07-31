#!/usr/bin/env bash
set -euo pipefail             # 오류·미정의 변수 즉시 중단

APP_DIR="$(cd "$(dirname "$0")" && pwd)"

export NODE_ENV=dev    # 프로덕션 모드
export PORT=3000              # 요청하신 런타임 포트

cd "$APP_DIR"
exec node .output/server/index.mjs
