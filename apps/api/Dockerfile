# Stage 1: base
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Stage 2: deps
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# Stage 3: build
FROM deps AS build
COPY . .
RUN pnpm turbo build --filter=@lungilicious/api...

# Stage 4: runner
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts
RUN npx prisma generate
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main.js"]
