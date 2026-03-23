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

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist

# SQLite 사용 시 혹은 환경변수 설정용
EXPOSE 3001
CMD ["node", "dist/main"]
