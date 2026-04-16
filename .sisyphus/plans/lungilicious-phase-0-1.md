# Lungilicious — Phase 0 + Phase 1: Architecture Contracts & Foundation

## TL;DR

> **Quick Summary**: Bootstrap the Lungilicious platform from zero — produce all architecture contract documents (Phase 0) and scaffold the complete monorepo foundation with NestJS API, Prisma schema, session auth, RBAC, audit, and Redis/BullMQ infrastructure (Phase 1). No business logic, no UI pages — just the rock-solid skeleton every module builds on.
>
> **Deliverables**:
> - 6 architecture contract documents in `docs/`
> - Turborepo + pnpm monorepo with 4 apps + 5 shared packages
> - NestJS API (Fastify) + Worker app fully wired
> - Prisma schema covering all 50+ tables across all 12 domains (split into per-domain `.prisma` files)
> - Session auth with Argon2id + HTTP-only cookies + RBAC guards
> - Redis + BullMQ queue infrastructure
> - Pino structured logging + Zod config validation
> - Audit module skeleton (write-only)
> - Next.js storefront + admin shells (no pages)
> - Railway deployment config (Dockerfiles + railway.toml)
>
> **Estimated Effort**: Large (40+ tasks, ~4–6 days parallel execution)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: T1 (monorepo) → T5 (Prisma schema) → T9 (API bootstrap) → T13 (session auth) → T17 (RBAC) → T19 (audit) → Final wave

---

## Context

### Original Request
A comprehensive architecture document was provided defining a premium botanical wellness e-commerce platform ("Lungilicious") — modular monolith, NestJS + Fastify + TypeScript, PostgreSQL, Redis, Peach Payments, "The Botanical Editorial" design system. The request is to turn this architecture into an executable work plan, starting with Phase 0 (contracts) and Phase 1 (foundation).

> **IMPORTANT FOR EXECUTORS**: The architecture document was provided by the user in the planning session context. It is NOT a file in the workspace. The plan inlines all required information from it (module lists, table names, API endpoints, status enums, field names). **Tasks that reference "architecture doc section X" are citing their source, but the actual data needed is already written into that task's "What to do" instructions.** Executors do NOT need the original document — everything needed is in the task.

> The workspace currently contains only: `DESIGN.md` and this plan file. The monorepo does NOT have a git repository initialized yet. **Task 1 must run `git init` as part of monorepo setup** (see T1 instructions below). All commit instructions in this plan apply AFTER git is initialized.

### Interview Summary
**Key Discussions**:
- **Scope**: Phase 0 + Phase 1 only — no business logic modules, no UI pages
- **Monorepo**: Turborepo + pnpm with scoped `@lungilicious/` packages
- **Payment v1**: Peach Payments (South African provider), abstraction layer only in Phase 1 (no actual integration yet)
- **Test strategy**: Tests-after — no TDD, unit/integration tests added after implementation tasks
- **Deployment**: Railway — Dockerfiles + `railway.toml` per service
- **Admin frontend**: Backend-only; Next.js admin app scaffold only (shell, no pages)

**Research Findings**:
- NestJS Fastify bootstrap: `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }))`
- Session auth: `@fastify/secure-session` with `request.session.set('userId', user.id)` pattern
- Prisma multi-file: `prisma.config.ts` with `schema: 'prisma/'` directory, per-domain `.prisma` files
- BullMQ: `@nestjs/bullmq` with `BullModule.forRoot()`, `@Processor` + `WorkerHost` pattern
- RBAC: Global `APP_GUARD` with `Reflector`, `@Roles()` / `@RequirePermissions()` decorators
- Turborepo: `turbo.json` + `pnpm-workspace.yaml`, `packages/*` as `@lungilicious/` scope

### Metis Review
Metis consultation timed out. Key guardrails applied manually:
- Phase 0 docs are markdown only — no code generation during Phase 0 tasks
- Phase 1 must NOT implement any business logic (no route handlers with real data, no service methods beyond stubs)
- Prisma schema must be complete for ALL domains (not just Phase 1 scope) — migrations run against full schema
- Railway deployment config goes in Phase 1, not deferred to later
- Auth and RBAC must be global guards wired from day one — no "add later" approach

---

## Work Objectives

### Core Objective
Produce 6 architecture contract documents and a fully-wired monorepo skeleton — every line of infrastructure that all 14 business modules will build on top of, with zero business logic yet present.

### Concrete Deliverables
- `docs/architecture/threat-model.md`
- `docs/architecture/module-boundaries.md`
- `docs/api/openapi-v1.md`
- `docs/data/database-schema-v1.md`
- `docs/payments/payment-abstraction.md`
- `docs/architecture/rbac-matrix.md`
- `apps/api/` — NestJS + Fastify, fully configured
- `apps/worker/` — NestJS BullMQ worker, fully configured
- `apps/storefront/` — Next.js 15 shell
- `apps/admin/` — Next.js 15 shell
- `packages/config/` — shared env/config utilities
- `packages/types/` — shared TypeScript types and DTOs
- `packages/ui/` — design system token stubs (colors, typography)
- `packages/eslint-config/` — shared ESLint config
- `packages/tsconfig/` — shared TypeScript base configs
- `prisma/` — complete multi-domain schema (all tables) + initial migration
- `apps/api/src/common/` — guards, decorators, interceptors, filters, pipes
- `apps/api/src/modules/auth/` — session auth skeleton
- `apps/api/src/modules/audit/` — audit module skeleton
- `Dockerfile` per app + `railway.toml` per service
- `docker-compose.yml` for local development

### Definition of Done
- [ ] `pnpm install` runs without errors from root
- [ ] `pnpm turbo build` completes across all apps
- [ ] `pnpm turbo typecheck` passes with zero errors
- [ ] `pnpm turbo lint` passes with zero errors
- [ ] `npx prisma migrate dev` applies the initial migration successfully against a local PostgreSQL instance
- [ ] `npx prisma generate` produces a typed Prisma client
- [ ] API app starts: `curl http://localhost:3001/health` returns `{"status":"ok","info":{"db":{"status":"up"},"redis":{"status":"up"}},...}` (NestJS Terminus format)
- [ ] Worker app starts without errors
- [ ] All 6 `docs/` contract documents exist and are non-empty

### Must Have
- All 50+ Prisma models defined (even if empty of business logic) — schema is the source of truth
- Session auth wired globally as a guard from day one
- RBAC decorator + guard infrastructure present and unit-tested
- Audit module writes to `audit_logs` table — wired but with stub handlers
- Railway `railway.toml` for API and Worker services
- Local dev `docker-compose.yml` with Postgres + Redis

### Must NOT Have (Guardrails)
- **No business logic** in any service method — stubs only (`return []`, `return null`, `throw new NotImplementedException()`)
- **No raw card data** in any model or code — Prisma schema stores only token references
- **No frontend pages or components** — Next.js apps are shells only (layout.tsx, page.tsx returning `null`)
- **No hardcoded secrets** — all config via env + Zod validation
- **No `any` types** — strict TypeScript throughout
- **No console.log** — Pino logger only
- **No JWT** — session-based auth only
- **No Convex** — not in this project at all
- **No separate Phase 0 document generation tool** — docs are standard Markdown written by the agent

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (greenfield)
- **Automated tests**: Tests-after (not TDD)
- **Framework**: Vitest (configured but no tests written in Phase 1)
- **Note**: Vitest config is set up, test scripts are in `package.json`, but no test files are written during Phase 1 tasks. Tests are added in the first "tests-after" pass after Phase 1 tasks complete.

