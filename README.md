# 🎬 Watch Clouds

  A full-stack **Netflix-style dark streaming platform** built with React, Node.js, PostgreSQL, and TMDB integration.

  ![Watch Clouds](https://img.shields.io/badge/Watch%20Clouds-Streaming%20Platform-00BCD4?style=for-the-badge)

  ## ✨ Features

  - 🌑 **Dark cinema UI** — Deep navy/charcoal theme with teal accent
  - 🎥 **TMDB Integration** — Search & one-click import movies/series with full details, cast, posters
  - 🔐 **JWT Authentication** — Register/Login with role-based access (Admin & User)
  - 🛠️ **Admin Panel** — Movie CRUD, user management, TMDB import tool
  - 📋 **Watchlist** — Save movies to personal watchlist
  - ⭐ **Reviews** — Rate and review movies (1–10 stars)
  - 🎭 **Cast Info** — Actor profiles imported from TMDB
  - 📱 **Responsive** — Works on mobile, tablet, and desktop

  ## 🛠️ Tech Stack

  | Layer | Tech |
  |-------|------|
  | Frontend | React 19 + Vite + TailwindCSS v4 + shadcn/ui |
  | Backend | Node.js + Express 5 + TypeScript |
  | Database | PostgreSQL + Drizzle ORM |
  | Auth | JWT (bcryptjs + jsonwebtoken) |
  | API Codegen | Orval (OpenAPI → React Query hooks) |
  | Package Manager | pnpm workspaces (monorepo) |

  ## 🚀 Getting Started

  ### Prerequisites
  - Node.js 20+
  - pnpm 9+
  - PostgreSQL database

  ### Environment Variables

  ```env
  DATABASE_URL=postgresql://user:pass@host:5432/dbname
  SESSION_SECRET=your-secret-key
  TMDB_API_KEY=your-tmdb-api-key
  ```

  ### Install & Run

  ```bash
  # Install dependencies
  pnpm install

  # Push database schema
  pnpm --filter @workspace/db run push

  # Start API server (port 8080)
  pnpm --filter @workspace/api-server run dev

  # Start frontend (separate terminal)
  pnpm --filter @workspace/watch-clouds run dev
  ```

  ## 📁 Project Structure

  ```
  watch-clouds/
  ├── artifacts/
  │   ├── api-server/          # Express 5 API backend
  │   └── watch-clouds/        # React + Vite frontend
  ├── lib/
  │   ├── api-spec/            # OpenAPI spec (source of truth)
  │   ├── api-client-react/    # Orval-generated React Query hooks
  │   ├── api-zod/             # Zod validation schemas
  │   └── db/                  # Drizzle ORM schema + client
  └── pnpm-workspace.yaml
  ```

  ## 🔑 Default Credentials

  | Role | Email | Password |
  |------|-------|----------|
  | Admin | admin@watchclouds.com | admin123 |
  | User | user@watchclouds.com | user123 |

  > ⚠️ Change these in production!

  ## 📺 Pages

  - **/** — Home with hero banner & category rows
  - **/browse** — Search + filter by type & genre
  - **/movie/:id** — Movie detail with cast, trailer, reviews
  - **/login** — Sign in
  - **/register** — Create account
  - **/watchlist** — Saved movies
  - **/admin** — Dashboard (admin only)
  - **/admin/movies** — Manage movies
  - **/admin/users** — Manage users
  - **/admin/tmdb-import** — Import from TMDB

  ## 🎭 TMDB Import

  1. Get a free API key from [themoviedb.org](https://www.themoviedb.org/settings/api)
  2. Add `TMDB_API_KEY` to your environment
  3. Go to Admin → TMDB Import
  4. Search any movie/series → click Import

  ---

  Built with ❤️ using Replit
  