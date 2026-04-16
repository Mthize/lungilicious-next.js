# Lungilicious

Premium botanical wellness e-commerce platform.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **API**: NestJS + Fastify (TypeScript)
- **Worker**: NestJS + BullMQ
- **Storefront**: Next.js 15
- **Admin**: Next.js 15
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Queues**: Redis + BullMQ
- **Auth**: Session-based (@fastify/secure-session, Argon2id)
- **Payments**: Peach Payments (hosted checkout)

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (for local Postgres + Redis)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start local infrastructure (Postgres + Redis)
docker compose up -d

# Run database migrations
pnpm --filter @lungilicious/api exec prisma migrate dev

# Start all apps in development mode
pnpm dev
```

## Project Structure

```
lungilicious/
├── apps/
│   ├── api/          # NestJS + Fastify API server
│   ├── worker/       # NestJS BullMQ worker
│   ├── storefront/   # Next.js customer-facing app
│   └── admin/        # Next.js admin dashboard
├── packages/
│   ├── config/       # Shared env/config (Zod validation)
│   ├── eslint-config/ # Shared ESLint configs
│   ├── tsconfig/     # Shared TypeScript configs
│   ├── types/        # Shared types and enums
│   └── ui/           # Design system tokens
├── prisma/           # Prisma schema (multi-file)
└── docs/             # Architecture contract documents
```

## Environment Variables

All configuration is via environment variables validated with Zod. See `packages/config/src/env.schema.ts` for the full schema. Required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `SESSION_SECRET` — Secret key for session encryption (min 32 chars)
- `NODE_ENV` — `development` | `production` | `test`
- `PORT` — API server port (default: 3001)

## License

Private — All rights reserved.