### QA Policy
Every task includes agent-executed QA scenarios verified by running commands. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario}.{ext}`.

- **File system / config tasks**: Bash (`ls`, `cat`, `pnpm`, `tsc`)
- **NestJS app tasks**: Bash (`curl`, `pnpm start:dev`)
- **Prisma tasks**: Bash (`npx prisma validate`, `npx prisma migrate dev --create-only`)
- **Doc tasks**: Bash (`wc -l`, `grep` for required sections)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — all independent, no dependencies):
├── Task 1:  Monorepo root scaffold (turbo, pnpm-workspace, root package.json, .gitignore) [quick]
├── Task 2:  Shared packages scaffold (config, types, ui, eslint-config, tsconfig) [quick]
├── Task 32: Docker setup (Dockerfile api, Dockerfile worker, docker-compose.yml) [unspecified-high] ← MOVED HERE
├── Task 3:  Phase 0 Doc — threat-model.md [writing]
├── Task 4:  Phase 0 Doc — module-boundaries.md [writing]
├── Task 5:  Phase 0 Doc — rbac-matrix.md [writing]
├── Task 6:  Phase 0 Doc — payment-abstraction.md [writing]
├── Task 7:  Phase 0 Doc — openapi-v1.md [writing]
└── Task 8:  Phase 0 Doc — database-schema-v1.md [writing]

Wave 2 (After T1+T2 complete):
├── Task 9:  NestJS API app bootstrap (Fastify, main.ts, app.module.ts) [quick]
├── Task 10: NestJS Worker app bootstrap (BullMQ, main.ts, app.module.ts) [quick]
├── Task 11: Next.js storefront app scaffold [quick]
├── Task 12: Next.js admin app scaffold [quick]
├── Task 13: Prisma schema — identity + auth domain (users, sessions, roles, mfa) [unspecified-high]
├── Task 14: Prisma schema — customer domain (customers, addresses, preferences, payment_methods) [unspecified-high]
├── Task 15: Prisma schema — catalog + pricing domain (products, variants, categories, promotions) [unspecified-high]
├── Task 16: Prisma schema — commerce domain (carts, checkout, orders, stock_reservations, shipments) [unspecified-high]
└── Task 17: Prisma schema — platform domain (payments, webhooks, audit, content, notifications, idempotency) [unspecified-high]

Wave 3 (After T9+T10+T13-T17 complete; docker-compose.yml available from Wave 1 T32):
├── Task 18: Prisma merge, migrate, generate client [quick]
├── Task 19: API — Config module (Zod env validation, ConfigModule.forRoot) [quick]
├── Task 20: API — Pino logger setup (fastify logger, PinoLogger interceptor, request ID) [quick]
├── Task 21: API — Common infrastructure (exception filters, response interceptor, validation pipe, raw body middleware) [quick]
├── Task 22: API — Database module (PrismaService, onModuleInit, enableShutdownHooks) [quick]
├── Task 23: API — Redis module (ioredis client, RedisModule, health indicator) [quick]
├── Task 24: API — BullMQ connection in API (shared connection config) [quick]
├── Task 25: Worker — BullMQ full setup (queues: email, notifications, webhooks, inventory, exports) [unspecified-high]
├── Task 26: API — Session auth module skeleton (AuthModule, AuthService stubs, @fastify/secure-session) [unspecified-high]
├── Task 27: API — RBAC infrastructure (Role enum, @Roles decorator, @RequirePermissions, @Public, RolesGuard, global APP_GUARD) [unspecified-high]
└── Task 28: API — Audit module skeleton (AuditModule, AuditService, AuditLog Prisma write, @AuditEvent decorator) [unspecified-high]

Wave 4 (After Wave 3 complete):
├── Task 29: API — Health check endpoint (/health, /health/db, /health/redis) [quick]
├── Task 30: API — OpenAPI/Swagger setup (SwaggerModule, @ApiCookieAuth, decorators) [quick]
├── Task 31: Vitest config (vitest.config.ts in api + worker, test scripts in package.json) [quick]
├── Task 33: Railway deployment config (railway.toml for api, railway.toml for worker, env var documentation) [quick]
└── Task 34: Turbo pipeline finalization (build, typecheck, lint, test pipeline in turbo.json, CI smoke test) [quick]

Wave FINAL (After ALL tasks — 3 parallel reviews):
├── Task F1: Plan compliance + typecheck audit [oracle]
├── Task F2: Full integration smoke test (start api, check health, validate prisma) [unspecified-high]
└── Task F3: Scope fidelity check (no business logic, no raw cards, no hardcoded secrets) [deep]
→ Present results → Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 2, 9, 10, 11, 12 |
| 2 | 1 | 9, 10, 11, 12, 13-17 |
| 3-8 | — | F1 |
| 32 | — | 33, F2 | ← Wave 1 (Docker — no code deps)
| 9 | 1, 2 | 19-28, 29, 30 |
| 10 | 1, 2 | 25 |
| 11 | 1, 2 | 34 |
| 12 | 1, 2 | 34 |
| 13 | 1, 2 | 18 |
| 14 | 1, 2 | 18 |
| 15 | 1, 2 | 18 |
| 16 | 1, 2 | 18 |
| 17 | 1, 2 | 18 |
| 18 | 13, 14, 15, 16, 17 | 22, 26, 28 |
| 19 | 9 | 26, 27, 28 |
| 20 | 9 | F2 |
| 21 | 9 | 26, 27 |
| 22 | 9, 18 | 26, 27, 28, 29 |
| 23 | 9 | 24, 25 |
| 24 | 9, 23 | 25 |
| 25 | 10, 23, 24 | F2 |
| 26 | 9, 18, 19, 21, 22 | 27, 29 |
| 27 | 9, 19, 21, 26 | 29, 30 |
| 28 | 9, 18, 22, 27 | F1, F2 |
| 29 | 26, 27 | F2 |
| 30 | 26, 27 | F1 |
| 31 | 9, 10 | 28 (QA step), 34 |
| 33 | 32 | F2 |
| 34 | 11, 12, 31 | F1 |

### Agent Dispatch Summary

- **Wave 1**: T1-T2 → `quick`; T32 → `unspecified-high`; T3-T8 → `writing`
- **Wave 2**: T9-T12 → `quick`; T13-T17 → `unspecified-high`
- **Wave 3**: T18-T24 → `quick`; T25-T28 → `unspecified-high`
- **Wave 4**: T29-T31, T33-T34 → `quick`
- **Final**: F1 → `oracle`; F2 → `unspecified-high`; F3 → `deep`

---

## TODOs

> Implementation tasks. Wave 1 (T1-T8) can ALL start in parallel immediately.
> **A task WITHOUT QA Scenarios is INCOMPLETE.**

- [ ] 1. Monorepo Root Scaffold

  **What to do**:
  - Run `git init` in the monorepo root — the workspace is not yet a git repository
  - Create `package.json` at root with `name: "lungilicious"`, `private: true`, `packageManager: "pnpm@9.x"`, workspaces field pointing to `apps/*` and `packages/*`
  - Create `pnpm-workspace.yaml` listing `apps/*` and `packages/*`
  - Create `turbo.json` with pipeline: `build` (depends on `^build`), `typecheck` (depends on `^typecheck`), `lint`, `dev`, `start:dev`, `start:prod`
  - Create `.gitignore` covering: `node_modules`, `.turbo`, `dist`, `.env`, `.env.local`, `*.env`, `prisma/generated`
  - Create `.nvmrc` or `.node-version` pinning Node 20 LTS
  - Create `README.md` with brief project description and setup instructions
  - Create root `tsconfig.json` that just references workspace configs (not a base itself)
  - Install turbo as dev dependency at root: `pnpm add -D turbo -w`
  - Run initial `git add .` and `git commit -m "chore: initialize monorepo"` so subsequent tasks can use git

  **Must NOT do**:
  - Do not create any app directories yet (those are T9-T12)
  - Do not install app-specific dependencies yet
  - Do not create `.env` file (document env vars in README only)
  - Do not skip `git init` — the workspace has no git repository yet and commits are required throughout this plan

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure scaffolding — creating config files, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2-T8)
  - **Blocks**: T2, T9, T10, T11, T12
  - **Blocked By**: None (start immediately)

  **References**:
  - `pnpm-workspace.yaml` pattern: `packages: ["apps/*", "packages/*"]`
  - Turborepo pipeline docs: https://turbo.build/repo/docs/reference/configuration
  - Example `turbo.json` pipeline tasks: `build`, `typecheck`, `lint`, `test`, `dev`

  **Acceptance Criteria**:
  - [ ] `git status` exits 0 (git repo initialized)
  - [ ] `package.json` exists at root with correct workspace config
  - [ ] `pnpm-workspace.yaml` exists
  - [ ] `turbo.json` exists with `build`, `typecheck`, `lint`, `dev` pipeline tasks defined
  - [ ] `.gitignore` covers all standard exclusions
  - [ ] Initial git commit made: `git log --oneline | head -1` shows the init commit

  **QA Scenarios**:
  ```
  Scenario: pnpm install runs from root without errors
    Tool: Bash
    Steps:
      1. Run: pnpm install from /home/thapelo/Deveploment/Active/Web/lungilicious
      2. Assert: exit code 0
      3. Assert: node_modules directory created at root
    Expected Result: "Done" or similar success message, exit code 0
    Failure Indicators: Any error about missing packages or workspace config
    Evidence: .sisyphus/evidence/task-1-pnpm-install.txt

  Scenario: git repository initialized and turbo.json is valid
    Tool: Bash
    Steps:
      1. Run: git status
      2. Assert: output contains "On branch" or "nothing to commit" (git initialized)
      3. Run: node -e "JSON.parse(require('fs').readFileSync('turbo.json','utf8')); console.log('valid')"
      4. Assert: output is "valid"
      5. Run: cat turbo.json | grep -E '"build"|"typecheck"|"lint"'
      6. Assert: all three pipeline tasks are present
    Expected Result: Git initialized, turbo.json valid with required pipeline tasks
    Evidence: .sisyphus/evidence/task-1-turbo-validate.txt
  ```

  **Commit**: YES (groups with T2)
  - Message: `chore(monorepo): bootstrap Turborepo + pnpm workspace root`
  - Files: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.nvmrc`, `README.md`
  - Pre-commit: none

- [ ] 2. Shared Packages Scaffold

  **What to do**:
  - Create `packages/tsconfig/` with:
    - `package.json` (name: `@lungilicious/tsconfig`, private: true)
    - `base.json` — strict TS config (strict, noImplicitAny, strictNullChecks, esModuleInterop, target: ES2022, module: NodeNext)
    - `nextjs.json` — extends base, adds Next.js specific settings
    - `nestjs.json` — extends base, adds NestJS decorator metadata settings (emitDecoratorMetadata: true, experimentalDecorators: true)
  - Create `packages/eslint-config/` with:
    - `package.json` (name: `@lungilicious/eslint-config`)
    - `index.js` — base ESLint config (typescript-eslint, no-console rule as error, no-any as warn)
    - `nextjs.js` — extends base + Next.js rules
    - `nestjs.js` — extends base + NestJS-friendly rules
  - Create `packages/types/` with:
    - `package.json` (name: `@lungilicious/types`, main: `dist/index.js`, types: `dist/index.d.ts`)
    - `src/index.ts` — barrel export
    - `src/common.ts` — shared utility types: `PaginatedResult<T>`, `ApiResponse<T>`, `Cursor`, `SortDirection`
    - `src/enums.ts` — shared enums: `Role` (CUSTOMER, ADMIN, EDITOR, OPS, SUPPORT), `OrderStatus`, `PaymentStatus`, `FulfillmentStatus`
    - `tsconfig.json` extending `@lungilicious/tsconfig/nestjs.json`
  - Create `packages/config/` with:
    - `package.json` (name: `@lungilicious/config`)
    - `src/index.ts` — exports `envSchema` (Zod), `AppConfig` type
    - `src/env.schema.ts` — Zod schema for ALL env vars (DATABASE_URL, REDIS_URL, SESSION_SECRET, NODE_ENV, PORT, CORS_ORIGINS, S3_*, PEACH_*)
  - Create `packages/ui/` with:
    - `package.json` (name: `@lungilicious/ui`)
    - `src/tokens.ts` — design token constants from DESIGN.md (COLORS, TYPOGRAPHY, SPACING, SHADOWS)
    - `src/index.ts` — barrel export
    - NOTE: No React components yet. Tokens only.

  **Must NOT do**:
  - Do not create React components in `packages/ui/` yet
  - Do not add business domain types to `packages/types/` yet — only shared cross-cutting types
  - Do not put Prisma schema here — that goes in `prisma/` at root

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File creation and config authoring, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (can run alongside T1, but needs T1's workspace config to resolve)
  - **Parallel Group**: Wave 1 (start after T1 completes, or concurrently if workspace config is set)
  - **Blocks**: T9, T10, T11, T12, T13-T17
  - **Blocked By**: T1

  **References**:
  - DESIGN.md color tokens: `#66001e` (Hibiscus), `#4d6630` (Baobab), `#735c00` (Tamarind), `#fcf9f4` (Cream)
  - Architecture doc enums: Role (CUSTOMER, ADMIN, EDITOR, OPS, SUPPORT), OrderStatus (14 values), FulfillmentStatus
  - Zod env schema pattern: `z.object({ DATABASE_URL: z.string().url(), ... })`

  **Acceptance Criteria**:
  - [ ] All 5 package directories exist with valid `package.json` files
  - [ ] `packages/tsconfig/nestjs.json` has `emitDecoratorMetadata: true`
  - [ ] `packages/types/src/enums.ts` exports `Role` enum with all 5 roles
  - [ ] `packages/config/src/env.schema.ts` has Zod schema covering DATABASE_URL, REDIS_URL, SESSION_SECRET
  - [ ] `packages/ui/src/tokens.ts` exports the 4 brand color constants

  **QA Scenarios**:
  ```
  Scenario: TypeScript packages resolve correctly
    Tool: Bash
    Steps:
      1. Run: cd packages/types && pnpm tsc --noEmit
      2. Assert: exit code 0, no errors
    Expected Result: Zero TypeScript errors in types package
    Evidence: .sisyphus/evidence/task-2-types-typecheck.txt

  Scenario: Config Zod schema is importable from source
    Tool: Bash
    Steps:
      1. Run: node -e "const {z} = require('zod'); const src = require('fs').readFileSync('packages/config/src/env.schema.ts', 'utf8'); const hasDatabaseUrl = src.includes('DATABASE_URL'); const hasSessionSecret = src.includes('SESSION_SECRET'); console.log('DATABASE_URL:', hasDatabaseUrl, '| SESSION_SECRET:', hasSessionSecret)"
      2. Assert: output contains "DATABASE_URL: true" and "SESSION_SECRET: true"
    Expected Result: Config source file exports Zod schema covering required env vars
    Evidence: .sisyphus/evidence/task-2-config-source.txt

  Scenario: UI package exports design tokens
    Tool: Bash
    Steps:
      1. Run: grep -E "66001e|4d6630|735c00|fcf9f4" packages/ui/src/tokens.ts
      2. Assert: at least 4 matches (all 4 brand color hex values present)
    Expected Result: All 4 brand colors defined in tokens.ts
    Evidence: .sisyphus/evidence/task-2-ui-tokens.txt
  ```

  **Commit**: YES (groups with T1)
  - Message: `chore(packages): scaffold shared tsconfig, eslint-config, types, config, ui packages`
  - Files: `packages/tsconfig/**`, `packages/eslint-config/**`, `packages/types/**`, `packages/config/**`, `packages/ui/**`

- [ ] 3. Phase 0 Doc — Threat Model

  **What to do**:
  - Write `docs/architecture/threat-model.md` — a security threat model document
  - Structure: Executive Summary, Scope, Assets (what we protect), Trust Boundaries, Data Flow Diagram (text/ASCII), STRIDE analysis table, Threat catalogue, Mitigations map, Residual risks, PCI scope assessment
  - Cover all threat categories from the architecture doc:
    - Auth threats: credential stuffing, session hijacking, CSRF, account enumeration
    - Payment threats: card data exposure, webhook replay, payment manipulation
    - API threats: injection, IDOR, broken access control, rate limit bypass
    - Infrastructure threats: secret leakage, dependency vulnerabilities, SSRF
    - Admin threats: privilege escalation, audit trail tampering
  - For each threat: Threat ID, Name, STRIDE category, Attack vector, Likelihood (H/M/L), Impact (H/M/L), Risk score, Mitigation, Residual risk
  - Include PCI SAQ-A scope statement: using Peach Payments hosted checkout, card data never touches our servers
  - Include data classification table: PUBLIC, INTERNAL, CONFIDENTIAL, SECRET
  - Minimum 800 words, maximum 2000 words

  **Must NOT do**:
  - Do not write code — this is a documentation task only
  - Do not speculate about threats not relevant to e-commerce/payments
  - Do not include fictional threat actors not relevant to a South African e-commerce context

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Pure documentation task requiring security knowledge and structured writing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T4-T8)
  - **Blocks**: F1
  - **Blocked By**: None

  **References**:
  - Architecture doc sections: 6. Security Architecture, 6.2 Card and payment security, 6.3-6.8
  - STRIDE methodology: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege
  - PCI SAQ-A: applies when using fully hosted payment page (redirect to provider)
  - SA context: POPI Act (South African data protection law) compliance considerations

  **Acceptance Criteria**:
  - [ ] File exists: `docs/architecture/threat-model.md`
  - [ ] Contains STRIDE analysis table
  - [ ] Contains PCI scope statement referencing SAQ-A
  - [ ] Contains data classification table
  - [ ] `wc -l docs/architecture/threat-model.md` returns > 50 lines

  **QA Scenarios**:
  ```
  Scenario: Document exists and contains required sections
    Tool: Bash
    Steps:
      1. Run: test -f docs/architecture/threat-model.md && echo "exists"
      2. Assert: output is "exists"
      3. Run: grep -c "STRIDE\|PCI\|data classification\|mitigation" docs/architecture/threat-model.md
      4. Assert: count >= 4
    Expected Result: File exists with all required section keywords present
    Evidence: .sisyphus/evidence/task-3-threat-model.txt
  ```

  **Commit**: YES (groups with T4-T8 in one docs commit)
  - Message: `docs(architecture): add Phase 0 contract documents`

- [ ] 4. Phase 0 Doc — Module Boundaries

  **What to do**:
  - Write `docs/architecture/module-boundaries.md`
  - Document all 14 backend modules from the architecture doc with their contracts
  - For each module: Purpose, Public API (what it exports to other modules), Dependencies (what modules it imports), Forbidden dependencies (what it must NOT import), Key domain entities owned, Events emitted (if any)
  - Include a dependency graph in ASCII/Mermaid format
  - Include boundary rules: e.g. "Checkout may not import Orders directly — it must go through an event", "Admin must not import Payments — use orchestrator only"
  - Include module ownership table: which module owns which Prisma models
  - Highlight circular dependency risks and how they are prevented
  - Minimum 600 words

  **Must NOT do**:
  - Do not write actual NestJS module code — documentation only
  - Do not invent modules not in the architecture doc

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation task requiring architectural understanding
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1-T3, T5-T8)
  - **Blocks**: F1
  - **Blocked By**: None

  **References**:
  - Architecture doc section 5: all 14 modules with their responsibilities
  - Architecture doc section 13: repository plan and module directory structure
  - The 14 modules: Auth, Users/Roles, Customers, Catalog, Content, Inventory, Cart, Checkout, Orders, Payments, Shipping, Notifications, Admin, Audit

  **Acceptance Criteria**:
  - [ ] File exists: `docs/architecture/module-boundaries.md`
  - [ ] All 14 modules documented
  - [ ] Dependency graph present (ASCII or Mermaid)
  - [ ] Module ownership table present

  **QA Scenarios**:
  ```
  Scenario: All 14 modules documented
    Tool: Bash
    Steps:
      1. Run: grep -c "## " docs/architecture/module-boundaries.md
      2. Assert: count >= 14
      3. Run: grep -E "Auth|Catalog|Checkout|Orders|Payments|Audit" docs/architecture/module-boundaries.md | wc -l
      4. Assert: count >= 6
    Expected Result: At least 14 section headers, key module names all present
    Evidence: .sisyphus/evidence/task-4-module-boundaries.txt
  ```

  **Commit**: YES (groups with T3, T5-T8)

- [ ] 5. Phase 0 Doc — RBAC Matrix

  **What to do**:
  - Write `docs/architecture/rbac-matrix.md`
  - Define the 5 roles from the architecture doc: CUSTOMER, ADMIN, EDITOR, OPS, SUPPORT
  - Create a permission matrix table: rows = actions (e.g. view:own-orders, manage:products, issue:refunds, view:audit-logs), columns = roles, cells = ✓ / — / ✓ (limited)
  - Cover all permission domains: catalog, orders, customers, payments/refunds, content, inventory, admin tools, audit logs, user management, notifications
  - Define permission naming convention: `resource:action` format (e.g. `products:create`, `orders:read`, `refunds:issue`)
  - Specify which roles require MFA: ADMIN, OPS (mandatory), EDITOR (recommended)
  - Specify which roles are blocked from which endpoints (negative permissions)
  - Include a note on admin MFA enforcement and session policy
  - Include a note on customer data access: customers can only access their own records

  **Must NOT do**:
  - Do not write NestJS guard code — documentation only
  - Do not add roles not in the architecture doc

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation task, table-heavy structured writing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T27, F1
  - **Blocked By**: None

  **References**:
  - Architecture doc section 5.2: Users and Roles Module — base roles (customer, admin, editor, ops, support)
  - Architecture doc section 6.4: Authorization model — examples of role-based access
  - Architecture doc section 6.3: MFA required for admin and staff

  **Acceptance Criteria**:
  - [ ] File exists: `docs/architecture/rbac-matrix.md`
  - [ ] Permission matrix table covers all 5 roles
  - [ ] MFA requirements documented
  - [ ] Permission naming convention defined

  **QA Scenarios**:
  ```
  Scenario: RBAC matrix contains all 5 roles
    Tool: Bash
    Steps:
      1. Run: grep -E "CUSTOMER|ADMIN|EDITOR|OPS|SUPPORT" docs/architecture/rbac-matrix.md | wc -l
      2. Assert: count >= 5
    Expected Result: All 5 role names present in document
    Evidence: .sisyphus/evidence/task-5-rbac-matrix.txt
  ```

  **Commit**: YES (groups with T3-T4, T6-T8)

- [ ] 6. Phase 0 Doc — Payment Abstraction Contract

  **What to do**:
  - Write `docs/payments/payment-abstraction.md`
  - Document the `PaymentProvider` interface with full TypeScript type signatures (as documentation, not actual `.ts` file):
    - `createCheckoutSession(input: CreateSessionInput): Promise<CheckoutSession>`
    - `verifyWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookVerificationResult>`
    - `getTransactionStatus(providerTransactionId: string): Promise<PaymentProviderResult>`
    - `refund(input: RefundInput): Promise<RefundResult>`
    - `mapStatus(providerStatus: string): PaymentStatus`
  - Document all input/output types with field descriptions
  - Document the `PaymentProviderRegistry` registry pattern
  - Document Peach Payments v1 specific integration details:
    - Auth: Bearer token + entity ID
    - Hosted checkout URL pattern
    - Webhook signature verification (HMAC-SHA256)
    - Webhook event types: PAYMENT.SUCCEEDED, PAYMENT.FAILED, REFUND.SUCCEEDED
    - Sandbox vs production base URLs
  - Document idempotency strategy: `idempotencyKey` on all mutation operations
  - Document the webhook processing flow (enqueue → verify → idempotency check → persist → dispatch)
  - Document what data is stored vs what stays with provider (token references only, never PANs)

  **Must NOT do**:
  - Do not write actual TypeScript implementation files
  - Do not hardcode API keys or secrets

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation task requiring payment domain knowledge
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: F1
  - **Blocked By**: None

  **References**:
  - Architecture doc section 5.10: Payments Module — interface design
  - Architecture doc section 7: Payment Strategy Plan — full checkout flow (10 steps)
  - Research finding: Peach Payments uses HMAC-SHA256 webhook signatures; hosted checkout redirect pattern
  - Research finding: `PaymentProviderRegistry` with Strategy pattern (see research notes)

  **Acceptance Criteria**:
  - [ ] File exists: `docs/payments/payment-abstraction.md`
  - [ ] All 5 interface methods documented with type signatures
  - [ ] Peach Payments specific details included
  - [ ] Data storage policy documented (tokens only, no PANs)

  **QA Scenarios**:
  ```
  Scenario: Payment abstraction doc contains interface methods
    Tool: Bash
    Steps:
      1. Run: grep -E "createCheckoutSession|verifyWebhook|refund|mapStatus" docs/payments/payment-abstraction.md | wc -l
      2. Assert: count >= 4
    Expected Result: All 4+ interface methods documented
    Evidence: .sisyphus/evidence/task-6-payment-abstraction.txt
  ```

  **Commit**: YES (groups with T3-T5, T7-T8)

- [ ] 7. Phase 0 Doc — OpenAPI v1 Specification

  **What to do**:
  - Write `docs/api/openapi-v1.md` — the OpenAPI v1 contract for Phase 1 endpoints only
  - Document ALL of the following endpoints. This is the complete list — do not invent additional endpoints, but document every one listed here:

  **Health (implemented in Phase 1)**:
  - `GET /health` — overall health check (public)
  - `GET /health/db` — database health only (public)
  - `GET /health/redis` — Redis health only (public)

  **Auth (stubs in Phase 1)**:
  - `POST /auth/register` — create new customer account (public)
  - `POST /auth/login` — authenticate and create session (public)
  - `POST /auth/logout` — revoke session (requires session)
  - `POST /auth/refresh` — refresh session (requires session)
  - `POST /auth/forgot-password` — request password reset (public)
  - `POST /auth/reset-password` — complete password reset (public)
  - `POST /auth/verify-email` — verify email address (public)
  - `POST /auth/mfa/verify` — verify MFA code (requires partial session)

  **Customer (stubs — future phase)**:
  - `GET /me` — get own profile (requires session, returns 501 in Phase 1)
  - `PATCH /me` — update own profile (requires session)
  - `GET /me/orders` — get own orders (requires session)
  - `GET /me/orders/:id` — get single order (requires session)
  - `GET /me/addresses` — get own addresses (requires session)
  - `POST /me/addresses` — add address (requires session)
  - `PATCH /me/addresses/:id` — update address (requires session)
  - `DELETE /me/addresses/:id` — delete address (requires session)

  **Cart (stubs — future phase)**:
  - `GET /cart` — get current cart (public or session)
  - `POST /cart/items` — add item to cart
  - `PATCH /cart/items/:id` — update cart item quantity
  - `DELETE /cart/items/:id` — remove cart item
  - `POST /cart/apply-coupon` — apply coupon code

  **Checkout (stubs — future phase)**:
  - `POST /checkout/start` — initiate checkout from cart
  - `POST /checkout/address` — set delivery address
  - `POST /checkout/shipping` — select shipping method
  - `POST /checkout/payment-intent` — create payment intent with provider
  - `POST /checkout/confirm` — confirm checkout session

  **Payments (stubs — future phase)**:
  - `POST /payments/create-session` — create provider checkout session
  - `POST /payments/refunds` — issue refund (admin, requires ADMIN role)
  - `POST /payments/webhooks/:provider` — receive payment provider webhook (public, signature verified)

  **Public Storefront (stubs — future phase)**:
  - `GET /products` — list products
  - `GET /products/:slug` — get product by slug
  - `GET /categories` — list categories
  - `GET /pages/:slug` — get content page by slug
  - `GET /faq` — list FAQ items
  - `GET /campaigns/:slug` — get campaign page by slug

  **Admin (stubs — future phase)**:
  - `GET /admin/dashboard` — admin dashboard stats
  - `GET /admin/products`, `POST /admin/products`, `GET /admin/products/:id`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`
  - `GET /admin/categories`, `POST /admin/categories`, `PATCH /admin/categories/:id`, `DELETE /admin/categories/:id`
  - `GET /admin/pages`, `POST /admin/pages`, `PATCH /admin/pages/:id`, `DELETE /admin/pages/:id`
  - `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id`, `POST /admin/orders/:id/refund`
  - `GET /admin/inventory`, `PATCH /admin/inventory/:variantId`
  - `GET /admin/audit-logs`
  - All admin routes require `ADMIN` role

  - For each endpoint: method, path, description, request body (if any), response shape, auth requirements, rate limit notes
  - Note clearly which endpoints are "IMPLEMENTED in Phase 1" (health, /me stub) vs "PLANNED for future phases" (everything else)
  - Include a note on authentication: all endpoints except public storefront, auth, health, and webhooks require session cookie

  **Must NOT do**:
  - Do not write a YAML OpenAPI spec file — structured Markdown documentation is the format here
  - Do not invent endpoints beyond the list above

  **Must NOT do**:
  - Do not write a full YAML OpenAPI spec file — structured Markdown documentation is the format here
  - Do not invent endpoints not in the architecture doc

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: API documentation task, structured writing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T30, F1
  - **Blocked By**: None

  **References**:
  - Architecture doc section 9: API Plan — full endpoint list
  - Architecture doc section 5.1: Auth Module endpoints
  - Session auth: cookie-based, endpoints return `Set-Cookie` with `HttpOnly; Secure; SameSite=Strict`

  **Acceptance Criteria**:
  - [ ] File exists: `docs/api/openapi-v1.md`
  - [ ] Health endpoints documented
  - [ ] Auth endpoints (8) documented
  - [ ] Authentication requirements per endpoint documented
  - [ ] Phase 1 vs future phases clearly labelled

  **QA Scenarios**:
  ```
  Scenario: API doc contains required endpoint groups
    Tool: Bash
    Steps:
      1. Run: grep -E "GET /health|POST /auth|GET /me|POST /checkout" docs/api/openapi-v1.md | wc -l
      2. Assert: count >= 4
    Expected Result: Key endpoint paths documented
    Evidence: .sisyphus/evidence/task-7-openapi.txt
  ```

  **Commit**: YES (groups with T3-T6, T8)

- [ ] 8. Phase 0 Doc — Database Schema v1

  **What to do**:
  - Write `docs/data/database-schema-v1.md`
  - Document every table across ALL domains. The complete list of tables to document:

  **Identity domain**: users, roles, user_roles, sessions, password_resets, email_verifications, mfa_factors
  **Customer domain**: customers, customer_addresses, customer_preferences, customer_payment_methods, customer_support_notes
  **Catalog domain**: categories, products, product_variants, product_images, product_badges, product_seo, product_attributes, design_assets
  **Pricing/Promotions domain**: prices, promotions, coupon_codes, coupon_redemptions
  **Commerce domain (Cart/Checkout)**: carts, cart_items, checkout_sessions, stock_reservations, inventory
  **Commerce domain (Orders/Shipping)**: orders, order_items, order_status_history, shipping_methods, shipments, shipment_events
  **Payments domain**: payment_intents, payment_transactions, refunds, webhook_events, idempotency_keys
  **Content domain**: pages, page_sections, faq_items, testimonials, galleries, gallery_items
  **Platform domain**: audit_logs, feature_flags, job_runs

  - For each table: purpose, key columns with types, indexes, foreign keys, notes on sensitive data
  - For sensitive fields (email, phone, address, notes): note encryption strategy
  - Include ER diagram in ASCII/Mermaid for the most critical flows: checkout → order → payment
  - Include a note on soft deletes strategy: use `deletedAt` on key tables, not hard deletes
  - Include a note on UUID vs auto-increment: all PKs are UUIDs
  - Include a note on timestamps: all tables have `createdAt`, key tables have `updatedAt`
  - Include a note on multi-file Prisma schema organization (one `.prisma` file per domain)

  **Must NOT do**:
  - Do not write actual Prisma schema — that is T13-T17
  - Do not invent tables beyond the list above

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Data documentation task, table-heavy writing
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T13-T17, F1
  - **Blocked By**: None

  **References**:
  - Architecture doc section 8: Data Model Plan — full table list by domain
  - Architecture doc section 6.5: Data protection — encrypted fields, encrypted backups
  - Prisma multi-file schema: `prisma.config.ts` with `schema: 'prisma/'` directory pointing to per-domain `.prisma` files

  **Acceptance Criteria**:
  - [ ] File exists: `docs/data/database-schema-v1.md`
  - [ ] All 9 domain sections documented (Identity, Customer, Catalog, Pricing/Promotions, Cart/Checkout, Orders/Shipping, Payments, Content, Platform)
  - [ ] `Pricing/Promotions` domain section explicitly documents `prices`, `promotions`, `coupon_codes`, `coupon_redemptions`
  - [ ] ER diagram present for checkout→order→payment flow
  - [ ] UUID PK strategy documented
  - [ ] Soft delete strategy documented

  **QA Scenarios**:
  ```
  Scenario: Database schema doc covers all domains
    Tool: Bash
    Steps:
      1. Run: grep -E "Identity|Customer|Catalog|Orders|Payments|Content|Platform" docs/data/database-schema-v1.md | wc -l
      2. Assert: count >= 7
    Expected Result: All 7+ domain sections present
    Evidence: .sisyphus/evidence/task-8-db-schema.txt
  ```

  **Commit**: YES (groups with T3-T7 in one docs commit)
  - Message: `docs(architecture): add Phase 0 contract documents`
  - Files: `docs/architecture/threat-model.md`, `docs/architecture/module-boundaries.md`, `docs/architecture/rbac-matrix.md`, `docs/payments/payment-abstraction.md`, `docs/api/openapi-v1.md`, `docs/data/database-schema-v1.md`

- [ ] 9. NestJS API App Bootstrap

  **What to do**:
  - Create `apps/api/` as a NestJS application with Fastify adapter
  - `package.json`: name `@lungilicious/api`, add dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-fastify`, `fastify`, `@fastify/secure-session`, `@nestjs/config`, `@nestjs/swagger`, `@nestjs/terminus`, `@nestjs/bullmq`, `bullmq`, `ioredis`, `prisma`, `@prisma/client`, `argon2`, `zod`, `pino`, `pino-pretty`
  - `apps/api/src/main.ts`:
    ```typescript
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }))
    await app.register(require('@fastify/secure-session'), { /* session config */ })
    app.enableCors({ origin: config.corsOrigins, credentials: true })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    await app.listen(config.port, '0.0.0.0')
    ```
  - `apps/api/src/app.module.ts`: root module importing ConfigModule, DatabaseModule (stub), LoggerModule
  - `apps/api/tsconfig.json`: extends `@lungilicious/tsconfig/nestjs.json`
  - `apps/api/.eslintrc.js`: extends `@lungilicious/eslint-config/nestjs`
  - Wire `@lungilicious/config` env validation into `ConfigModule.forRoot()`
  - `apps/api/src/common/` directory structure — empty directories for: `guards/`, `decorators/`, `interceptors/`, `filters/`, `pipes/`, `middleware/`

  **Must NOT do**:
  - Do not wire business modules yet (those come in Wave 3)
  - Do not configure session secret inline — read from env
  - Do not use Express adapter — Fastify only
  - Do not add JWT packages — session-based auth only

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Bootstrapping a standard NestJS app with known patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T10, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T19, T20, T21, T22, T23, T24, T26, T27, T28, T29, T30
  - **Blocked By**: T1, T2

  **References**:
  - NestJS Fastify bootstrap: `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }))`
  - `@fastify/secure-session` session config: `key: Buffer.from(SESSION_SECRET, 'hex')`, `cookie.httpOnly: true`, `cookie.secure: process.env.NODE_ENV === 'production'`, `cookie.sameSite: 'strict'`
  - `packages/config/src/env.schema.ts` — import and use for ConfigModule validation
  - Research finding: `app.getHttpAdapter().getInstance().ready()` needed in tests

  **Acceptance Criteria**:
  - [ ] `apps/api/src/main.ts` exists with Fastify adapter
  - [ ] `apps/api/src/app.module.ts` exists
  - [ ] `pnpm --filter @lungilicious/api typecheck` passes
  - [ ] App structure follows `src/common/` + `src/modules/` layout

  **QA Scenarios**:
  ```
  Scenario: API app TypeScript compiles without errors
    Tool: Bash
    Steps:
      1. Run: pnpm --filter @lungilicious/api typecheck
      2. Assert: exit code 0, no error output
    Expected Result: Zero TypeScript errors
    Evidence: .sisyphus/evidence/task-9-api-typecheck.txt

  Scenario: API app main.ts exists and has Fastify bootstrap pattern
    Tool: Bash
    Steps:
      1. Run: grep -E "NestFastifyApplication|FastifyAdapter" apps/api/src/main.ts
      2. Assert: at least one match found (exit code 0)
      3. Run: grep "@fastify/secure-session" apps/api/src/main.ts apps/api/package.json
      4. Assert: at least one match found
    Expected Result: Fastify adapter and secure-session present in bootstrap
    Evidence: .sisyphus/evidence/task-9-api-fastify-pattern.txt

  Scenario: API app has correct directory structure
    Tool: Bash
    Steps:
      1. Run: ls apps/api/src/common/
      2. Assert: directories guards/, decorators/, interceptors/, filters/, pipes/ all listed
      3. Run: ls apps/api/src/
      4. Assert: main.ts and app.module.ts present
    Expected Result: Expected directory structure created
    Evidence: .sisyphus/evidence/task-9-api-structure.txt
  ```

  **Commit**: YES (groups with T10, T11, T12)
  - Message: `feat(apps): bootstrap NestJS API, Worker, storefront, and admin app shells`

- [ ] 10. NestJS Worker App Bootstrap

  **What to do**:
  - Create `apps/worker/` as a NestJS application WITHOUT HTTP server (no controller, no Fastify)
  - `package.json`: name `@lungilicious/worker`, similar deps to API but no Fastify/Swagger
  - `apps/worker/src/main.ts`: `NestFactory.createApplicationContext(WorkerModule)` — no HTTP listener
  - `apps/worker/src/worker.module.ts`: imports BullMQ connection module, queue processor modules (stubs)
  - Define queue names as constants in `apps/worker/src/queues.constants.ts`: `QUEUE_EMAIL`, `QUEUE_NOTIFICATIONS`, `QUEUE_WEBHOOKS`, `QUEUE_INVENTORY`, `QUEUE_EXPORTS`
  - Create stub processor files (no actual logic yet):
    - `src/processors/email.processor.ts`
    - `src/processors/notifications.processor.ts`
    - `src/processors/webhooks.processor.ts`
    - `src/processors/inventory.processor.ts`
    - `src/processors/exports.processor.ts`
  - Each processor: `@Processor(QUEUE_NAME) export class XProcessor extends WorkerHost { async process(job: Job) { throw new Error('Not implemented') } }`
  - `apps/worker/tsconfig.json`: extends `@lungilicious/tsconfig/nestjs.json`

  **Must NOT do**:
  - Do not implement any actual job processing logic — stubs only
  - Do not add an HTTP server — this is context-only
  - Do not import business services yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard NestJS worker bootstrap, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T25
  - **Blocked By**: T1, T2

  **References**:
  - NestJS context-only app: `NestFactory.createApplicationContext(WorkerModule)` (no HTTP server)
  - `@nestjs/bullmq` pattern: `@Processor('queue-name') class Proc extends WorkerHost { async process(job: Job) {} }`
  - Queue name constants: define in shared file, import in both API and Worker

  **Acceptance Criteria**:
  - [ ] `apps/worker/src/main.ts` uses `createApplicationContext` (no HTTP)
  - [ ] 5 processor stub files created
  - [ ] `pnpm --filter @lungilicious/worker typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Worker app TypeScript compiles without errors
    Tool: Bash
    Steps:
      1. Run: pnpm --filter @lungilicious/worker typecheck
      2. Assert: exit code 0
    Expected Result: Zero TypeScript errors
    Evidence: .sisyphus/evidence/task-10-worker-typecheck.txt
  ```

  **Commit**: YES (groups with T9, T11, T12)

- [ ] 11. Next.js Storefront App Scaffold

  **What to do**:
  - Create `apps/storefront/` as a Next.js 15 application (App Router)
  - `package.json`: name `@lungilicious/storefront`, deps: `next`, `react`, `react-dom`, `@lungilicious/ui`, `@lungilicious/types`
  - `apps/storefront/next.config.ts`: minimal config (no pages yet)
  - `apps/storefront/src/app/layout.tsx`: root layout with Noto Serif + Manrope font imports (Google Fonts), cream background token applied, `<html lang="en">`
  - `apps/storefront/src/app/page.tsx`: returns `null` or a minimal placeholder div with brand color — NO real content
  - `apps/storefront/src/app/globals.css`: CSS custom properties for all design tokens from DESIGN.md (mapped as `--color-primary`, `--color-secondary`, etc.)
  - `apps/storefront/tsconfig.json`: extends `@lungilicious/tsconfig/nextjs.json`
  - Do NOT wire any API calls, authentication, or data fetching

  **Must NOT do**:
  - Do not build any pages, components, or UI elements beyond the shell
  - Do not add auth logic or API client yet
  - Do not add content CMS or API routes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Shell scaffold, minimal configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T34
  - **Blocked By**: T1, T2

  **References**:
  - DESIGN.md fonts: Noto Serif (display/headlines), Manrope (UI/body)
  - DESIGN.md colors: `#fcf9f4` (background), `#66001e` (primary), `#4d6630` (secondary), `#735c00` (tertiary)
  - CSS custom props: `--color-primary: #66001e`, `--font-display: 'Noto Serif'`, etc.
  - Next.js 15 App Router: `app/layout.tsx` + `app/page.tsx` minimum

  **Acceptance Criteria**:
  - [ ] `apps/storefront/src/app/layout.tsx` exists with Google Fonts
  - [ ] `apps/storefront/src/app/globals.css` has CSS custom properties for all 4 brand colors
  - [ ] `pnpm --filter @lungilicious/storefront typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Storefront app builds successfully
    Tool: Bash
    Steps:
      1. Run: pnpm --filter @lungilicious/storefront build
      2. Assert: exit code 0
    Expected Result: Next.js build completes successfully
    Evidence: .sisyphus/evidence/task-11-storefront-build.txt
  ```

  **Commit**: YES (groups with T9, T10, T12)

