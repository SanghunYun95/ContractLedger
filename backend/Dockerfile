# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# NestJS build 생성 (dist 폴더)
RUN npx nest build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app

# 보안을 위해 비루트(non-root) 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist

# 파일 권한 설정 및 사용자 전환
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001
CMD ["node", "dist/main"]
