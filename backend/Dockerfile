# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# native 모듈 빌드를 위해 필요한 최소 패키지 설치
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npx nest build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app

# 보안을 위해 비루트(non-root) 사용자 생성
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
# 실행 시에도 native 모듈이 필요할 수 있으므로 빌드 툴 포함 설치 혹은 builder에서 복사
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm install --only=production && \
    apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist

# 파일 권한 설정 및 사용자 전환
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080
# 쉘을 거치지 않고 직접 실행하여 유효하지 않은 환경 변수 이름 등으로 인한 시작 실패 방지
CMD ["node", "dist/src/main.js"]

