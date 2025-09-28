# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.18.0
ARG PNPM_VERSION=9

# Base with pnpm enabled
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
# Avoid corepack signature issues in containers; install pnpm via npm
RUN corepack disable || true && npm i -g pnpm@${PNPM_VERSION}

# Install backend deps only (with scripts)
FROM base AS deps-backend
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY scripts ./scripts
COPY packages/backend/package.json packages/backend/package.json
RUN pnpm -w --filter backend... install

# Build frontend
FROM base AS build-frontend
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY scripts ./scripts
# Copy frontend source before install so that postinstall (codegen) has config & docs
COPY packages/frontend ./packages/frontend
# GraphQL codegen in FE relies on backend schema.gql
COPY packages/backend/schema.gql ./packages/backend/schema.gql
RUN pnpm -w --filter frontend... install
RUN pnpm -w --filter frontend... build

# Build backend
FROM deps-backend AS build-backend
WORKDIR /app
COPY packages/backend ./packages/backend
RUN pnpm -w --filter backend... build

# ---------- Runtime: Unified (NestJS serving static) ----------
FROM node:${NODE_VERSION}-alpine AS final
WORKDIR /app
# Avoid corepack signature issues in containers; install pnpm via npm
RUN corepack disable || true && npm i -g pnpm@${PNPM_VERSION}
ENV NODE_ENV=production

# Install production deps only for backend
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY scripts ./scripts
COPY packages/backend/package.json ./packages/backend/package.json
RUN pnpm -w --filter backend... install --prod

# Copy backend build artifacts
COPY --from=build-backend /app/packages/backend/dist ./packages/backend/dist
COPY packages/backend/schema.gql ./packages/backend/schema.gql

# Copy frontend dist into backend's public directory
COPY --from=build-frontend /app/packages/frontend/dist ./packages/backend/dist/public

EXPOSE 8080
WORKDIR /app/packages/backend
CMD ["node", "dist/main.js"]


