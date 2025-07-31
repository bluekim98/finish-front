#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST="ec2-user@15.164.224.217"
KEY="./../mac-office.pem"          # 키 경로 한 곳에만 써두면 편리

cd "$APP_DIR"

echo "[+] 프로젝트 빌드"
pnpm i --frozen-lockfile
pnpm build

echo "[+] 아티팩트 압축"
tar --exclude='.git' -czf nuxt-artifact.tar.gz \
    .output node_modules package.json pnpm-lock.yaml \
    start.sh stop.sh

echo "[+] 서버로 전송"
scp -i "$KEY" nuxt-artifact.tar.gz "$HOST:~/workspace"

echo "[+] 원격 배포 및 재시작"
ssh -i "$KEY" "$HOST" << 'EOF'
  set -euo pipefail
  cd ~/workspace

  # 새 디렉터리 준비
  rm -rf finish-front
  mkdir -p finish-front

  # 압축 해제
  tar -xzf nuxt-artifact.tar.gz -C finish-front
  rm -f nuxt-artifact.tar.gz
  cd finish-front
  chmod +x start.sh stop.sh

  # 이전 인스턴스 종료 (실패해도 계속)
  ./stop.sh || true

  echo "[+] Nuxt 서버 재시작 (백그라운드)"
  #   ┌────────────────────────────────────────────────────────┐
  #   │ 1) nohup : SIGHUP 무시, SSH 종료돼도 프로세스 유지      │
  #   │ 2) &     : 백그라운드 실행                              │
  #   │ 3) > ... : 로그 파일에 stdout/stderr 모두 저장          │
  #   └────────────────────────────────────────────────────────┘
  nohup ./start.sh > app.log 2>&1 < /dev/null &
  disown         # (bash/zsh) 셸이 더 이상 이 잡(job)을 추적하지 않음
EOF

echo "[✓] Deployed successfully, server is running in background"
