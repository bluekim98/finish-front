# Finish Front

## 프로젝트 시작

### 1. 환경 변수 파일 추가

`project root`에 `.env` 파일을 만든 후, `.env.sample` 파일에 있는 내용 복사합니다.

###  2. 명령어 실행

명령어는 `project root`에서 실행합니다.

의존성 설치
```bash
$ pnpm install
```

개발 서버 실행
```bash
$ pnpm dev
```

### 3. 기타
백엔드 API 수정으로 타입이 깨지는 경우
```bash
$ pnpm typegen
```