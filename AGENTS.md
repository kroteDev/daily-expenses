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
| postgres | `DATABASE_PORT` (5432) | 5432 | `postgres:17` |

## First-session checklist

```bash
cp .env.example .env   # once; fill DATABASE_*, API_PORT, WEB_PORT
docker compose up -d --build
docker compose exec api bundle exec rails db:prepare
```

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

## Deployment

- Web: `expenses.krotedev.com.br`
- API: `api.expenses.krotedev.com.br`
- Nginx reverse proxies to `localhost:${WEB_PORT}` and `localhost:${API_PORT}`
- SSL already configured on Nginx
