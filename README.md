# NexaOps

A robust, multi-tenant B2B Incident Response Platform designed to streamline incident management for modern engineering teams. Real-time updates, role-based access, and enterprise-grade isolation.

## The Stack

Built with a focus on type safety, scalability, and maintainability.

- **Monorepo**: Turborepo / Nx
- **Language**: TypeScript (Strict)
- **Frontend**: Next.js 14+ (App Router), TanStack Query, React Hook Form
- **Backend**: NestJS (Modular Architecture)
- **Database**: PostgreSQL (with Drizzle ORM)
- **Infrastructure**: Docker & Redis (BullMQ for queues)
- **Real-time**: WebSockets

## Key Features

- **Multi-Tenancy**: Application-level tenant isolation — every query is scoped by the `tenantId` carried in the verified JWT, enforced in the service layer. (Postgres Row-Level Security is a planned defense-in-depth addition; it is not enabled yet.)
- **RBAC**: Granular permissions for Owners, Admins, Responders, and Viewers via Guard middleware.
- **Authenticated real-time**: WebSocket connections are verified against the JWT on connect; tenant room membership is derived from the token, never from client input.

## Security

- **JWT secrets** come from the `JWT_SECRET` environment variable on both the signing and verifying side. The API refuses to boot in production without it. Token lifetime is configurable via `JWT_EXPIRES_IN` (default `1d`), and the NextAuth session lifetime is aligned to match.
- **Tenant switching**: users belonging to several tenants can list memberships (`GET /auth/memberships`) and mint a token for another tenant (`POST /auth/switch-tenant`).
- **Rate limiting**: global throttle (100 req/min) with stricter limits on `/auth/login` and `/auth/register`.
- **HTTP hardening**: `helmet` security headers; CORS restricted to `CORS_ORIGINS` (comma-separated allowlist).
- **Structured logging** with pino (`nestjs-pino`); authorization headers and cookies are redacted.
- **Error tracking**: set `SENTRY_DSN` to enable Sentry; disabled otherwise.
- **Email**: real SMTP delivery when `SMTP_HOST` is configured (queued through BullMQ with retries); console-logged mock otherwise. Incident status changes notify the tenant's Owners/Admins/Responders.

### Environment variables

See [.env.example](./.env.example) (deployment), [apps/api/.env.example](./apps/api/.env.example) (API), and [packages/database/.env.example](./packages/database/.env.example) (Drizzle tooling). Never commit real `.env` files — they are gitignored.

## Operations

- **CI/CD**: GitHub Actions for automated testing and linting.
- **Observability**: Health checks via `/health` endpoint (Terminus) monitoring Database and Memory.
- **Containerization**: Full Docker support for API, Web, Postgres, and Redis.

### Vercel Deployment Note

If you deploy the API or the full app on Vercel, you must point `DATABASE_URL` at a managed Postgres instance such as Neon, Supabase, or Vercel Postgres. The Docker Compose hostname `postgres` only works inside the local or VPS container stack and will return a database error on Vercel.

If you deploy only the web app on Vercel, set `NEXT_PUBLIC_API_URL` to your deployed API URL and keep `NEXTAUTH_URL` and `NEXTAUTH_SECRET` configured in the Vercel project environment variables.

## Project Structure

This project follows a monorepo architecture to separate concerns while sharing logic.

```text
/apps
  ├── web          # Next.js Frontend Dashboard
  └── api          # NestJS Backend Service
/packages
  ├── database     # Shared Drizzle/Prisma schema & client
  ├── ui           # Shared React component library
  └── typescript   # Shared TS Configuration
```

## Getting Started

### Prerequisites

- Node.js (v20+)
- Docker & Docker Compose
- pnpm (recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nexaops.git
   cd nexaops
   ```

2. **Run Infrastructure & Apps (Docker)**

   Run the entire stack (API, Web, DB, Redis) with a single command:

   ```bash
   docker-compose up --build
   ```

3. **Manual Dev Setup (Optional)**

   If you prefer running apps locally with Node.js:

   ```bash
   docker-compose up -d postgres redis
   pnpm install
   pnpm db:migrate
   pnpm db:seed
   pnpm dev
   ```

### Database migrations

Migrations live in `packages/database/drizzle` and are generated from the Drizzle schema:

```bash
cd packages/database
pnpm db:generate   # generate a migration after editing src/schema.ts
pnpm db:migrate    # apply pending migrations
```

CI fails if the schema changes without a committed migration.

## Quality & Testing

We believe "invisible work" matters most.

- **E2E Testing**: Playwright suite in `apps/web/e2e` — smoke tests plus full-stack auth flows (run in CI against a real Postgres/Redis stack; locally: `pnpm --filter web test:e2e`).
- **CI/CD**: GitHub Actions pipeline for linting, unit tests, build verification, migration-drift checks, and end-to-end tests on every push.
- **ADRs**: See [/docs/adr](./docs/adr) for Architecture Decision Records explaining our technical trade-offs (e.g., _Why Postgres over Mongo?_).

## License

MIT

---
