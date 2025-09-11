# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Canyon is a JavaScript code coverage collection platform that helps developers and QA engineers collect test case coverage during end-to-end testing. The project is organized as a monorepo using pnpm workspaces.

## Architecture

The repository is structured with three main packages:

- **Backend** (`packages/backend`): NestJS-based API service with GraphQL
  - Uses PostgreSQL with MikroORM for data persistence
  - ClickHouse for analytics and coverage data storage
  - Modules: `code`, `coverage`, `repo`, `system-config`, `ch`
  
- **Frontend** (`packages/frontend`): React 19 application with Vite
  - Uses Ant Design for UI components
  - GraphQL CodeGen for type-safe API integration
  - TailwindCSS for styling
  
- **Report** (`packages/report`): Standalone coverage report visualization library
  - Distributed as both UMD and ES modules
  - Uses Monaco Editor for code viewing

## Development Commands

### Root Level
- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages
- `pnpm format` - Format code using Biome

### Backend (`packages/backend`)
- `pnpm dev` - Start NestJS in watch mode
- `pnpm build` - Build the application
- `pnpm start` - Start production server

### Frontend (`packages/frontend`)
- `pnpm dev` - Start Vite dev server
- `pnpm build` - TypeScript compilation and Vite build
- `pnpm codegen` - Generate GraphQL types

### Report (`packages/report`)
- `pnpm build` - Build library for distribution
- `pnpm typecheck` - Run TypeScript type checking

## Code Standards

- **Formatter**: Biome (configured in `biome.json`)
- **TypeScript**: Version 5.8.3 across all packages
- **React**: Version 19.0.0 with React Compiler
- **Package Manager**: pnpm (version 9)

## Key Configuration Files

- `pnpm-workspace.yaml` - Workspace configuration
- `biome.json` - Code formatting and linting rules
- `packages/frontend/codegen.ts` - GraphQL code generation
- `packages/backend/mikro-orm.config.ts` - Database ORM configuration

## Database Schema

Backend uses dual database setup:
- **PostgreSQL**: Primary data storage with MikroORM
- **ClickHouse**: Analytics and coverage metrics storage

## Tools and Ecosystem

The repository includes additional tools:
- **Extension** (`tools/extension`): Chrome extension for manual test coverage
- **Reporter** (`tools/reporter`): Coverage data reporting utilities  
- **Uploader** (`tools/uploader`): Coverage data upload client

## Environment Requirements

- Node.js compatible with React 19
- pnpm package manager
- PostgreSQL database
- ClickHouse database (for analytics)