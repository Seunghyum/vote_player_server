# 1. Build Stage
FROM node:23-alpine AS builder

WORKDIR /app

# 패키지 설치 (package.json, lock 파일만 복사해서 캐시 활용)
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
  else echo "No lockfile found." && exit 1; fi

# 소스 복사 및 빌드
COPY . .
RUN yarn build

# 2. Production Stage
FROM node:23-alpine AS prod

WORKDIR /app

# prod 환경에 필요한 파일만 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 환경변수 파일 복사
COPY .env.prod ./

EXPOSE 3000

CMD ["yarn", "start"]
