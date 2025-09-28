# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.18.0
ARG PNPM_VERSION=9

# Base with pnpm enabled
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Install workspace deps (cacheable)
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY packages/backend/package.json packages/backend/package.json
COPY packages/frontend/package.json packages/frontend/package.json
RUN pnpm -w install

# Build frontend
FROM deps AS build-frontend
WORKDIR /app
COPY packages/frontend ./packages/frontend
# GraphQL codegen in FE relies on backend schema.gql
COPY packages/backend/schema.gql ./packages/backend/schema.gql
RUN pnpm -w --filter frontend... build

# Build backend
FROM deps AS build-backend
WORKDIR /app
COPY packages/backend ./packages/backend
RUN pnpm -w --filter backend... build

# ---------- Runtime: Backend (NestJS) ----------
FROM node:${NODE_VERSION}-alpine AS backend
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
ENV NODE_ENV=production

# Install production deps only for backend
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY packages/backend/package.json ./packages/backend/package.json
RUN pnpm -w --filter backend... install --prod

# Copy built artifacts
COPY --from=build-backend /app/packages/backend/dist ./packages/backend/dist
COPY packages/backend/schema.gql ./packages/backend/schema.gql

EXPOSE 8080
WORKDIR /app/packages/backend
CMD ["node", "dist/main.js"]

# ---------- Runtime: Frontend (Nginx serving dist) ----------
FROM nginx:1.27-alpine AS frontend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-frontend /app/packages/frontend/dist /usr/share/nginx/html


