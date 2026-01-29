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

- **Multi-Tenancy**: Strict data isolation between tenants using Row-Level Security (RLS) logic.
- **RBAC**: Granular permissions for Admins, Responders, and Viewers via Guard middleware.
- **Real-Time Ops**: Instant status updates across all clients using WebSockets.
- **Async Processing**: Decoupled email notifications and webhooks using Redis message queues.

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

2. **Start Infrastructure**
   Spin up PostgreSQL and Redis instances.

   ```bash
   docker-compose up -d
   ```

3. **Install Dependencies**

   ```bash
   pnpm install
   ```

4. **Database Setup**
   Run migrations and seed data.

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

## Quality & Testing

We believe "invisible work" matters most.

- **E2E Testing**: Comprehensive flows tested with **Playwright**.
- **CI/CD**: GitHub Actions pipeline for linting, testing, and build verification on every push.
- **ADRs**: See [/docs/adr](./docs/adr) for Architecture Decision Records explaining our technical trade-offs (e.g., _Why Postgres over Mongo?_).

## License

MIT

---

_Built as a demonstration of production-ready architecture patterns._
_Built as a demonstration of production-ready architecture patterns._
