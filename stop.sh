#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="nuxt"            # systemd 서비스명
PORT="3000"                    # Nuxt가 리스닝 중인 포트
PID_FILE="/home/ec2-user/nuxt-app/app.pid"   # (선택) PID 파일 사용 시

# ──────────────────────────────────────────────────────────
# 1) systemd 서비스가 있으면 그걸로 정지
if systemctl list-units --full -all | grep -q "${SERVICE_NAME}\.service"; then
  echo "[+] systemd 서비스 '${SERVICE_NAME}' 발견 → 중지"
  sudo systemctl stop "${SERVICE_NAME}"
  exit 0
fi

# ──────────────────────────────────────────────────────────
# 2) (옵션) PID 파일이 있다면 그걸로
if [[ -f "${PID_FILE}" ]]; then
  PID="$(cat "${PID_FILE}")"
  if ps -p "${PID}" > /dev/null 2>&1; then
    echo "[+] PID 파일(${PID_FILE}) → 프로세스 ${PID} 종료"
    kill "${PID}"
    rm -f "${PID_FILE}"
    exit 0
  fi
fi

# ──────────────────────────────────────────────────────────
# 3) 마지막 수단: 포트 기준으로 프로세스 찾아 종료
if command -v lsof > /dev/null 2>&1; then
  PID="$(lsof -ti tcp:${PORT} || true)"
  if [[ -n "${PID}" ]]; then
    echo "[+] 포트 ${PORT} 사용 중인 PID ${PID} 종료"
    kill "${PID}"
    exit 0
  fi
fi

echo "※ Nuxt 프로세스가 이미 종료되어 있거나 찾을 수 없습니다."
