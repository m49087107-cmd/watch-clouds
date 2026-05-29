# Watch Clouds

A full-stack dark-themed Netflix-style streaming platform for movies, web series, anime, and documentaries. Features TMDB integration, user auth with JWT, admin panel, watchlist, and user reviews.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000/8080)
- `pnpm --filter @workspace/watch-clouds run dev` — run the frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `TMDB_API_KEY` — for TMDB search & import in admin panel

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + TailwindCSS v4 + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (bcryptjs + jsonwebtoken), stored as `wc_token` in localStorage
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle DB schemas (users, movies, watchlist, reviews, castMembers)
- `lib/api-client-react/src/generated/` — Orval-generated React Query hooks + Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify/middleware
- `artifacts/watch-clouds/src/` — React frontend
- `artifacts/watch-clouds/src/hooks/use-auth.tsx` — Auth context + JWT management
- `artifacts/watch-clouds/src/lib/utils.ts` — TMDB image helpers + formatRuntime

## Architecture decisions

- Contract-first API: OpenAPI spec drives codegen for both React Query hooks and Zod validators.
- JWT in localStorage (key: `wc_token`) — auth header injected globally via custom-fetch in `lib/api-client-react`.
- Role-based access: `user` and `admin` roles; admin routes gated with `requireAdmin` middleware.
- DB arrays (`genres`) stored as PostgreSQL text arrays.
- Dark mode forced via `class="dark"` on `<html>` in index.html — all dark theme vars in `.dark {}` CSS block.

## Product

- Home page with hero banner (rotating featured movies) and category rows
- Browse page with search, type filters (movie/series/anime/documentary), and genre filters
- Movie detail page with backdrop, cast, trailer link, and user reviews
- User authentication (register / login) and watchlist management
- Admin panel: dashboard stats, movie management (CRUD), user management, TMDB import

## Seeded credentials

- Admin: `admin@watchclouds.com` / `admin123`
- User: `user@watchclouds.com` / `user123`

## User preferences

- Dark cinema aesthetic — deep navy/charcoal theme with teal/cyan accent (#00BCD4)
- Netflix-style layout

## Gotchas

- TMDB_API_KEY is required for the TMDB search/import admin feature. Without it, TMDB routes return 503.
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes before editing frontend.
- `dark` class must be on the `<html>` element in `index.html` for the theme to apply.
- API server handles full base path (`/api/...`); no path rewriting by proxy.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
