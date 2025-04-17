#!/bin/bash

# .env 파일 읽기
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env 파일이 존재하지 않습니다."
  exit 1
fi

# FINISH_ADMIN_API_URL 확인
if [ -z "$FINISH_ADMIN_API_URL" ]; then
  echo "FINISH_ADMIN_API_URL 환경 변수가 설정되어 있지 않습니다."
  exit 1
fi

# 타입 생성
BACKUP_FILE="./typegen-bak/api.d.ts.$(date +%Y%m%d%H%M%S)"
echo "타입 백업 파일: $BACKUP_FILE"
cp ./types/api.d.ts "$BACKUP_FILE"

echo "npx openapi-typescript를 사용하여 $FINISH_ADMIN_API_URL 로부터 타입 생성 중..."
npx openapi-typescript "$FINISH_ADMIN_API_URL/v3/api-docs" -o types/api.d.ts

if [ $? -eq 0 ]; then
  echo "타입 생성 완료: types/api.d.ts"
else
  echo "타입 생성 실패!"
  exit 1
fi