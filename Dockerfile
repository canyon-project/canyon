ARG NODE_VERSION=22.17.0
ARG PNPM_VERSION=9

# Base with pnpm enabled
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
# Avoid corepack signature issues in containers; install pnpm via npm
RUN corepack disable || true && npm i -g pnpm@${PNPM_VERSION}

# Build backend (install with scripts, then compile)
FROM base AS build-backend
WORKDIR /app/packages/backend
COPY packages/backend ./
RUN pnpm install
RUN pnpm build

# Build frontend
FROM base AS build-frontend
WORKDIR /app
# Copy frontend source before install so that postinstall (codegen) has config & docs
COPY packages/frontend ./packages/frontend
# GraphQL codegen in FE relies on backend schema.gql
COPY packages/backend/schema.gql ./packages/backend/schema.gql
WORKDIR /app/packages/frontend
RUN pnpm install
RUN pnpm build

# (build-backend stage defined above)

# ---------- Runtime: Unified (NestJS serving static) ----------
FROM node:${NODE_VERSION}-alpine AS final
WORKDIR /app/packages/backend
# Avoid corepack signature issues in containers; install pnpm via npm
RUN corepack disable || true && npm i -g pnpm@${PNPM_VERSION}
ENV NODE_ENV=production

# Install production deps only for backend (no workspace scripts)
COPY packages/backend/package.json ./package.json
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN pnpm install --prod --ignore-scripts

# Copy backend build artifacts
COPY --from=build-backend /app/packages/backend/dist ./dist
COPY --from=build-backend /app/packages/backend/generated ./generated
COPY packages/backend/schema.gql ./schema.gql

# Copy frontend dist into backend's client directory
COPY --from=build-frontend /app/packages/frontend/dist ./client

EXPOSE 8080
CMD ["node", "dist/main.js"]
