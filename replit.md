# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Authentication

Auth is **custom session-based** (no Passport, no Replit OIDC):

- **Email/password**: bcryptjs hashing (12 rounds), stored in `usersTable.passwordHash`
- **Google OAuth**: PKCE flow via `openid-client`, `upsertGoogleUser` links by `googleId` then email
- **Sessions**: 64-char hex `sid` cookie stored in `sessionsTable`, 7-day sliding expiry
- **Rate limiting**: `express-rate-limit` (IPv6-safe), account lockout after 5 failed attempts
- **Auth state**: React Context (`AuthProvider` in `lib/replit-auth-web`) shared across all components
- **Login screen**: `artifacts/harmony-hub/src/components/LoginScreen.tsx` — RetroOS styled, shown when unauthenticated

### Auth key files
- `artifacts/api-server/src/lib/auth.ts` — session CRUD, Google OIDC config, cookie helpers
- `artifacts/api-server/src/lib/rateLimit.ts` — rate limiters, lockout helpers
- `artifacts/api-server/src/routes/auth.ts` — all `/api/auth/*` routes
- `artifacts/api-server/src/middlewares/authMiddleware.ts` — session → `req.user` middleware
- `lib/replit-auth-web/src/auth-context.tsx` — `AuthProvider` + `useAuth` hook (shared context)
- `lib/db/src/schema/auth.ts` — `usersTable` + `sessionsTable` schema

### Auth endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/user` | Current session user |
| POST | `/api/auth/register` | Email/password registration |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/google` | Begin Google OAuth PKCE flow |
| GET | `/api/auth/google/callback` | Complete Google OAuth flow |
| POST | `/api/auth/logout` | Clear session |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