- [ ] 12. Next.js Admin App Scaffold

  **What to do**:
  - Create `apps/admin/` as a Next.js 15 application (App Router) — identical structure to storefront but separate app
  - `package.json`: name `@lungilicious/admin`, same deps as storefront
  - `apps/admin/next.config.ts`: minimal config, different port (`PORT=3002`)
  - `apps/admin/src/app/layout.tsx`: minimal root layout (same fonts, same design tokens)
  - `apps/admin/src/app/page.tsx`: returns minimal placeholder — "Lungilicious Admin" text only, no components
  - `apps/admin/src/app/globals.css`: same design token CSS vars as storefront (copy)
  - `apps/admin/tsconfig.json`: extends `@lungilicious/tsconfig/nextjs.json`
  - Note: Admin UI pages are explicitly out of scope for this plan — this is a shell only

  **Must NOT do**:
  - Do not build any admin UI pages, tables, forms, or components
  - Do not add auth flows, route protection, or data tables

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Shell scaffold, near-identical to T11
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10, T11)
  - **Parallel Group**: Wave 2
  - **Blocks**: T34
  - **Blocked By**: T1, T2

  **References**:
  - Same as T11 — copy structure, change name to `@lungilicious/admin`, port to 3002

  **Acceptance Criteria**:
  - [ ] `apps/admin/src/app/layout.tsx` exists
  - [ ] `pnpm --filter @lungilicious/admin typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Admin app builds successfully
    Tool: Bash
    Steps:
      1. Run: pnpm --filter @lungilicious/admin build
      2. Assert: exit code 0
    Expected Result: Next.js build completes
    Evidence: .sisyphus/evidence/task-12-admin-build.txt
  ```

  **Commit**: YES (groups with T9, T10, T11)
  - Message: `feat(apps): bootstrap NestJS API, Worker, storefront, and admin app shells`

