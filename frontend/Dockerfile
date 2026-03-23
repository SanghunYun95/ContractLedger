# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app

# 보안을 위해 비루트(non-root) 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production

# standalone 빌드는 필요한 파일만 복사하여 가벼운 이미지를 만듭니다.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 파일 권한 설정 및 사용자 전환
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
