# AGENTS.md — Daily Expenses

> Orientation file for AI agents working on the Daily Expenses rebuild.

## What this is

Full-stack personal finance app rebuilt from a legacy Rails 4 monolith into a modern split architecture:

- **API:** Ruby on Rails 8.1 API-only (`api/`) — owns the database and migrations
- **Web:** Next.js 16 App Router (`web/`) — consumes the API
- **DB:** PostgreSQL 17
- **Dev:** Docker Compose
- **Deploy:** GitHub Actions → DigitalOcean droplet with Nginx reverse proxy

## Stack

- Rails 8.1.4, Ruby 3.4-slim in Docker, ActiveRecord, Devise + JWT (`devise-jwt`)
- Next.js 16.4.2, React 19, TypeScript, Tailwind CSS 4, Recharts 3 (dashboard charts)
- Prisma 7 in `web/prisma/` for type generation only — schema is introspected from the Rails DB;
  the connection URL lives in `web/prisma.config.ts` (reads `DATABASE_URL`). No app code imports
  `@prisma/client`; it is only a dev-time type source
- PostgreSQL 17
- Vitest for web unit tests, Minitest for the API

## Layout

```
.
├── api/                       # Rails API
│   ├── app/controllers/api/v1/
│   ├── app/models/
│   ├── app/serializers/
│   ├── app/services/          # CsvImportService
│   ├── config/
│   ├── db/migrate/            # Rails owns all migrations
│   ├── test/
│   ├── Dockerfile             # dev
│   └── Dockerfile.prod        # multi-stage production image
├── web/                       # Next.js frontend
│   ├── app/                   # App Router pages (see routes below)
│   ├── components/
│   ├── domain/
│   ├── infrastructure/
│   ├── usecases/
│   ├── lib/                   # money/date/password helpers, dashboard series
│   ├── prisma/schema.prisma   # introspected, never hand-edited
│   ├── prisma.config.ts       # Prisma 7 config (datasource URL)
│   ├── test/                  # vitest suites
│   ├── Dockerfile             # dev
│   └── Dockerfile.prod        # multi-stage production image
├── .github/workflows/ci-cd.yml
├── nginx/daily-expenses.conf  # reverse proxy example
├── docker-compose.yml         # dev stack
├── docker-compose.prod.yml    # production stack
├── .env.example               # dev env template
├── .env.production.example    # production env template
└── AGENTS.md
```

## Services & ports (dev defaults via `.env`)

| Service | Host port | Container | Notes |
|---|---|---|---|
| web | `WEB_PORT` (5001) | 3000 | `npm run dev` |
| api | `API_PORT` (5000) | 3000 | `rails s -b 0.0.0.0` |
| postgres | `DATABASE_PORT` (5434) | 5432 | `postgres:17` |

In production the same ports are published on `127.0.0.1` only, and Nginx proxies to them.

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
- `GET /api/v1/profile` → current user, used to restore the session on reload
- Every resource request needs `Authorization: Bearer <jwt>`
- Ownership enforced by `Ownable` concern: resources belong to token owner; `user_id` never permitted from params
- **Password policy** (model validation, only when a password is set): min 6 characters, at least one
  letter, one number and one special character (anything that is not a letter, digit or whitespace).
  Accented letters count as letters. The signup form mirrors the rules in `web/lib/password.ts`;
  the API remains the authority. No password change/reset flow exists yet — when added, it must
  enforce the same rule (Devise `recoverable` is enabled).

## API surface (`/api/v1`)

| Method | Path | Notes |
|---|---|---|
| POST | `/signup`, `/signin` | Devise + JWT |
| DELETE | `/signout` | revokes the token via JTIMatcher |
| GET | `/profile` | session restore |
| GET/POST | `/categories` | `sort` param (`name`, `created_at`, `updated_at`) |
| GET/PATCH/DELETE | `/categories/:id` | default "Sem categoria" cannot be deleted |
| GET/POST | `/expenses` | paginated (50/page, max 100), `today`/`week`/`month`/`year` filters, `sort` |
| GET/PATCH/DELETE | `/expenses/:id` | |
| POST | `/expenses/import_csv` | multipart `file`, dedup by `import_hash` |
| GET/POST | `/incomings` | paginated, same period filters and `sort` |
| GET/PATCH/DELETE | `/incomings/:id` | |
| GET | `/dashboard` | `filter=today\|week\|month\|year`; totals by category and by date |

List responses use an envelope: `{ data: [...], meta: { page, per_page, total, total_pages } }`.
Ownership is always scoped to the token owner; another user's record returns 404.

## Web routes

| Route | Page |
|---|---|
| `/signin`, `/signup` | auth |
| `/dashboard` | period filter + charts (by category, by date) |
| `/expenses`, `/expenses/new`, `/expenses/:id/edit` | CRUD |
| `/expenses/import` | CSV upload + result summary |
| `/incomings`, `/incomings/new`, `/incomings/:id/edit` | CRUD |
| `/categories`, `/categories/new`, `/categories/:id/edit` | CRUD |

Pages under `web/app/(app)/` share an auth gate and nav. Data access goes through
`domain/` → `usecases/` → `infrastructure/`; components do not call `fetch` directly.

## Conventions

