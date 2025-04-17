#!/bin/sh
set -e

source /srv/caribbean/admin/.env

echo "Extracting application files..."
tar -xzf /srv/caribbean/admin/artifact_dir.tar.gz -C /srv/caribbean/admin

mkdir brand-identity || true
mount-s3 --prefix brand-identity/ ${S3_PATH} brand-identity || true

cd /srv/caribbean/admin

echo "Restarting Nuxt server..."
# 로그 폴더 생성 (존재하지 않으면 자동 생성)
mkdir -p log

# 날짜별 로그 파일 이름 생성
DATE=$(date '+%Y%m%d')
OUT_LOG="./log/nuxt-app_${DATE}.out"
ERR_LOG="./log/nuxt-app_${DATE}.err"

# PM2 실행 (재시작 시 기존 실행 중인 프로세스 먼저 중지)
pm2 stop "nuxt-app" || true
env $(cat /srv/caribbean/admin/.env | xargs) pm2 start "sh -c 'node .output/server/index.mjs'" --name "nuxt-app" --output "$OUT_LOG" --error "$ERR_LOG"

echo "Deployment completed successfully!"
