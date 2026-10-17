# Daily Expenses

Rebuild moderno do app Daily Expenses.

## Stack

- **API:** Ruby on Rails 8.1 (API-only), PostgreSQL, Devise + JWT
- **Web:** Next.js 16, TypeScript, Tailwind CSS
- **DB:** PostgreSQL 17
- **Dev:** Docker Compose

## Primeiros passos

Copie e ajuste o ambiente:

```bash
cp .env.example .env
# Edite .env com suas credenciais e portas desejadas
```

Suba os containers:

```bash
docker compose up -d --build
docker compose exec api bundle exec rails db:prepare
```

Acesse:

- Web: http://localhost:5001
- API: http://localhost:5000
- Health check: http://localhost:5000/up

## Testes

API:

```bash
docker compose exec api bundle exec rails test
```

Web:

```bash
docker compose exec web npm run test:run
```

## Prisma

O schema do Prisma é gerado por introspecção do banco gerenciado pelo Rails:

```bash
docker compose exec web npm run db:pull
```

## Deploy

Veja `nginx/daily-expenses.conf` para um exemplo de configuração de reverse proxy
com Nginx para `expenses.krotedev.com.br` e `api.expenses.krotedev.com.br`.

## Estrutura

- `api/` — Rails 8.1 API-only (auth, CRUD, importação CSV)
- `web/` — Next.js 16 frontend
- `nginx/` — configuração de exemplo para deploy

Old Session
opencode -s ses_eb9d2fd47ffezB21OexBQ3GHNM