# AGENTS.md — Daily Expenses

> Orientation file for AI agents working on the Daily Expenses rebuild.

## What this is

Full-stack personal finance app rebuilt from a legacy Rails 4 monolith into a modern split architecture:

- **API:** Ruby on Rails 8.1 API-only (`api/`) — owns the database and migrations
- **Web:** Next.js 16 App Router (`web/`) — consumes the API
- **DB:** PostgreSQL 17
- **Dev:** Docker Compose
- **Deploy:** DigitalOcean droplet with Nginx reverse proxy

## Stack

- Rails 8.1.4, Ruby 3.4-slim in Docker, ActiveRecord, Devise + JWT (`devise-jwt`)
- Next.js 16.4.0, TypeScript, Tailwind CSS 4
- Prisma in `web/prisma/` for type generation only — schema is introspected from Rails DB
- PostgreSQL 17

## Layout

```
.
├── api/                    # Rails API
│   ├── app/controllers/api/v1/
│   ├── app/models/
│   ├── app/serializers/
│   ├── config/
│   ├── db/migrate/         # Rails owns all migrations
│   └── Dockerfile
├── web/                    # Next.js frontend
│   ├── app/
│   ├── domain/
│   ├── infrastructure/
│   ├── usecases/
│   ├── prisma/             # Prisma schema (auto-generated via db pull)
│   ├── test/
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── AGENTS.md
```

## Services & ports (dev defaults via `.env`)

| Service | Host port | Container | Notes |
|---|---|---|---|
| web | `WEB_PORT` (5001) | 3000 | `npm run dev` |
| api | `API_PORT` (5000) | 3000 | `rails s -b 0.0.0.0` |
| postgres | `DATABASE_PORT` (5434) | 5432 | `postgres:17` |

## First-session checklist

```bash
cp .env.example .env   # once; fill DATABASE_*, API_PORT, WEB_PORT
docker compose up -d --build
docker compose exec api bundle exec rails db:prepare
```

> `DATABASE_PORT` is the host-mapped port; `DATABASE_INTERNAL_PORT` is the
> port the API/web containers use inside the Docker network (usually 5432).

## Auth

- `POST /api/v1/signup` → 200 + `Authorization: Bearer <jwt>` header
- `POST /api/v1/signin` → 200 + fresh token header (30-min expiry)
- `DELETE /api/v1/signout` → 200, token revoked via JTIMatcher
- Every resource request needs `Authorization: Bearer <jwt>`
- Ownership enforced by `Ownable` concern: resources belong to token owner; `user_id` never permitted from params

## Conventions

- Branch: `feat/<thing>` from `main`
- Commits: Conventional Commits, PT-BR imperative, title ≤72 bytes
- Stage explicitly (`git add -- <paths>`); never `git add -A`/`.`/`-a`
- Never stage `.env*` (except `.env.example`), `*.key`, `master.key`, secrets
- Migrations: ask before running `db:migrate`; Rails owns all migrations
- Prisma: run `prisma db pull` after Rails migrations, never hand-edit schema

## Domain

- **User:** Devise + JWT, has many categories/expenses/incomings
- **Category:** user-owned, default "Sem categoria" on signup
- **Expense:** user-owned, belongs to category, `price_cents`, `date`, `import_hash`
- **Incoming:** user-owned, `amount_cents`, `date`, `origin`

## Current status (Phase 1 complete, web CRUD done)

- ✅ Rails API bootstrapped with Devise + JWT auth
- ✅ Next.js 16 web app with TypeScript + Tailwind
- ✅ Docker Compose for local dev
- ✅ Models: User, Category, Expense, Incoming
- ✅ CRUD endpoints under `/api/v1` for categories, expenses, incomings
- ✅ Profile endpoint `GET /api/v1/profile` used to restore the session on reload
- ✅ Dashboard endpoint with date filters
- ✅ CSV import endpoint with deduplication and skip rules
- ✅ Prisma schema introspected from Rails DB
- ✅ Basic auth pages (signin/signup) and dashboard page
- ✅ Web CRUD pages for categories, expenses and incomings (`web/app/(app)/`), with period filters and a shared auth gate/nav
- ✅ Nginx config example for deploy
- ✅ Tests for User model, profile controller, web mappers, money/date helpers and usecases

## Next steps

1. CSV import page with upload + result summary
2. Charts on dashboard (by category and by date)
3. More API/controller tests (categories, expenses, incomings)
4. Deploy to DigitalOcean with the provided Nginx config

## Useful commands

```bash
# Start everything
docker compose up -d --build

# Prepare database
docker compose exec api bundle exec rails db:prepare

# Reset dev database (destroys data)
docker compose exec api bundle exec rails db:drop db:create db:migrate

# Rails console / routes
docker compose exec api rails console
docker compose exec api rails routes

# Tests
docker compose exec api bundle exec rails test
docker compose exec web npm run test:run

# Prisma introspection
docker compose exec web npm run db:pull
```

## Test data

The development database currently contains a test user created during verification:

- **Email:** `test@example.com`
- **Password:** `password123`

You can log in with this user at http://localhost:5001/signin, or reset the DB with `rails db:drop db:create db:migrate` and start fresh.

## Skills useful for next steps

- `rails-smart-generator` — for Rails scaffolding, models, controllers, migrations
- `rails-devise-jwt-generator` — if auth needs changes or new Devise modules
- `cvf-generate-usecase` — for creating clean-architecture use cases on the web
- `cvf-generate-server-action` — for Next.js Server Actions that call the Rails API
- `cvf-generate-form-action` — for form submission handling in Next.js
- `cvf-domain-to-repository-generator` — for adding new repositories/interfaces on the web
- `cvf-prisma-dto-generator` — for DTOs based on Prisma models
- `cvf-admin-simplepage-manager` — if adding admin/simple pages under `/app`

## Deployment

- Web: `expenses.krotedev.com.br`
- API: `api.expenses.krotedev.com.br`
- Nginx reverse proxies to `localhost:${WEB_PORT}` and `localhost:${API_PORT}`
- SSL already configured on Nginx
