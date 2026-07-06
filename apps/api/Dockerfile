FROM node:20-alpine AS base
# Keep pnpm store inside the image so workspace symlinks resolve at runtime
ENV PNPM_HOME="/pnpm"
ENV PNPM_STORE_DIR="/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Build the Application
FROM base AS build
WORKDIR /app
COPY . .
# Install turbo globally to ensure compatibility with Alpine Linux and avoid lockfile platform issues
RUN npm install -g turbo
RUN pnpm install --frozen-lockfile
RUN turbo build --filter=api

# 2. Production Runner
FROM base AS deploy
WORKDIR /app
ENV PNPM_STORE_DIR="/pnpm/store"
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /pnpm/store /pnpm/store
COPY --from=build /app/apps/api/package.json ./package.json

CMD [ "node", "dist/main" ]