- [ ] 13. Prisma Schema — Identity & Auth Domain

  **What to do**:
  - Create `prisma/` directory at monorepo root
  - Create `prisma.config.ts` **at the monorepo root** (NOT inside `prisma/` — this is the standard Prisma CLI discovery location):
    ```typescript
    import { defineConfig } from 'prisma/config'
    export default defineConfig({
      schema: 'prisma/schema',
      migrations: { path: 'prisma/migrations' }
    })
    ```
  - Create `prisma/schema/` directory for the multi-file schema approach
  - Create `prisma/schema/_base.prisma` — this file contains the generator and datasource blocks:
    ```prisma
    generator client {
      provider = "prisma-client-js"
      output   = "../generated/client"
    }
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
  - All subsequent `.prisma` files in `prisma/schema/` define only models (no generator/datasource)
  - Create `prisma/schema/identity.prisma` with ALL tables from the Identity domain:
    - `User`: id (uuid), email (unique), passwordHash, emailVerifiedAt, createdAt, updatedAt, deletedAt (soft delete), roles relation
    - `Role`: id, name (enum: CUSTOMER, ADMIN, EDITOR, OPS, SUPPORT), permissions
    - `UserRole`: userId, roleId, assignedAt, assignedBy (pivot)
    - `Session`: id, userId, data (Json), expiresAt, createdAt, ipAddress, userAgent, revokedAt
    - `PasswordReset`: id, userId, tokenHash, expiresAt, usedAt, createdAt
    - `EmailVerification`: id, userId, tokenHash, expiresAt, usedAt, createdAt
    - `MfaFactor`: id, userId, type (TOTP, SMS), secret (encrypted), verifiedAt, createdAt
  - Add appropriate indexes: `email`, `tokenHash` (unique), `expiresAt`
  - Add `@@map` for all models to snake_case table names

  **Must NOT do**:
  - Do not add business logic or seed data
  - Do not create migrations yet (that's T18)
  - Do not store raw passwords — `passwordHash` field only

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires careful schema design, security-sensitive models, many related tables
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T14, T15, T16, T17)
  - **Parallel Group**: Wave 2
  - **Blocks**: T18
  - **Blocked By**: T1, T2

  **References**:
  - Architecture doc section 8: Data Model Plan — Identity tables
  - Architecture doc section 5.1: Auth Module — MFA, sessions, password resets
  - All PKs are UUIDs: `id String @id @default(uuid())`
  - `@@map("table_name")` for snake_case DB table names
  - Soft delete pattern: `deletedAt DateTime?` on User

  **Acceptance Criteria**:
  - [ ] `prisma/schema/identity.prisma` exists with all 7 models
  - [ ] `Session` model has `revokedAt` for session revocation support
  - [ ] `MfaFactor` model exists
  - [ ] All models use UUID PKs and snake_case `@@map`

  **QA Scenarios**:
  ```
  Scenario: Identity schema file exists with all required models
    Tool: Bash
    Steps:
      1. Run: test -f prisma/schema/identity.prisma && echo "exists"
      2. Assert: output is "exists"
      3. Run: grep -E "^model " prisma/schema/identity.prisma
      4. Assert: output lists User, Role, UserRole, Session, PasswordReset, EmailVerification, MfaFactor (7 models)
    Expected Result: All 7 identity models present in file
    Evidence: .sisyphus/evidence/task-13-identity-models.txt

  Scenario: Session model has revokedAt and MfaFactor exists
    Tool: Bash
    Steps:
      1. Run: grep "revokedAt" prisma/schema/identity.prisma
      2. Assert: at least one match (Session.revokedAt field present)
      3. Run: grep "model MfaFactor" prisma/schema/identity.prisma
      4. Assert: match found
    Expected Result: Required security fields present
    Evidence: .sisyphus/evidence/task-13-identity-security-fields.txt
  ```

  **Commit**: YES (groups with T14-T17, T18)

- [ ] 14. Prisma Schema — Customer Domain

  **What to do**:
  - Create `prisma/schema/customer.prisma` with all Customer domain tables:
    - `Customer`: id (uuid), userId (FK to User, unique), firstName, lastName, phone (nullable, store with intent to encrypt), avatarUrl, marketingConsent (bool), communicationConsent (bool), notes (nullable, access-controlled), createdAt, updatedAt, deletedAt
    - `CustomerAddress`: id, customerId (FK), label (string, e.g. "Home"), firstName, lastName, line1, line2 (nullable), city, province, postalCode, country (default "ZA"), isDefault (bool), createdAt, updatedAt
    - `CustomerPreference`: id, customerId (FK, unique), currency (default "ZAR"), language (default "en"), dietaryFlags (String[], e.g. ["VEGAN", "BANTING"]), createdAt, updatedAt
    - `CustomerPaymentMethod`: id, customerId (FK), provider (enum: PEACH, PAYFAST, YOCO), providerToken (string, NOT the card number), brand (string, e.g. "Visa"), last4 (string), expiryMonth (int), expiryYear (int), isDefault (bool), createdAt, revokedAt (nullable)
    - `CustomerSupportNote`: id, customerId (FK), content, createdBy (userId of staff), createdAt (no update — append-only)

  - Add indexes: `customerId`, `isDefault`

  **Must NOT do**:
  - Do not add `cardNumber`, `cvv`, or any raw card fields — store tokens only
  - Do not store raw phone numbers without noting encryption intent in comments

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Security-sensitive models (payment tokens, personal data), requires careful field design
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T13, T15, T16, T17)
  - **Parallel Group**: Wave 2
  - **Blocks**: T18
  - **Blocked By**: T1, T2

  **References**:
  - Architecture doc section 5.3: Customers Module — sensitive fields
  - Architecture doc section 8: Data Model — Customers tables
  - Architecture doc section 6.2: Card security — store provider references, not raw card data
  - `CustomerPaymentMethod.providerToken` = Peach Payments stored card token (not PAN)

  **Acceptance Criteria**:
  - [ ] `prisma/schema/customer.prisma` exists with all 5 models
  - [ ] No `cardNumber` or `cvv` fields anywhere
  - [ ] `CustomerPaymentMethod` has `providerToken` field (not card data)

  **QA Scenarios**:
  ```
  Scenario: No raw card fields in customer schema
    Tool: Bash
    Steps:
      1. Run: grep -E "cardNumber|cvv|pan|rawCard" prisma/schema/customer.prisma
      2. Assert: no output (exit code 1 = no matches found)
    Expected Result: Zero matches for forbidden card field names
    Evidence: .sisyphus/evidence/task-14-no-raw-cards.txt
  ```

  **Commit**: YES (groups with T13, T15-T17, T18)

- [ ] 15. Prisma Schema — Catalog + Pricing Domain

  **What to do**:
  - Create `prisma/schema/catalog.prisma` with all Catalog domain tables:
    - `Category`: id, name, slug (unique), description (nullable), parentId (FK to self, nullable, for nested categories), imageUrl, isActive, sortOrder, seoTitle, seoDescription, createdAt, updatedAt
    - `Product`: id, slug (unique), name, headline (nullable), subheadline (nullable), shortDescription, longDescription, storyIntro (nullable), ingredientNarrative (nullable), usageSuggestions (nullable), flavorNotes (nullable), wellnessPositioning (nullable), status (enum: DRAFT, ACTIVE, ARCHIVED), isFeatured (bool), categoryId (FK), layoutVariant (enum: LEFT_MEDIA, RIGHT_MEDIA, CENTERED, OFFSET, STACKED), themeAccent (enum: HIBISCUS, BAOBAB, TAMARIND, NEUTRAL), emphasisStyle (enum: EDITORIAL, CATALOG, CAMPAIGN, STORY), createdAt, updatedAt, deletedAt
    - `ProductVariant`: id, productId (FK), sku (unique), name, price (Decimal), compareAtPrice (Decimal nullable), isDefault (bool), sortOrder, createdAt, updatedAt
    - `ProductImage`: id, productId (FK), url, altText, caption (nullable), isPrimary (bool), sortOrder, createdAt
    - `ProductBadge`: id, productId (FK), badgeType (enum: SUGAR_FREE, BANTING_FRIENDLY, VEGAN_FRIENDLY, PLANT_BASED, HERBAL, NATURALLY_CRAFTED) — note: embed badge type directly, no separate Badge table needed
    - `ProductSeo`: id, productId (FK, unique), title, description, canonicalUrl (nullable), openGraphImage (nullable)
    - `ProductAttribute`: id, productId (FK), key (e.g. "storage", "preparation"), value, sortOrder
    - `DesignAsset`: id, name, type (enum: MOTIF, ACCENT, BACKGROUND), url, altText, botanicalFamily (nullable), createdAt

  - Also create all Pricing/Promotions domain tables in the same file:
    - `Price`: id, productVariantId (FK), amount (Decimal), currency (string, default "ZAR"), validFrom (DateTime nullable), validUntil (DateTime nullable), isActive (bool), createdAt (pricing history support)
    - `Promotion`: id, name, description (nullable), type (enum: PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING), discountValue (Decimal), minOrderAmount (Decimal nullable), maxUsageCount (int nullable), usedCount (int default 0), isActive (bool), validFrom (DateTime nullable), validUntil (DateTime nullable), createdAt, updatedAt
    - `CouponCode`: id, promotionId (FK), code (unique), maxUsageCount (int nullable), usedCount (int default 0), isActive (bool), createdAt
    - `CouponRedemption`: id, couponCodeId (FK), orderId (FK), customerId (FK), discountAmount (Decimal), redeemedAt

  **Must NOT do**:
  - Do not add inventory/stock here (that's T16 commerce domain)
  - Do not add `Float` for monetary values — `Decimal` only
  - Do not add a separate `Badge` model — use the `ProductBadge.badgeType` enum approach (simpler, avoids extra join)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Large schema with many models, editorial fields, and design-system-aware layout metadata
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T13, T14, T16, T17)
  - **Parallel Group**: Wave 2
  - **Blocks**: T18
  - **Blocked By**: T1, T2

  **References**:
  - Architecture doc section 5.4: Catalog Module — full field list (name, slug, story copy, ingredients, badges, etc.)
  - Architecture doc section 10.2: Product Content Requirements — editorial storytelling fields
  - Architecture doc section 10.3: Layout metadata (layoutVariant, themeAccent, emphasisStyle)
  - Architecture doc section 10.4: DesignAsset entity for botanical motifs
  - Architecture doc section 10.6: Badge system (Sugar-Free, Banting-Friendly, Vegan-Friendly, Plant-Based, Herbal, Naturally Crafted)
  - Architecture doc section 8 Pricing/Promotions: prices, promotions, coupon_codes, coupon_redemptions

  **Acceptance Criteria**:
  - [ ] `prisma/schema/catalog.prisma` exists with all catalog + pricing models (12+ models total)
  - [ ] `Product` has editorial fields: `storyIntro`, `ingredientNarrative`, `wellnessPositioning`
  - [ ] `Product` has layout metadata fields: `layoutVariant`, `themeAccent`, `emphasisStyle`
  - [ ] `ProductBadge.badgeType` enum covers all 6 badge types
  - [ ] `ProductVariant.price` uses `Decimal` type (not Float)
  - [ ] `Promotion`, `CouponCode`, `CouponRedemption` models exist
  - [ ] `Price` model exists for pricing history

  **QA Scenarios**:
  ```
  Scenario: Catalog schema contains editorial, layout, and pricing fields
    Tool: Bash
    Steps:
      1. Run: grep -E "storyIntro|layoutVariant|themeAccent|emphasisStyle" prisma/schema/catalog.prisma | wc -l
      2. Assert: count >= 4
      3. Run: grep -E "^model Promotion|^model CouponCode|^model Price|^model CouponRedemption" prisma/schema/catalog.prisma | wc -l
      4. Assert: count >= 4
    Expected Result: All editorial/layout fields and all 4 pricing models present
    Evidence: .sisyphus/evidence/task-15-catalog-schema.txt
  ```

  **Commit**: YES (groups with T13, T14, T16-T18)

- [ ] 16. Prisma Schema — Commerce Domain

  **What to do**:
  - Create `prisma/schema/commerce.prisma` with Cart, Checkout, Orders, Inventory, Shipping tables:
    - `Cart`: id, customerId (FK nullable — guest carts), sessionId (nullable), status (enum: ACTIVE, MERGED, ABANDONED, CONVERTED), expiresAt, createdAt, updatedAt
    - `CartItem`: id, cartId (FK), productVariantId (FK), quantity, priceAtAdd (Decimal), createdAt, updatedAt
    - `CheckoutSession`: id, cartId (FK), customerId (FK nullable), addressId (FK nullable), shippingMethodId (FK nullable), status (enum: PENDING, PAYMENT_INITIATED, COMPLETED, EXPIRED, ABANDONED), expiresAt, createdAt, updatedAt
    - `StockReservation`: id, productVariantId (FK), quantity, orderId (FK nullable), checkoutSessionId (FK nullable), status (enum: PENDING, CONFIRMED, RELEASED, EXPIRED), expiresAt, confirmedAt (nullable), releasedAt (nullable), createdAt
    - `Inventory`: id, productVariantId (FK, unique), availableQuantity (int), reservedQuantity (int), soldQuantity (int), lowStockThreshold (int, default 5), updatedAt
    - `Order`: id, orderNumber (unique, auto-generated), customerId (FK), addressId (FK), status (enum: DRAFT, PENDING_PAYMENT, PAYMENT_PROCESSING, PAID, AWAITING_FULFILLMENT, FULFILLED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED, PAYMENT_FAILED), subtotal (Decimal), shippingFee (Decimal), taxAmount (Decimal), totalAmount (Decimal), currency (default "ZAR"), notes (nullable), createdAt, updatedAt
    - `OrderItem`: id, orderId (FK), productVariantId (FK), productSnapshotName (string — denormalized), sku (string), quantity, unitPrice (Decimal), lineTotal (Decimal)
    - `OrderStatusHistory`: id, orderId (FK), fromStatus, toStatus, changedBy (userId), reason (nullable), createdAt
    - `ShippingMethod`: id, name, description, price (Decimal), estimatedDays (int), isActive, createdAt
    - `Shipment`: id, orderId (FK), trackingCode (nullable), carrier (nullable), status (enum: UNFULFILLED, PACKED, SHIPPED, DELIVERED, RETURNED), shippedAt (nullable), deliveredAt (nullable), createdAt, updatedAt
    - `ShipmentEvent`: id, shipmentId (FK), status, description, occurredAt, createdAt

  **Must NOT do**:
  - Do not add payment tables here (those are in platform domain T17)
  - Do not add promotional/coupon logic yet (defer to future phase)
  - Do not add real business logic to any service

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Commerce-critical models — requires careful state machine design for Order statuses
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T13, T14, T15, T17)
  - **Parallel Group**: Wave 2
  - **Blocks**: T18
  - **Blocked By**: T1, T2

  **References**:
  - Architecture doc section 5.7-5.11: Cart, Checkout, Orders, Inventory, Shipping modules
  - Architecture doc section 8: Data Model — Cart/Checkout, Orders, Inventory tables
  - Order statuses (9): DRAFT, PENDING_PAYMENT, PAYMENT_PROCESSING, PAID, AWAITING_FULFILLMENT, FULFILLED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED, PAYMENT_FAILED
  - Fulfillment statuses (5): UNFULFILLED, PACKED, SHIPPED, DELIVERED, RETURNED
  - `OrderItem.productSnapshotName` — denormalized to prevent order corruption if product is edited later

  **Acceptance Criteria**:
  - [ ] `prisma/schema/commerce.prisma` exists with all 11 models
  - [ ] `Order` has all 10 status values in enum
  - [ ] `StockReservation` exists with PENDING/CONFIRMED/RELEASED/EXPIRED states
  - [ ] `OrderItem` has `productSnapshotName` (denormalized)
  - [ ] All monetary fields use `Decimal` type

  **QA Scenarios**:
  ```
  Scenario: Order status enum covers all 10 statuses
    Tool: Bash
    Steps:
      1. Run: grep -E "PENDING_PAYMENT|PAYMENT_PROCESSING|AWAITING_FULFILLMENT|PARTIALLY_REFUNDED" prisma/schema/commerce.prisma | wc -l
      2. Assert: count >= 4
    Expected Result: All critical order statuses present
    Evidence: .sisyphus/evidence/task-16-commerce-schema.txt
  ```

  **Commit**: YES (groups with T13-T15, T17-T18)

- [ ] 17. Prisma Schema — Platform Domain

  **What to do**:
  - Create `prisma/schema/platform.prisma` with Payments, Content, Notifications, and Platform tables:

  **Payments**:
  - `PaymentIntent`: id, orderId (FK), provider (string, e.g. "PEACH"), providerSessionId, providerTransactionId (nullable), amount (Decimal), currency, status (enum: PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELLED, REFUNDED), metadata (Json nullable), createdAt, updatedAt
  - `PaymentTransaction`: id, paymentIntentId (FK), type (enum: CAPTURE, REFUND, VOID), amount (Decimal), providerTransactionId (unique), status, metadata (Json), createdAt
  - `Refund`: id, orderId (FK), paymentIntentId (FK), providerRefundId (nullable), amount (Decimal), type (enum: FULL, PARTIAL), status (enum: PENDING, SUCCEEDED, FAILED), reason (nullable), requestedBy (string), idempotencyKey (unique), requestedAt, processedAt (nullable)
  - `WebhookEvent`: id, provider (string), providerEventId (unique), eventType, payload (Json), rawPayload (text), status (enum: PENDING, PROCESSING, PROCESSED, FAILED), errorMessage (nullable), processedAt (nullable), createdAt
  - `IdempotencyKey`: id, key (unique), requestHash, responseStatus, responseBody (text), createdAt, expiresAt

  **Content**:
  - `Page`: id, slug (unique), title, seoTitle (nullable), seoDescription (nullable), status (enum: DRAFT, PUBLISHED, ARCHIVED), heroSectionId (FK nullable), createdAt, updatedAt
  - `PageSection`: id, pageId (FK), type (enum matching architecture doc section types), order (int), data (Json), createdAt, updatedAt
  - `FaqItem`: id, question, answer, category (nullable), sortOrder, isActive, createdAt, updatedAt
  - `Testimonial`: id, authorName, authorTitle (nullable), content, rating (int 1-5 nullable), isActive, sortOrder, createdAt
  - `Gallery`: id, name, description (nullable), createdAt, updatedAt
  - `GalleryItem`: id, galleryId (FK), url, altText, caption (nullable), photographer (nullable), sortOrder, createdAt

  **Platform**:
  - `AuditLog`: id, userId (nullable), action (string), resource, resourceId, before (Json nullable), after (Json nullable), ipAddress (nullable), userAgent (nullable), createdAt — NOTE: NO updatedAt, append-only
  - `FeatureFlag`: id, name (unique), description, isEnabled (bool), rolloutPercentage (int 0-100), updatedAt
  - `JobRun`: id, queue, jobId, jobName, status (enum: QUEUED, RUNNING, COMPLETED, FAILED), startedAt, completedAt (nullable), error (nullable), metadata (Json nullable)

  **Must NOT do**:
  - Do not add `updatedAt` to `AuditLog` — it must be append-only
  - Do not store raw webhook payload in a field that could be indexed (use `text` type for rawPayload)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Many models across multiple concerns, payment models are security-sensitive
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T13, T14, T15, T16)
  - **Parallel Group**: Wave 2
  - **Blocks**: T18
  - **Blocked By**: T1, T2

  **References**:
  - Architecture doc section 8: Data Model — Payments, Content, Platform tables
  - Architecture doc section 5.14: Audit Module — append-only audit logs
  - `WebhookEvent.providerEventId` must be unique (idempotency check)
  - `IdempotencyKey` table: stores request hashes for checkout/payment endpoints
  - PageSection types from architecture doc section 10.3: hero_editorial, hero_split, rich_text, image_story, product_collection, gallery, faq, testimonials, cta_banner, etc.

  **Acceptance Criteria**:
  - [ ] `prisma/schema/platform.prisma` exists with all payment, content, and platform models
  - [ ] `AuditLog` has NO `updatedAt` field
  - [ ] `WebhookEvent.providerEventId` is `@unique`
  - [ ] `IdempotencyKey` model exists

  **QA Scenarios**:
  ```
  Scenario: AuditLog has no updatedAt field (append-only)
    Tool: Bash
    Steps:
      1. Run: grep -A 20 "model AuditLog" prisma/schema/platform.prisma | grep "updatedAt"
      2. Assert: no output (updatedAt must NOT be present)
    Expected Result: AuditLog model has no updatedAt field
    Evidence: .sisyphus/evidence/task-17-audit-log.txt
  ```

  **Commit**: YES (groups with T13-T16, T18)

- [ ] 18. Prisma Merge, Migrate & Generate Client

  **What to do**:
  - Verify all 5 schema files (identity, customer, catalog, commerce, platform) are in `prisma/schema/`
  - Verify `_base.prisma` exists with generator (output: `../generated/client`) and datasource blocks
  - Verify `prisma.config.ts` exists at monorepo root (NOT inside `prisma/`)
  - Run `npx prisma validate` from monorepo root — Prisma CLI discovers `prisma.config.ts` at root automatically. Fix any validation errors (missing relations, type mismatches, enum conflicts between files)
  - Run `npx prisma format` — formats all schema files consistently
  - Run `npx prisma migrate dev --name init` from monorepo root against a local PostgreSQL instance — this creates the initial migration file in `prisma/migrations/`
  - Run `npx prisma generate` from monorepo root — generates the typed Prisma client to `prisma/generated/client/`
  - Add `prisma/generated/` to `.gitignore` (generated files should not be committed)
  - Add `postinstall` script to root `package.json`: `"postinstall": "prisma generate"` so client is generated after `pnpm install`

  **Must NOT do**:
  - Do not run Prisma commands from inside `prisma/` or `apps/api/` — always from monorepo root
  - Do not seed the database — no seed data in Phase 1
  - Do not apply migrations to production — only dev migration in this task
  - Do not modify schema logic — only fix validation errors, never add new fields
  - Do not create a `prisma/schema.prisma` file — the multi-file schema uses `prisma/schema/` directory with `prisma.config.ts` at root

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Command execution task, no design decisions needed
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after T13-T17 all complete)
  - **Blocks**: T22, T26, T28
  - **Blocked By**: T13, T14, T15, T16, T17

  **References**:
  - `prisma.config.ts` at monorepo root: `defineConfig({ schema: 'prisma/schema', migrations: { path: 'prisma/migrations' } })`
  - Prisma CLI auto-discovers `prisma.config.ts` at the current working directory (monorepo root)
  - `_base.prisma` generator output: `output = "../generated/client"` (relative to `prisma/schema/`, resolves to `prisma/generated/client/`)
  - `npx prisma migrate dev --name init` creates `prisma/migrations/TIMESTAMP_init/migration.sql`

  **Acceptance Criteria**:
  - [ ] `prisma.config.ts` exists at monorepo root (NOT inside `prisma/`)
  - [ ] `npx prisma validate` (run from root) exits 0 with "Schema is valid"
  - [ ] `prisma/migrations/` directory contains at least one migration file
  - [ ] `npx prisma generate` (run from root) exits 0
  - [ ] `prisma/generated/client/` directory exists
  - [ ] `prisma/generated/` is in `.gitignore`

  **QA Scenarios**:
  ```
  Scenario: Prisma schema validates from monorepo root
    Tool: Bash
    Preconditions: All 5 schema files exist in prisma/schema/; prisma.config.ts at root
    Steps:
      1. Run: npx prisma validate (from /home/thapelo/Deveploment/Active/Web/lungilicious)
      2. Assert: exit code 0
      3. Assert: output contains "is valid" (Prisma validation success message)
    Expected Result: Validation passes
    Evidence: .sisyphus/evidence/task-18-prisma-validate.txt

  Scenario: Prisma migration runs and client generates
    Tool: Bash
    Preconditions: docker-compose.yml available (T32 complete); run docker compose up -d postgres
    Steps:
      1. Run: docker compose up -d postgres
      2. Wait: 3 seconds for Postgres to be ready
      3. Set env: export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lungilicious_dev
      4. Run: npx prisma migrate dev --name init
      5. Assert: exit code 0
      6. Run: ls prisma/migrations/
      7. Assert: at least one directory present
      8. Run: npx prisma generate
      9. Assert: exit code 0
      10. Run: ls prisma/generated/client/
      11. Assert: index.js or index.d.ts present
    Expected Result: Migration created, client generated
    Evidence: .sisyphus/evidence/task-18-prisma-migrate.txt
  ```

  **Commit**: YES
  - Message: `feat(prisma): add complete multi-domain schema and initial migration`
  - Files: `prisma/schema/**`, `prisma/migrations/**`, `prisma/prisma.config.ts`, `.gitignore` (update)

- [ ] 19. API — Config Module

  **What to do**:
  - Create `apps/api/src/common/config/config.module.ts`:
    - Uses `@nestjs/config` `ConfigModule.forRoot()` with `validate` option pointing to `@lungilicious/config` Zod schema
    - `isGlobal: true` so all modules can inject `ConfigService`
    - `envFilePath: ['.env.local', '.env']` for local dev
  - Create `apps/api/src/common/config/config.service.ts`:
    - Wraps `ConfigService` with typed getters for all env vars
    - Methods: `get port()`, `get databaseUrl()`, `get redisUrl()`, `get sessionSecret()`, `get corsOrigins()`, `get nodeEnv()`, `get isProd()`
    - Return types are strongly typed (not `string | undefined`)
  - Wire `ConfigModule` into `AppModule` (replacing any stub)
  - Create `.env.example` at monorepo root documenting all required env vars with descriptions and example values (never real values)
  - Required env vars to document: `DATABASE_URL`, `REDIS_URL`, `SESSION_SECRET` (min 32 chars hex), `NODE_ENV`, `PORT` (default 3001), `CORS_ORIGINS` (comma-separated), `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `PEACH_ENTITY_ID`, `PEACH_ACCESS_TOKEN`, `PEACH_WEBHOOK_SECRET`, `PEACH_MODE` (test/live)

  **Must NOT do**:
  - Do not commit a `.env` file — `.env.example` only
  - Do not use `process.env.X` directly — always use typed `AppConfigService`
  - Do not put secrets in code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard NestJS config pattern, well-defined
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T20, T21, T22, T23, T24)
  - **Parallel Group**: Wave 3
  - **Blocks**: T26, T27, T28
  - **Blocked By**: T9

  **References**:
  - `packages/config/src/env.schema.ts` — import Zod schema for validation
  - NestJS ConfigModule: `ConfigModule.forRoot({ validate: (config) => envSchema.parse(config), isGlobal: true })`
  - `.env.example` pattern: `DATABASE_URL=postgresql://user:password@localhost:5432/lungilicious_dev`

  **Acceptance Criteria**:
  - [ ] `AppConfigService` has typed getters for all env vars
  - [ ] `.env.example` at root documents all required vars
  - [ ] `ConfigModule` is `isGlobal: true` in AppModule
  - [ ] `pnpm --filter @lungilicious/api typecheck` still passes

  **QA Scenarios**:
  ```
  Scenario: API starts and config validates env
    Tool: Bash
    Preconditions: .env file with valid DATABASE_URL, REDIS_URL, SESSION_SECRET
    Steps:
      1. Run: pnpm --filter @lungilicious/api start:dev
      2. Assert: no "ValidationError" or "Missing env" error in startup output
      3. Assert: server listens on configured port
    Expected Result: Clean startup with config validated
    Evidence: .sisyphus/evidence/task-19-config-startup.txt
  ```

  **Commit**: YES (groups with T20-T24)

- [ ] 20. API — Pino Structured Logging

  **What to do**:
  - Configure Pino as the structured logger via Fastify's built-in Pino integration (`new FastifyAdapter({ logger: { level: 'info' } })`)
  - Create `apps/api/src/common/logger/logger.service.ts`:
    - Wraps Fastify/Pino logger
    - Provides NestJS `LoggerService` interface
    - Methods: `log(message, context?)`, `error(message, trace?, context?)`, `warn(message, context?)`, `debug(message, context?)`
    - Each log includes: `timestamp`, `level`, `context` (module name), `requestId` (from request context)
  - Create `apps/api/src/common/interceptors/request-id.interceptor.ts`:
    - Generates a UUID `requestId` for every incoming request
    - Adds `X-Request-ID` response header
    - Makes `requestId` available via `AsyncLocalStorage` for log correlation
  - Replace NestJS default `Logger` with `LoggerService` in `main.ts`: `app.useLogger(app.get(LoggerService))`
  - Log format for prod: JSON (Pino default). Log format for dev: pretty-print via `pino-pretty`
  - Configure log level from env: `LOG_LEVEL` (default `info` in prod, `debug` in dev)

  **Must NOT do**:
  - Do not use `console.log` anywhere — all logging through logger service
  - Do not log sensitive data (passwords, tokens, session data)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard logging setup, clear pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T19, T21, T22, T23, T24)
  - **Parallel Group**: Wave 3
  - **Blocks**: F2
  - **Blocked By**: T9

  **References**:
  - Fastify built-in Pino: `new FastifyAdapter({ logger: { level: process.env.LOG_LEVEL || 'info' } })`
  - NestJS LoggerService interface: `log`, `error`, `warn`, `debug`, `verbose`
  - Request ID via `AsyncLocalStorage`: create a `RequestContext` class with `AsyncLocalStorage<{requestId: string}>`

  **Acceptance Criteria**:
  - [ ] `LoggerService` implements NestJS `LoggerService` interface
  - [ ] Request ID interceptor adds `X-Request-ID` header
  - [ ] `console.log` is absent from all source files

  **QA Scenarios**:
  ```
  Scenario: API logs structured JSON in production mode (log pattern check)
    Tool: Bash
    Steps:
      1. Run: grep -rE "console\.log" apps/api/src/ --include="*.ts"
      2. Assert: zero matches (no console.log in source files)
      3. Run: grep -E "LoggerService|PinoLogger|useLogger" apps/api/src/main.ts
      4. Assert: at least one match (logger is wired in main.ts)
      5. Run: test -f apps/api/src/common/logger/logger.service.ts && echo "exists"
      6. Assert: output is "exists"
      7. Run: grep -E "X-Request-ID|requestId" apps/api/src/common/interceptors/request-id.interceptor.ts
      8. Assert: at least one match
    Expected Result: Logger service exists, no console.log, request ID interceptor wires X-Request-ID header
    Evidence: .sisyphus/evidence/task-20-logging-setup.txt
  ```

  **Commit**: YES (groups with T19, T21-T24)

- [ ] 21. API — Common Infrastructure (Filters, Interceptors, Pipes, Middleware)

  **What to do**:
  - Create `apps/api/src/common/filters/http-exception.filter.ts`:
    - Global exception filter extending `BaseExceptionFilter`
    - Catches all exceptions, returns consistent JSON: `{ statusCode, message, error, requestId, timestamp }`
    - Logs error with request context (path, method, requestId)
    - Never exposes stack traces in production (`NODE_ENV !== 'development'`)
  - Create `apps/api/src/common/interceptors/response.interceptor.ts`:
    - Wraps all successful responses in: `{ success: true, data: T, timestamp }`
    - Excludes health check endpoint from wrapping
  - Create `apps/api/src/common/pipes/zod-validation.pipe.ts`:
    - Global validation pipe using Zod (alternative to class-validator)
    - Or use NestJS built-in `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` — pick one approach and document it
  - Create `apps/api/src/common/middleware/raw-body.middleware.ts`:
    - Captures raw request body (needed for webhook signature verification)
    - Attaches `rawBody` to Fastify request object
    - Only active on `/payments/webhooks/*` paths
  - Wire all globals in `main.ts` or `app.module.ts`:
    - `app.useGlobalFilters(new HttpExceptionFilter())`
    - `app.useGlobalInterceptors(new ResponseInterceptor())`
    - `app.useGlobalPipes(new ValidationPipe(...))`

  **Must NOT do**:
  - Do not expose internal error messages or stack traces in production responses
  - Do not skip request ID correlation in error responses

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard NestJS infrastructure patterns, well-defined
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T19, T20, T22, T23, T24)
  - **Parallel Group**: Wave 3
  - **Blocks**: T26, T27
  - **Blocked By**: T9

  **References**:
  - NestJS GlobalFilter: `app.useGlobalFilters(new HttpExceptionFilter(new HttpAdapterHost()))`
  - Fastify raw body: Fastify plugin `fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, ...)`
  - Response shape: `{ success: boolean, data: T, timestamp: string, requestId: string }`

  **Acceptance Criteria**:
  - [ ] `HttpExceptionFilter` returns consistent error shape with `requestId`
  - [ ] Stack traces are suppressed in non-development environments
  - [ ] Raw body middleware exists for webhook path

  **QA Scenarios**:
  ```
  Scenario: 404 error returns consistent JSON error shape
    Tool: Bash
    Steps:
      1. Run: curl -s http://localhost:3001/nonexistent-route
      2. Assert: response JSON has fields: statusCode, message, requestId, timestamp
      3. Assert: statusCode equals 404
    Expected Result: Consistent error shape returned
    Evidence: .sisyphus/evidence/task-21-error-shape.txt
  ```

  **Commit**: YES (groups with T19, T20, T22-T24)

- [ ] 22. API — Database Module (PrismaService)

  **What to do**:
  - Create `apps/api/src/common/database/prisma.service.ts`:
    - Extends `PrismaClient`
    - Implements `OnModuleInit`: calls `this.$connect()` on module init
    - Implements `OnModuleDestroy` or uses NestJS shutdown hooks: calls `this.$disconnect()` on app shutdown
    - Enables shutdown hooks in `main.ts`: `app.enableShutdownHooks()`
    - Adds Pino query logging in development: `this.$on('query', (e) => logger.debug(e.query))`
  - Create `apps/api/src/common/database/database.module.ts`:
    - `@Global()` module exporting `PrismaService`
    - So any module can inject `PrismaService` without importing `DatabaseModule`
  - Create `apps/api/src/common/database/database.health.ts`:
    - NestJS Terminus health indicator for database
    - `checkDatabase()`: executes `prisma.$queryRaw\`SELECT 1\`` and returns health status
  - Import `DatabaseModule` in `AppModule`

  **Must NOT do**:
  - Do not use raw `pg` or `knex` — Prisma only
  - Do not forget `$disconnect()` on shutdown (connection leak risk)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard NestJS Prisma service pattern, well-documented
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T19, T20, T21, T23, T24)
  - **Parallel Group**: Wave 3
  - **Blocks**: T26, T27, T28, T29
  - **Blocked By**: T9, T18

  **References**:
  - NestJS Prisma recipe: `PrismaService extends PrismaClient implements OnModuleInit`
  - `app.enableShutdownHooks()` in `main.ts` before `app.listen()`
  - `DatabaseModule` as `@Global()` with `exports: [PrismaService]`

  **Acceptance Criteria**:
  - [ ] `PrismaService` connects on init and disconnects on destroy
  - [ ] `DatabaseModule` is `@Global()` and exports `PrismaService`
  - [ ] `DatabaseHealthIndicator` exists

  **QA Scenarios**:
  ```
  Scenario: PrismaService class exists and connects on module init
    Tool: Bash
    Steps:
      1. Run: grep -E "OnModuleInit|OnModuleDestroy|enableShutdownHooks|\$connect|\$disconnect" apps/api/src/common/database/prisma.service.ts
      2. Assert: at least 3 matches (connect, disconnect, and lifecycle hooks)
      3. Run: grep "@Global" apps/api/src/common/database/database.module.ts
      4. Assert: match found (DatabaseModule is global)
    Expected Result: PrismaService implements lifecycle hooks, DatabaseModule is @Global
    Evidence: .sisyphus/evidence/task-22-prisma-service.txt

  Scenario: DatabaseModule exports PrismaService
    Tool: Bash
    Steps:
      1. Run: grep -E "exports.*PrismaService|PrismaService.*exports" apps/api/src/common/database/database.module.ts
      2. Assert: match found
      3. Run: pnpm --filter @lungilicious/api typecheck
      4. Assert: exit code 0 (no TS errors from database module)
    Expected Result: PrismaService exported and TypeScript passes
    Evidence: .sisyphus/evidence/task-22-database-module.txt
  ```

  **Commit**: YES (groups with T19-T21, T23-T24)

- [ ] 23. API — Redis Module

  **What to do**:
  - Install `ioredis` in `apps/api`
  - Create `apps/api/src/common/redis/redis.module.ts`:
    - Provides `REDIS_CLIENT` injection token with `ioredis` client configured from `AppConfigService.redisUrl`
    - `@Global()` module exporting `REDIS_CLIENT`
    - On connection error: log error but do NOT crash app (Redis is cache/queue, not critical-path for reads)
    - On connect: log `"Redis connected"`
  - Create `apps/api/src/common/redis/redis.health.ts`:
    - NestJS Terminus health indicator for Redis
    - `checkRedis()`: executes `client.ping()` and returns health status
  - Import `RedisModule` in `AppModule`

  **Must NOT do**:
  - Do not use `redis` package — use `ioredis` only
  - Do not crash app if Redis is temporarily unavailable — log and retry

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Redis client setup, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T19, T20, T21, T22)
  - **Parallel Group**: Wave 3
  - **Blocks**: T24, T25
  - **Blocked By**: T9

  **References**:
  - ioredis connection: `new Redis(process.env.REDIS_URL)`
  - NestJS custom provider: `{ provide: 'REDIS_CLIENT', useFactory: (config: AppConfigService) => new Redis(config.redisUrl), inject: [AppConfigService] }`
  - ioredis error handling: `client.on('error', (err) => logger.error('Redis error', err))`

  **Acceptance Criteria**:
  - [ ] `REDIS_CLIENT` injection token exported from `RedisModule`
  - [ ] `RedisHealthIndicator` exists
  - [ ] Redis connection errors are logged, not thrown
  - [ ] `pnpm --filter @lungilicious/api typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: RedisModule provider and health indicator exist
    Tool: Bash
    Steps:
      1. Run: test -f apps/api/src/common/redis/redis.module.ts && echo "exists"
      2. Assert: output is "exists"
      3. Run: grep -E "REDIS_CLIENT|ioredis|new Redis" apps/api/src/common/redis/redis.module.ts
      4. Assert: at least one match
      5. Run: test -f apps/api/src/common/redis/redis.health.ts && echo "exists"
      6. Assert: output is "exists"
    Expected Result: Redis module and health indicator files exist with correct patterns
    Evidence: .sisyphus/evidence/task-23-redis-module.txt

  Scenario: Redis connection error handling present
    Tool: Bash
    Steps:
      1. Run: grep -E "on\('error'|.on\(\"error\"" apps/api/src/common/redis/redis.module.ts
      2. Assert: match found (error handler registered)
      3. Run: pnpm --filter @lungilicious/api typecheck
      4. Assert: exit code 0
    Expected Result: Error handler present and TypeScript passes
    Evidence: .sisyphus/evidence/task-23-redis-error-handling.txt
  ```

  **Commit**: YES (groups with T19-T22, T24)

- [ ] 24. API — BullMQ Connection Wiring

  **What to do**:
  - Install `@nestjs/bullmq` and `bullmq` in `apps/api`
  - Create `apps/api/src/common/queue/queue.module.ts`:
    - `BullModule.forRootAsync({ useFactory: (config: AppConfigService) => ({ connection: new Redis(config.redisUrl) }), inject: [AppConfigService] })`
    - Import `RedisModule` to reuse the Redis client
  - Define queue names as constants in `apps/api/src/common/queue/queue.constants.ts` (same constants as Worker — share via `@lungilicious/types` package if preferred, or duplicate for now)
    - `QUEUE_EMAIL`, `QUEUE_NOTIFICATIONS`, `QUEUE_WEBHOOKS`, `QUEUE_INVENTORY`, `QUEUE_EXPORTS`
  - Register all 5 queues with `BullModule.registerQueue()` in `QueueModule`
  - Export all queue instances from `QueueModule`
  - Create stub `QueueService` in `apps/api/src/common/queue/queue.service.ts`:
    - Injects each queue via `@InjectQueue(QUEUE_EMAIL)` etc.
    - Methods: `addEmailJob()`, `addWebhookJob()`, `addInventoryJob()` — all stub `throw new Error('Not implemented')` for now
  - Import `QueueModule` in `AppModule`

  **Must NOT do**:
  - Do not implement actual job adding logic — stubs only
  - Do not duplicate Redis connection setup — reuse from `RedisModule`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: BullMQ setup follows documented patterns, no logic yet
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T19, T20, T21, T22)
  - **Parallel Group**: Wave 3
  - **Blocks**: T25
  - **Blocked By**: T9, T23

  **References**:
  - `@nestjs/bullmq` setup: `BullModule.forRootAsync({ connection: redisConnection })`
  - Queue registration: `BullModule.registerQueue({ name: QUEUE_EMAIL })`
  - `@InjectQueue(QUEUE_EMAIL) private emailQueue: Queue`

  **Acceptance Criteria**:
  - [ ] All 5 queue names defined as constants
  - [ ] `BullModule.forRootAsync()` uses Redis connection from `AppConfigService`
  - [ ] `QueueModule` is importable by other modules
  - [ ] TypeScript compiles without errors

  **QA Scenarios**:
  ```
  Scenario: BullMQ module initializes without errors
    Tool: Bash
    Preconditions: Redis running
    Steps:
      1. Start API: pnpm --filter @lungilicious/api start:dev
      2. Assert: no "Redis connection failed" or "BullMQ error" in logs
      3. Assert: "Queue initialized" or similar log message (or no queue error)
    Expected Result: Queue module starts cleanly
    Evidence: .sisyphus/evidence/task-24-bullmq-init.txt
  ```

  **Commit**: YES (groups with T19-T23)
  - Message: `feat(api): add Pino logging, Prisma, Redis, BullMQ, config, and common infrastructure`

- [ ] 25. Worker — BullMQ Full Setup

  **What to do**:
  - Wire all 5 processor stubs created in T10 with `@nestjs/bullmq` decorators properly
  - Update each processor file with correct pattern:
    ```typescript
    @Processor(QUEUE_EMAIL)
    export class EmailProcessor extends WorkerHost {
      private readonly logger = new Logger(EmailProcessor.name)

      @OnWorkerEvent('completed')
      onCompleted(job: Job) { this.logger.log(`Job ${job.id} completed`) }

      @OnWorkerEvent('failed')
      onFailed(job: Job, error: Error) { this.logger.error(`Job ${job.id} failed: ${error.message}`) }

      async process(job: Job): Promise<void> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`)
        throw new NotImplementedException(`${job.name} processor not yet implemented`)
      }
    }
    ```
  - Add `BullModule.forRootAsync()` connection in `WorkerModule` (same Redis connection pattern as T24)
  - Register all 5 queues in `WorkerModule`
  - Add concurrency config: `@Processor(QUEUE_EMAIL, { concurrency: 5 })` on email, `concurrency: 2` on webhooks
  - Add dead letter queue config for webhook processor: `removeOnFail: { count: 100 }`, `attempts: 3`, `backoff: { type: 'exponential', delay: 2000 }`
  - Ensure worker app gracefully shuts down on SIGTERM: `process.on('SIGTERM', () => app.close())`

  **Must NOT do**:
  - Do not implement actual job logic — `NotImplementedException` stubs only
  - Do not add HTTP endpoints to the worker app

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires careful concurrency, retry, and dead letter queue configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after T10, T23, T24 complete)
  - **Blocks**: F2
  - **Blocked By**: T10, T23, T24

  **References**:
  - `@nestjs/bullmq` processor pattern: `@Processor(name) class X extends WorkerHost { async process(job: Job) {} }`
  - `@OnWorkerEvent('completed' | 'failed' | 'progress')` decorator
  - BullMQ retry: `{ attempts: 3, backoff: { type: 'exponential', delay: 2000 } }`
  - Worker graceful shutdown: `process.on('SIGTERM', () => nestApp.close())`

  **Acceptance Criteria**:
  - [ ] All 5 processors have `@OnWorkerEvent('completed')` and `@OnWorkerEvent('failed')` handlers
  - [ ] Webhook processor has retry and dead letter config
  - [ ] Worker starts without errors against Redis
  - [ ] `pnpm --filter @lungilicious/worker typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Worker starts and connects to Redis/queues
    Tool: Bash
    Preconditions: Redis running (docker compose up -d)
    Steps:
      1. Run: pnpm --filter @lungilicious/worker start:dev
      2. Assert: startup logs show queue connections (no errors)
      3. Assert: process stays alive for 5+ seconds (not a crash loop)
    Expected Result: Worker starts cleanly and stays running
    Evidence: .sisyphus/evidence/task-25-worker-start.txt
  ```

  **Commit**: YES
  - Message: `feat(worker): wire BullMQ processor stubs with retry and concurrency config`

- [ ] 26. API — Session Auth Module Skeleton

  **What to do**:
  - Create `apps/api/src/modules/auth/auth.module.ts`:
    - Imports: `DatabaseModule`, `ConfigModule`, `BullMQ` queue for notifications
    - Providers: `AuthService`
    - Controllers: `AuthController`
  - Create `apps/api/src/modules/auth/auth.service.ts` with ALL method stubs from architecture doc auth endpoints:
    - `register(dto: RegisterDto): Promise<void>` — stub: validates, hashes password with Argon2id, creates User + Session → `throw new NotImplementedException()`
    - `login(dto: LoginDto, session): Promise<void>` — stub: validates credentials, sets session → `throw new NotImplementedException()`
    - `logout(session): Promise<void>` — stub: revokes session → `throw new NotImplementedException()`
    - `forgotPassword(dto: ForgotPasswordDto): Promise<void>` — stub
    - `resetPassword(dto: ResetPasswordDto): Promise<void>` — stub
    - `verifyEmail(dto: VerifyEmailDto): Promise<void>` — stub
    - `verifyMfa(dto: MfaVerifyDto): Promise<void>` — stub
  - Create `apps/api/src/modules/auth/auth.controller.ts`:
    - Routes matching architecture doc Auth API (POST /auth/register, POST /auth/login, etc.)
    - Each route calls the corresponding stub service method
    - `@Public()` decorator on register, login, forgot-password, reset-password, verify-email
  - Create `apps/api/src/modules/auth/dto/` with Zod-validated DTOs: `RegisterDto`, `LoginDto`, `ForgotPasswordDto`, `ResetPasswordDto`, `MfaVerifyDto`
  - Create `apps/api/src/modules/auth/me.controller.ts` — a minimal `MeController` with a single route `GET /me` that:
    - Uses `@UseGuards(SessionGuard)` (or relies on global guard)
    - Returns `@CurrentUser()` (the user object from request)
    - Responds with HTTP 501 (`throw new NotImplementedException('Profile not yet implemented')`)
    - This route exists solely to provide a testable protected endpoint in Phase 1
  - Create `apps/api/src/common/guards/session.guard.ts`:
    - `CanActivate` implementation
    - Reads `request.session.get('userId')` from `@fastify/secure-session`
    - If no userId: throw `UnauthorizedException`
    - If userId found: loads user from DB, attaches to `request.user`
    - Respects `@Public()` decorator (skips check for public routes)
  - Register `SessionGuard` as global `APP_GUARD` in `AppModule`
  - Wire `@fastify/secure-session` in `main.ts` (if not done in T9)

  **Must NOT do**:
  - Do not implement real auth logic (hashing, DB writes) — stubs only with `NotImplementedException`
  - Do not use JWT anywhere — sessions only
  - Do not add Passport.js — custom session guard is sufficient

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Security-critical module requiring correct interface design even as stubs; session guard must work globally
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T27, T28)
  - **Parallel Group**: Wave 3
  - **Blocks**: T27, T29, T30
  - **Blocked By**: T9, T18, T19, T21, T22

  **References**:
  - `@fastify/secure-session`: `request.session.get('userId')`, `request.session.set('userId', id)`, `request.session.delete()`
  - Argon2id (import for later use): `import { hash, verify } from 'argon2'` — add as dependency even if not called yet
  - Auth API endpoints from architecture doc section 9: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-email`, `POST /auth/mfa/verify`
  - `@Public()` decorator from T27 (coordinate with T27 agent if running in parallel)
  - Global guard registration: `{ provide: APP_GUARD, useClass: SessionGuard }` in `AppModule.providers`

  **Acceptance Criteria**:
  - [ ] `SessionGuard` is globally registered as `APP_GUARD`
  - [ ] `@Public()` decorator bypasses session guard
  - [ ] All 7 auth service methods exist as stubs
  - [ ] All 7 auth controller routes exist
  - [ ] `GET /me` route exists in `MeController` (returns 501 when session exists, 401 when no session)
  - [ ] `pnpm --filter @lungilicious/api typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Session guard blocks unauthenticated request to GET /me
    Tool: Bash
    Preconditions: API running with Postgres + Redis (docker compose up -d && pnpm --filter @lungilicious/api start:dev)
    Steps:
      1. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/me
      2. Assert: response code is 401
    Expected Result: 401 Unauthorized returned (guard working globally on /me)
    Evidence: .sisyphus/evidence/task-26-session-guard-401.txt

  Scenario: Public route (POST /auth/login) bypasses session guard
    Tool: Bash
    Preconditions: API running
    Steps:
      1. Run: curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test"}'
      2. Assert: response code is 501 (NotImplemented from stub — NOT 401 Unauthorized)
    Expected Result: 501 returned, proving public route is not blocked by session guard
    Evidence: .sisyphus/evidence/task-26-public-route.txt
  ```

  **Commit**: YES (groups with T27, T28)

- [ ] 27. API — RBAC Infrastructure

  **What to do**:
  - Create `apps/api/src/common/decorators/roles.decorator.ts`:
    - `export const Roles = (...roles: Role[]) => SetMetadata('roles', roles)`
    - Import `Role` enum from `@lungilicious/types`
  - Create `apps/api/src/common/decorators/permissions.decorator.ts`:
    - `export const RequirePermissions = (...perms: string[]) => SetMetadata('permissions', perms)`
    - Permission format: `'resource:action'` (e.g. `'products:create'`, `'orders:read'`, `'refunds:issue'`)
  - Create `apps/api/src/common/decorators/public.decorator.ts`:
    - `export const IS_PUBLIC_KEY = 'isPublic'`
    - `export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)`
  - Create `apps/api/src/common/decorators/current-user.decorator.ts`:
    - `export const CurrentUser = createParamDecorator((_, ctx) => ctx.switchToHttp().getRequest().user)`
  - Create `apps/api/src/common/guards/roles.guard.ts`:
    - Implements `CanActivate`
    - Uses `Reflector` to read `@Roles()` and `@RequirePermissions()` metadata
    - If route has no role/permission metadata: ALLOW (default open after session auth)
    - If `ADMIN` role present on route and user does NOT have ADMIN: throw `ForbiddenException`
    - If permission required and user lacks it: throw `ForbiddenException`
    - Super-admin ADMIN bypass: if user has ADMIN role, all permission checks pass
    - Respects `@Public()` decorator
  - Register `RolesGuard` as second global `APP_GUARD` (after `SessionGuard`) in `AppModule`
  - Add `roles` field to `request.user` type (augment FastifyRequest interface)

  **Must NOT do**:
  - Do not implement complex permission logic yet — basic role check is sufficient for Phase 1
  - Do not add permissions to DB yet — use in-memory role checks for now
  - Do not skip ADMIN bypass — it is required for Phase 1 admin testing

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Security-critical guards that must be correct from day one; global guard ordering matters
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T26, T28)
  - **Parallel Group**: Wave 3
  - **Blocks**: T29, T30
  - **Blocked By**: T9, T19, T21, T26

  **References**:
  - Architecture doc section 5: RBAC roles: CUSTOMER, ADMIN, EDITOR, OPS, SUPPORT
  - `docs/architecture/rbac-matrix.md` (T5 output) — reference the permission matrix
  - NestJS reflector pattern: `this.reflector.getAllAndOverride<Role[]>('roles', [context.getHandler(), context.getClass()])`
  - Global guard order: `SessionGuard` first (auth), `RolesGuard` second (authz)
  - `Role` enum: import from `@lungilicious/types`

  **Acceptance Criteria**:
  - [ ] `@Roles()`, `@RequirePermissions()`, `@Public()`, `@CurrentUser()` decorators all exist
  - [ ] `RolesGuard` is globally registered as second `APP_GUARD`
  - [ ] ADMIN role has full access bypass
  - [ ] Non-admin accessing admin route gets 403 (not 401)
  - [ ] TypeScript compiles without errors

  **QA Scenarios**:
  ```
  Scenario: RBAC decorator files exist and RolesGuard is globally registered
    Tool: Bash
    Steps:
      1. Run: test -f apps/api/src/common/decorators/roles.decorator.ts && echo "roles exists"
      2. Assert: output is "roles exists"
      3. Run: test -f apps/api/src/common/guards/roles.guard.ts && echo "guard exists"
      4. Assert: output is "guard exists"
      5. Run: grep -E "APP_GUARD.*RolesGuard|RolesGuard.*APP_GUARD" apps/api/src/app.module.ts
      6. Assert: match found (RolesGuard registered as APP_GUARD)
    Expected Result: All decorator files exist and RolesGuard globally registered
    Evidence: .sisyphus/evidence/task-27-rbac-files.txt

  Scenario: Route with @Roles(ADMIN) returns 403 for request without correct role session
    Tool: Bash
    Preconditions: API running (docker compose up -d && pnpm --filter @lungilicious/api start:dev). This scenario uses the /me route which exists (created in T26) and relies on RolesGuard + SessionGuard both running globally.
    Steps:
      1. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/me
      2. Assert: HTTP 401 (session guard blocks unauthenticated — no cookie provided)
      3. NOTE: A full 403 test requires a valid session with wrong role, which needs auth to be implemented (Phase 2). The structural test above confirms guard files + registration are correct for Phase 1.
    Expected Result: 401 from unauthenticated /me confirms SessionGuard is active before RolesGuard; RolesGuard files confirm guard ordering is correct
    Failure Indicators: 200 or 404 response (guard not registered), or missing guard file
    Evidence: .sisyphus/evidence/task-27-rbac-guard.txt
  ```

  **Commit**: YES (groups with T26, T28)

- [ ] 28. API — Audit Module Skeleton

  **What to do**:
  - Create `apps/api/src/modules/audit/audit.module.ts`:
    - Imports `DatabaseModule` (for `PrismaService`)
    - Providers: `AuditService`
    - `@Global()` so any module can inject `AuditService` without importing `AuditModule`
    - Exports: `AuditService`
  - Create `apps/api/src/modules/audit/audit.service.ts`:
    - `log(entry: CreateAuditLogDto): Promise<void>` — the ONLY write method
    - Calls `this.prisma.auditLog.create()` with the provided entry
    - `AuditLog` is append-only: no update or delete methods
    - Never throws — catches errors and logs them, so audit logging never breaks the request flow
    - Signature: `log({ userId, action, resource, resourceId, before?, after?, ipAddress?, userAgent? })`
  - Create `apps/api/src/modules/audit/dto/create-audit-log.dto.ts` with all fields
  - Create `apps/api/src/common/decorators/audit-event.decorator.ts`:
    - Method decorator: `@AuditEvent({ action: 'user.login', resource: 'auth' })`
    - Stores metadata but does NOT auto-log yet (actual interceptor wiring deferred to Phase 2)
    - Just the decorator definition and type interface
  - **Write a Vitest integration test** `apps/api/src/modules/audit/audit.service.spec.ts` to verify the service:
    - Uses `@nestjs/testing` `Test.createTestingModule()`
    - Mocks `PrismaService` with `{ auditLog: { create: vi.fn().mockResolvedValue({}) } }`
    - Tests that `auditService.log({ action: 'test', resource: 'test', resourceId: '1' })` calls `prisma.auditLog.create()` once
    - This is the ONE exception to the "tests-after" rule — a direct unit test for the audit service is required to verify the service without needing a running database
  - Import `AuditModule` in `AppModule`

  **Must NOT do**:
  - Do not add query/read methods to `AuditService` — write only (reads go through Admin module)
  - Do not make audit logging synchronous on critical paths — fire and forget pattern acceptable for now
  - Do not add `updatedAt` to audit log creation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Security-sensitive module; append-only constraint must be enforced architecturally
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T26, T27) for implementation; QA requires T31 (Vitest) to run unit test
  - **Parallel Group**: Wave 3 (implementation parallel with T26, T27; QA step runs after T31 completes)
  - **Blocks**: F1, F2
  - **Blocked By**: T9, T18, T22, T27 (implementation); T31 (QA step only)

  **References**:
  - Architecture doc section 5.14: Audit Module — non-negotiable for security-first platform
  - `AuditLog` Prisma model (T17): id, userId, action, resource, resourceId, before, after, ipAddress, userAgent, createdAt — NO updatedAt
  - `@Global()` module pattern: ensures `AuditService` injectable everywhere without explicit imports
  - Fire-and-forget: `this.auditService.log(entry).catch(err => this.logger.error('Audit log failed', err))`

  **Acceptance Criteria**:
  - [ ] `AuditModule` is `@Global()` and exports `AuditService`
  - [ ] `AuditService.log()` writes to `audit_logs` table via Prisma
  - [ ] No read/query methods on `AuditService`
  - [ ] `@AuditEvent()` decorator exists
  - [ ] TypeScript compiles without errors

  **QA Scenarios**:
  ```
  Scenario: AuditService unit test verifies log() calls prisma.auditLog.create()
    Tool: Bash
    Preconditions: Vitest configured (T31 must complete first, or run after T31)
    Steps:
      1. Run: pnpm --filter @lungilicious/api test --reporter=verbose apps/api/src/modules/audit/audit.service.spec.ts
      2. Assert: exit code 0
      3. Assert: output contains "✓" or "PASS" for the audit service test
      4. Assert: output contains "prisma.auditLog.create was called"
    Expected Result: Unit test passes confirming AuditService.log() calls prisma.auditLog.create()
    Evidence: .sisyphus/evidence/task-28-audit-unit-test.txt

  Scenario: AuditService has NO read methods (append-only enforcement)
    Tool: Bash
    Steps:
      1. Run: grep -E "findMany|findFirst|findUnique|findById|update\(|delete\(" apps/api/src/modules/audit/audit.service.ts
      2. Assert: zero matches
    Expected Result: AuditService contains only the log() write method
    Evidence: .sisyphus/evidence/task-28-audit-write-only.txt
  ```

  **Commit**: YES (groups with T26, T27)
  - Message: `feat(api): add session auth skeleton, RBAC guards, and audit module`

- [ ] 29. API — Health Check Endpoints

  **What to do**:
  - Install `@nestjs/terminus` in `apps/api`
  - Create `apps/api/src/modules/health/health.module.ts`
  - Create `apps/api/src/modules/health/health.controller.ts` with routes:
    - `GET /health` — overall health (checks DB + Redis in parallel)
    - `GET /health/db` — database health only
    - `GET /health/redis` — Redis health only
  - Use `TerminusModule.forRootAsync()` and inject `DatabaseHealthIndicator` (T22) + `RedisHealthIndicator` (T23)
  - Response format for healthy:
    ```json
    { "status": "ok", "info": { "db": { "status": "up" }, "redis": { "status": "up" } }, "error": {}, "details": { "db": { "status": "up" }, "redis": { "status": "up" } } }
    ```
    (This is the standard NestJS Terminus format. Do NOT customize the shape — use Terminus defaults.)
  - Response format for unhealthy: HTTP 503, `"status": "error"` with failed component showing `"status": "down"`
  - Mark all health endpoints with `@Public()` — no auth required
  - Import `HealthModule` in `AppModule`

  **Must NOT do**:
  - Do not require authentication on health endpoints
  - Do not expose internal connection strings or sensitive data in health response

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard NestJS Terminus pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T30, T31)
  - **Parallel Group**: Wave 4
  - **Blocks**: F2
  - **Blocked By**: T26, T27

  **References**:
  - `@nestjs/terminus` health: `HealthCheckService`, `HealthCheck`, `HealthCheckResult`
  - Custom health indicator: extends `HealthIndicator`, implements `isHealthy(key: string)`
  - HTTP 503 on degraded state: Terminus handles this automatically

  **Acceptance Criteria**:
  - [ ] `GET /health` returns `{ "status": "ok" }` when both DB and Redis are up
  - [ ] `GET /health` returns HTTP 503 when DB or Redis is down
  - [ ] Health endpoints require no authentication

  **QA Scenarios**:
  ```
  Scenario: Health endpoint returns ok with all services running
    Tool: Bash
    Preconditions: Postgres + Redis running
    Steps:
      1. Start API
      2. Run: curl -s http://localhost:3001/health
      3. Assert: HTTP 200
      4. Assert: response JSON contains "status": "ok"
      5. Assert: response JSON contains "db" and "redis" fields
    Expected Result: {"status":"ok","info":{"db":{"status":"up"},"redis":{"status":"up"}}}
    Evidence: .sisyphus/evidence/task-29-health-ok.txt

  Scenario: Health endpoint returns 503 with Redis down
    Tool: Bash
    Steps:
      1. Stop Redis: docker compose stop redis
      2. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health
      3. Assert: HTTP 503
      4. Start Redis again: docker compose start redis
    Expected Result: 503 returned when Redis is unavailable
    Evidence: .sisyphus/evidence/task-29-health-degraded.txt
  ```

  **Commit**: YES (groups with T30, T31)

- [ ] 30. API — OpenAPI / Swagger Setup

  **What to do**:
  - Install `@nestjs/swagger` in `apps/api`
  - Configure SwaggerModule in `main.ts`:
    ```typescript
    const config = new DocumentBuilder()
      .setTitle('Lungilicious API')
      .setVersion('1.0')
      .addCookieAuth('session-id')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
    ```
  - Only enable Swagger in non-production environments (`if (process.env.NODE_ENV !== 'production')`)
  - Add `@ApiTags()` and `@ApiOperation()` to all existing controllers (AuthController, HealthController)
  - Add `@ApiCookieAuth('session-id')` to all protected controllers/routes
  - Add `@ApiResponse()` decorators for common responses (200, 201, 400, 401, 403, 500)
  - Add `@ApiProperty()` to all DTOs created in T26
  - Verify Swagger UI is accessible at `http://localhost:3001/api/docs` in dev

  **Must NOT do**:
  - Do not expose Swagger UI in production
  - Do not add Swagger to Worker app

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard NestJS Swagger setup with clear pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T31)
  - **Parallel Group**: Wave 4
  - **Blocks**: F1
  - **Blocked By**: T26, T27

  **References**:
  - `@nestjs/swagger` setup: `DocumentBuilder`, `SwaggerModule.createDocument()`, `SwaggerModule.setup()`
  - Cookie auth: `.addCookieAuth('session-id')` + `@ApiCookieAuth('session-id')` on controllers
  - Environment gate: only serve Swagger when `NODE_ENV !== 'production'`

  **Acceptance Criteria**:
  - [ ] Swagger UI accessible at `/api/docs` in dev mode
  - [ ] All auth endpoints appear in Swagger
  - [ ] Cookie auth scheme configured
  - [ ] Swagger disabled in production (confirmed by checking env gate)

  **QA Scenarios**:
  ```
  Scenario: Swagger UI loads in development mode
    Tool: Bash
    Steps:
      1. Start API in dev: NODE_ENV=development pnpm --filter @lungilicious/api start:dev
      2. Run: curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/docs
      3. Assert: HTTP 200 (Swagger UI HTML returned)
    Expected Result: Swagger UI accessible at /api/docs
    Evidence: .sisyphus/evidence/task-30-swagger-ui.txt
  ```

  **Commit**: YES (groups with T29, T31)

- [ ] 31. Vitest Configuration

  **What to do**:
  - Install `vitest`, `@vitest/coverage-v8` in `apps/api` and `apps/worker`
  - Create `apps/api/vitest.config.ts`:
    - Test environment: `node`
    - Globals: true
    - Coverage provider: `v8`
    - Include: `src/**/*.spec.ts`
    - Exclude: `node_modules`, `dist`, `prisma/generated`
  - Create `apps/worker/vitest.config.ts`: same pattern
  - Add test scripts to `apps/api/package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`
  - Same scripts for `apps/worker`
  - Add `test` to `turbo.json` pipeline (depends on `^build`, `outputs: []`)
  - Create one placeholder test file `apps/api/src/health/health.controller.spec.ts`:
    - Just a `describe` block with `it.todo('health check returns 200')` — no actual assertions yet
    - This verifies the test runner is configured but doesn't fail

  **Must NOT do**:
  - Do not write real test implementations yet — Phase 1 is tests-after setup only
  - Do not use Jest — Vitest only

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file setup, minimal complexity
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T30)
  - **Parallel Group**: Wave 4
  - **Blocks**: T34
  - **Blocked By**: T9, T10

  **References**:
  - Vitest config: `defineConfig({ test: { globals: true, environment: 'node', coverage: { provider: 'v8' } } })`
  - `it.todo()` creates pending tests that pass without implementation
  - turbo.json: `"test": { "dependsOn": ["^build"], "outputs": [] }`

  **Acceptance Criteria**:
  - [ ] `pnpm --filter @lungilicious/api test` runs without error (0 tests pass, 1 todo)
  - [ ] `vitest.config.ts` exists in both api and worker
  - [ ] `test` task is in `turbo.json` pipeline

  **QA Scenarios**:
  ```
  Scenario: Vitest runs without error in API app
    Tool: Bash
    Steps:
      1. Run: pnpm --filter @lungilicious/api test
      2. Assert: exit code 0
      3. Assert: output mentions "1 todo" or "0 tests passed"
    Expected Result: Test runner configured and executes without crash
    Evidence: .sisyphus/evidence/task-31-vitest-run.txt
  ```

  **Commit**: YES (groups with T29, T30)
  - Message: `feat(testing): configure Vitest in API and Worker apps`

- [ ] 32. Docker Setup

  **What to do**:
  - Create `apps/api/Dockerfile` (multi-stage):
    - Stage 1 `base`: `node:20-alpine`, install pnpm globally
    - Stage 2 `deps`: copy `package.json`, `pnpm-workspace.yaml`, all `package.json` files, run `pnpm install --frozen-lockfile`
    - Stage 3 `build`: copy all source, run `pnpm turbo build --filter=@lungilicious/api...`
    - Stage 4 `runner`: copy only production deps + built dist, run `npx prisma generate`, CMD `node dist/main.js`
    - Non-root user: `RUN adduser -D appuser && USER appuser`
    - Port: `EXPOSE 3001`
  - Create `apps/worker/Dockerfile`: same multi-stage pattern, CMD `node dist/main.js`, port not exposed
  - Create `docker-compose.yml` at monorepo root for local development:
    - `postgres`: `postgres:16-alpine`, port 5432, volume for persistence, env vars
    - `redis`: `redis:7-alpine`, port 6379, volume for persistence
    - `api` (optional, for integration testing): builds from `apps/api/Dockerfile`, env vars from `.env`
    - `worker` (optional): builds from `apps/worker/Dockerfile`
    - Networks: `lungilicious-network` internal bridge
  - Create `.dockerignore` at root: `node_modules`, `.turbo`, `dist`, `.env`, `.git`, `prisma/generated`

  **Must NOT do**:
  - Do not run as root in Docker containers
  - Do not copy `.env` into the image
  - Do not run `prisma migrate` inside the Dockerfile — migrations run separately

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-stage Dockerfile in a pnpm monorepo requires careful dependency copying and cache optimization
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1-T8 in Wave 1 — no code dependencies, just config files)
  - **Parallel Group**: Wave 1 (moved here from Wave 4 so docker-compose.yml is available for all QA scenarios that need it)
  - **Blocks**: T33 (Railway depends on Docker)
  - **Blocked By**: None (start immediately)

  **References**:
  - pnpm monorepo Dockerfile: copy `pnpm-workspace.yaml`, `package.json` for all workspace packages before source (for better layer caching)
  - `pnpm install --frozen-lockfile` in CI/Docker
  - Docker non-root: `RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 && USER nestjs`
  - `docker-compose.yml` postgres: `POSTGRES_DB=lungilicious_dev`, `POSTGRES_USER=postgres`, `POSTGRES_PASSWORD=postgres`

  **Acceptance Criteria**:
  - [ ] `docker build -f apps/api/Dockerfile .` succeeds from monorepo root
  - [ ] `docker-compose up -d postgres redis` starts both services
  - [ ] API Docker image runs as non-root user
  - [ ] `.dockerignore` excludes `.env` and `node_modules`

  **QA Scenarios**:
  ```
  Scenario: Docker Compose starts Postgres and Redis successfully
    Tool: Bash
    Steps:
      1. Run: docker compose up -d postgres redis
      2. Wait: 5 seconds
      3. Run: docker compose ps
      4. Assert: both "postgres" and "redis" show status "running"
      5. Run: docker compose exec postgres psql -U postgres -c "SELECT 1"
      6. Assert: exit code 0
    Expected Result: Both services healthy
    Evidence: .sisyphus/evidence/task-32-docker-compose.txt
  ```

  **Commit**: YES
  - Message: `feat(infra): add multi-stage Dockerfiles and docker-compose for local dev`
  - Files: `apps/api/Dockerfile`, `apps/worker/Dockerfile`, `docker-compose.yml`, `.dockerignore`

- [ ] 33. Railway Deployment Config

  **What to do**:
  - Create `apps/api/railway.toml`:
    ```toml
    [build]
    builder = "dockerfile"
    dockerfilePath = "apps/api/Dockerfile"
    buildContext = "."

    [deploy]
    startCommand = "node dist/main.js"
    healthcheckPath = "/health"
    healthcheckTimeout = 30
    restartPolicyType = "on_failure"
    restartPolicyMaxRetries = 3
    ```
  - Create `apps/worker/railway.toml`:
    ```toml
    [build]
    builder = "dockerfile"
    dockerfilePath = "apps/worker/Dockerfile"
    buildContext = "."

    [deploy]
    startCommand = "node dist/main.js"
    restartPolicyType = "on_failure"
    restartPolicyMaxRetries = 3
    ```
  - Create `docs/ops/railway-deployment.md` documenting:
    - Required Railway environment variables for each service
    - How to link Railway Postgres and Redis add-ons
    - Pre-deploy migration step: `npx prisma migrate deploy` (run as release command or manual)
    - How to set `SESSION_SECRET` (generate with `openssl rand -hex 32`)
    - Separate Railway services: `lungilicious-api` + `lungilicious-worker`

  **Must NOT do**:
  - Do not commit Railway tokens or credentials
  - Do not set `DATABASE_URL` or `REDIS_URL` in config files — Railway injects these

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file creation with documented patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T29, T30, T31, T34)
  - **Parallel Group**: Wave 4
  - **Blocks**: F2
  - **Blocked By**: T32 (Dockerfiles must exist for railway.toml to reference them)

  **References**:
  - Railway `railway.toml` spec: `[build]` section with `builder = "dockerfile"`, `[deploy]` section
  - Railway healthcheck: `healthcheckPath` must match an actual endpoint (T29 `/health`)
  - Migration strategy: `npx prisma migrate deploy` (production-safe, no schema changes)

  **Acceptance Criteria**:
  - [ ] `apps/api/railway.toml` exists with healthcheckPath
  - [ ] `apps/worker/railway.toml` exists
  - [ ] `docs/ops/railway-deployment.md` documents all required env vars

  **QA Scenarios**:
  ```
  Scenario: railway.toml files are valid TOML
    Tool: Bash
    Steps:
      1. Run: node -e "const t = require('fs').readFileSync('apps/api/railway.toml','utf8'); console.log('readable:', t.includes('[build]'))"
      2. Assert: output contains "readable: true"
    Expected Result: TOML files are valid and contain expected sections
    Evidence: .sisyphus/evidence/task-33-railway-config.txt
  ```

  **Commit**: YES
  - Message: `feat(infra): add Railway deployment config for API and Worker`

- [ ] 34. Turbo Pipeline Finalization & CI Smoke Test

  **What to do**:
  - Finalize `turbo.json` with complete pipeline:
    ```json
    {
      "$schema": "https://turbo.build/schema.json",
      "pipeline": {
        "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
        "typecheck": { "dependsOn": ["^build"], "outputs": [] },
        "lint": { "outputs": [] },
        "test": { "dependsOn": ["^build"], "outputs": [] },
        "dev": { "cache": false, "persistent": true },
        "start:dev": { "cache": false, "persistent": true },
        "start:prod": { "cache": false }
      }
    }
    ```
  - Verify `pnpm turbo build` runs successfully across all 4 apps
  - Verify `pnpm turbo typecheck` passes with 0 errors
  - Verify `pnpm turbo lint` passes with 0 errors
  - Create `.github/workflows/ci.yml` (GitHub Actions):
    - Trigger: `push` to `main`, `pull_request`
    - Steps: `pnpm install`, `pnpm turbo typecheck`, `pnpm turbo lint`, `pnpm turbo test`, `pnpm turbo build`
    - Caches: pnpm store cache, turbo cache
    - Node version: 20 LTS
  - Verify all package `build` scripts produce output in `dist/` (NestJS apps) or `.next/` (Next.js)

  **Must NOT do**:
  - Do not add deployment steps to CI yet — build and test only in Phase 1
  - Do not add secret-dependent steps to CI (no real DATABASE_URL needed for typecheck/lint)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config file finalization with known patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (after all Wave 3 tasks and T31 complete)
  - **Parallel Group**: Wave 4 (final step)
  - **Blocks**: F1
  - **Blocked By**: T11, T12, T31

  **References**:
  - Turbo pipeline docs: https://turbo.build/repo/docs/reference/configuration
  - GitHub Actions pnpm cache: `actions/setup-node@v4` with `cache: 'pnpm'`
  - Turbo remote caching (optional): can be configured later with Vercel

  **Acceptance Criteria**:
  - [ ] `pnpm turbo build` exits 0 from monorepo root
  - [ ] `pnpm turbo typecheck` exits 0 with zero errors
  - [ ] `pnpm turbo lint` exits 0 with zero errors
  - [ ] `.github/workflows/ci.yml` exists

  **QA Scenarios**:
  ```
  Scenario: Full Turbo build pipeline succeeds
    Tool: Bash
    Steps:
      1. Run: pnpm turbo build from monorepo root
      2. Assert: exit code 0
      3. Assert: "Tasks: N successful" in output
      4. Assert: dist/ exists in apps/api/ and apps/worker/
      5. Assert: .next/ exists in apps/storefront/ and apps/admin/
    Expected Result: All 4 apps build successfully
    Evidence: .sisyphus/evidence/task-34-turbo-build.txt

  Scenario: Typecheck passes with zero errors across all packages
    Tool: Bash
    Steps:
      1. Run: pnpm turbo typecheck
      2. Assert: exit code 0
      3. Assert: no "error TS" lines in output
    Expected Result: Zero TypeScript errors across entire monorepo
    Evidence: .sisyphus/evidence/task-34-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(ci): finalize Turbo pipeline and add GitHub Actions CI workflow`
  - Files: `turbo.json`, `.github/workflows/ci.yml`

---

## Final Verification Wave

> 3 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Run `pnpm turbo typecheck` and `pnpm turbo lint` from monorepo root. Verify all 6 docs exist in `docs/`: `docs/architecture/threat-model.md`, `docs/architecture/module-boundaries.md`, `docs/architecture/rbac-matrix.md`, `docs/api/openapi-v1.md`, `docs/payments/payment-abstraction.md`, `docs/data/database-schema-v1.md`. Verify `GET /health` returns HTTP 200 with JSON body containing `"status":"ok"` and `"info"` field (standard NestJS Terminus format — do NOT expect `"db":"connected"`). Check for forbidden patterns in `apps/api/src/**/*.ts`: `grep -rn "console\.log\|as any\|@ts-ignore\|jsonwebtoken\|jwt"` — must return zero matches. Confirm `prisma generate` succeeds. Confirm `GET /me` without session returns HTTP 401.
  Output: `Typecheck [PASS/FAIL] | Lint [PASS/FAIL] | Docs [6/6] | Health Terminus format [PASS/FAIL] | /me guard [401 PASS/FAIL] | Forbidden patterns [CLEAN/N issues] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Full Integration Smoke Test** — `unspecified-high`
  From a clean shell: `docker compose up -d` (Postgres + Redis), `pnpm turbo build`, start API with `pnpm --filter @lungilicious/api start:prod`, `curl http://localhost:3001/health` → assert HTTP 200 and response JSON contains `"status":"ok"` and `"info"` field with `"db"` and `"redis"` sub-objects each having `"status":"up"` (standard NestJS Terminus format). `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/me` → assert HTTP 401 (session guard working). `npx prisma migrate deploy` runs without error. Worker starts without error: `pnpm --filter @lungilicious/worker start:prod`. Save all command outputs to `.sisyphus/evidence/final-f2-smoke.txt`.
  Output: `Docker [PASS/FAIL] | Build [PASS/FAIL] | API start [PASS/FAIL] | Health [PASS/FAIL] | Session guard [PASS/FAIL — must be 401] | Prisma [PASS/FAIL] | Worker [PASS/FAIL] | VERDICT`