- Branch: `feat/<thing>` from `main`
- Commits: Conventional Commits, PT-BR imperative, title ≤72 bytes
- Stage explicitly (`git add -- <paths>`); never `git add -A`/`.`/`-a`
- Never stage `.env*` (except `.env.example`/`.env.production.example`), `*.key`, `master.key`, secrets
- Migrations: ask before running `db:migrate`; Rails owns all migrations
- Prisma: run `prisma db pull` after Rails migrations, never hand-edit schema. Requires `DATABASE_URL`
  in the environment (set for the `web` service in dev compose). `prisma.config.ts` falls back to an
  empty URL so `prisma generate` works without a database
- Run both test suites before pushing; CI runs them on every PR

## Domain

- **User:** Devise + JWT, has many categories/expenses/incomings
- **Category:** user-owned, default "Sem categoria" on signup (plus 11 seeded categories)
- **Expense:** user-owned, belongs to category, `price_cents`, `date`, `import_hash` (partial unique index per user)
- **Incoming:** user-owned, `amount_cents`, `date`, `origin`

## Current status

- ✅ Rails API with Devise + JWT auth, profile endpoint, dashboard endpoint
- ✅ CRUD endpoints for categories, expenses, incomings (ownership scoped, 404 across users)
- ✅ Pagination (50/page, `meta` envelope) with `(user_id, date)` indexes
- ✅ CSV import endpoint (dedup, skip rules) and web import page
- ✅ Next.js web app: auth gate/nav, CRUD pages, period filters, dashboard charts
- ✅ Password policy on signup (API + web form)
- ✅ Tests: 69 API tests / 172 assertions, 60 web tests across 15 files; `tsc`, `eslint`, `next build` clean
- ✅ Prisma 7 schema introspected from the Rails DB, `npm audit` clean (CI gates on high advisories)
- ✅ CI/CD: tests on PR, deploy on push to `main`
- ✅ Production images (`Dockerfile.prod`), `docker-compose.prod.yml`, Nginx config

## Next steps

1. Backups for the Postgres volume (`daily_expenses_postgres_data`)
2. Strip dev dependencies from the production web image (~160 MB of Prisma packages)
3. Password reset flow (must enforce the password policy)
4. JWT refresh and the `node_modules` ownership fix in the dev Dockerfile
5. More API tests around CSV import edge cases

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

# Web checks (same as CI)
docker compose exec web npx tsc --noEmit
docker compose exec web npm run lint
docker compose exec web npm run build

# Prisma introspection (writes web/prisma/schema.prisma)
docker compose exec web npm run db:pull
docker compose exec web npm run db:generate

# Production stack (local smoke test; use a separate project name)
NEXT_PUBLIC_API_URL=https://api.expenses.krotedev.com.br \
  docker compose -p dexp_prodcheck -f docker-compose.prod.yml build
```

## Test data

The development database currently contains a test user created during verification:

- **Email:** `test@example.com`
- **Password:** `password123`

You can log in with this user at http://localhost:5001/signin, or reset the DB with
`rails db:drop db:create db:migrate` and start fresh. The policy applies to new passwords only,
so this existing account still signs in.

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

- Web: `https://expenses.krotedev.com.br`
- API: `https://api.expenses.krotedev.com.br`
- Server path: `/var/www/projects/daily-expenses`
- Nginx: `nginx/daily-expenses.conf`, proxying to `127.0.0.1:${WEB_PORT}` and `127.0.0.1:${API_PORT}`; SSL via Let's Encrypt

### Pipeline (`.github/workflows/ci-cd.yml`)

1. **`api-test`** — Postgres 17 service container, `bin/rails db:prepare` + `bin/rails test`.
   Needs the `RAILS_MASTER_KEY` secret to decrypt credentials.
2. **`web-test`** — `npm ci --legacy-peer-deps`, `npm audit --audit-level=high`, `vitest`,
   `tsc --noEmit`, `eslint`, `next build`.
3. **`deploy`** — only on push to `main`, after both jobs pass; serialized by a `concurrency` group.
   Over SSH it runs `git fetch` + `git reset --hard origin/main`, builds with
   `docker compose -f docker-compose.prod.yml build`, runs `db:prepare`, brings the stack up,
   prunes old images, then smoke-tests both public URLs.

### GitHub secrets

`DROPLET_HOST`, `DROPLET_USER`, `DROPLET_SSH_KEY` (dedicated deploy key), `RAILS_MASTER_KEY`.

### Server setup (one time)

- Docker installed; repo cloned with a read-only deploy key
- `.env` created from `.env.production.example` with the real database password and
  `RAILS_MASTER_KEY` (contents of `api/config/master.key`)
- Add `COMPOSE_FILE=docker-compose.prod.yml` to the server `.env` so plain `docker compose`
  commands use the production file instead of the dev one (both define the same container names)
- Nginx site enabled

### Notes

- `RAILS_MASTER_KEY` decrypts `api/config/credentials.yml.enc` (Devise JWT secret). Never commit it;
  `api/.dockerignore` keeps `config/master.key` out of the image
- `NEXT_PUBLIC_API_URL` is inlined at build time, so it is passed as a build arg from `.env`
- `ALLOWED_HOSTS` and `CORS_ORIGINS` control Rails host authorization and CORS
- Rails owns migrations; the deploy runs `db:prepare` on every release
