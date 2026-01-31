FROM node:20-alpine AS base
# Keep pnpm store inside the image so workspace symlinks resolve at runtime
ENV PNPM_HOME="/pnpm"
ENV PNPM_STORE_DIR="/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Install Dependencies (Cached)
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy workspace packages
COPY packages/database/package.json ./packages/database/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile

# 2. Build the Application
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
RUN pnpm -C /app --filter api build

# 3. Production Runner
FROM base AS deploy
WORKDIR /app
ENV PNPM_STORE_DIR="/pnpm/store"
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=dependencies /pnpm/store /pnpm/store
COPY --from=build /app/apps/api/package.json ./package.json

CMD [ "node", "dist/main" ]