- [ ] F3. **Scope Fidelity Check** — `deep`
  For every task: read the "What to do" section, then read the actual source files created. Verify no business logic leaked in (grep for real DB queries in service methods beyond `$queryRaw\`SELECT 1\`` — any `findMany`, `findFirst`, `create`, `update`, `delete` call that isn't in `AuditService.log()` or `PrismaService.$connect` is a violation). Verify no raw card field names in any Prisma schema file: `grep -rE "cardNumber|cvv|pan|rawCard" prisma/`. Verify no hardcoded secrets: `grep -rE "postgresql://|redis://" apps/ --include="*.ts" --include="*.js"` — must return zero matches in source files (only `.env.example` with example values is acceptable). Verify Next.js apps are shells only: `wc -l apps/storefront/src/app/page.tsx` — should be under 15 lines. Verify session auth uses `@fastify/secure-session`: `grep -r "jsonwebtoken\|JWT\|jwt_secret" apps/api/` — must return zero matches. Verify all env vars go through Zod config: `grep -rn "process.env\." apps/api/src/ --include="*.ts"` — only `main.ts` and `config.service.ts` should use `process.env` directly, nowhere else.
  Output: `No business logic [CLEAN/N issues] | No raw cards [CLEAN/issues] | No hardcoded secrets [CLEAN/issues] | Next.js shells [CLEAN/issues] | No JWT [CLEAN/issues] | Env via Zod [CLEAN/issues] | VERDICT: APPROVE/REJECT`

---

## Commit Strategy

> **Note**: Git is initialized in Task 1 (`git init`). All commits below apply after T1 completes. Tasks in the same "groups with" note are committed together as one atomic commit.

- After T1+T2: `chore(monorepo): bootstrap Turborepo + pnpm workspace root and shared packages`
- After T3-T8 (Phase 0 docs): `docs(architecture): add Phase 0 contract documents`
- After T9-T12 (app scaffolds): `feat(apps): bootstrap NestJS API, Worker, storefront, and admin app shells`
- After T13-T18 (Prisma): `feat(prisma): add complete multi-domain schema and initial migration`
- After T19-T24 (Wave 3 infrastructure): `feat(api): add Pino logging, Prisma, Redis, BullMQ, config, and common infrastructure`
- After T25 (Worker): `feat(worker): wire BullMQ processor stubs with retry and concurrency config`
- After T26-T28 (auth/RBAC/audit): `feat(api): add session auth skeleton, RBAC guards, and audit module`
- After T29-T31 (health/swagger/vitest): `feat(api): add health checks, Swagger, and Vitest config`
- After T32 (Docker): `feat(infra): add multi-stage Dockerfiles and docker-compose for local dev`
- After T33 (Railway): `feat(infra): add Railway deployment config for API and Worker`
- After T34 (CI): `feat(ci): finalize Turbo pipeline and add GitHub Actions CI workflow`

---

## Success Criteria

### Verification Commands
```bash
pnpm install          # Expected: no errors
pnpm turbo typecheck  # Expected: 0 errors across all packages
pnpm turbo lint       # Expected: 0 errors
npx prisma validate   # Expected: Schema is valid
npx prisma migrate dev --name init  # Expected: migration applied
curl http://localhost:3001/health   # Expected: {"status":"ok","info":{"db":{"status":"up"},"redis":{"status":"up"}},...}
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/me  # Expected: 401 (session guard working)
```

### Final Checklist
- [ ] All 6 Phase 0 docs present and non-empty
- [ ] Monorepo builds with zero TypeScript errors
- [ ] Prisma schema covers all 50+ tables, validates, and generates client
- [ ] API health endpoint responds correctly
- [ ] Session auth wired globally
- [ ] RBAC guards present and globally registered
- [ ] Audit module writes to DB
- [ ] No forbidden patterns (no `any`, no JWT, no Convex, no console.log, no hardcoded secrets)
- [ ] Railway and Docker configs present
