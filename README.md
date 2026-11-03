# Daily Expenses

App de finanças pessoais com arquitetura separada: API em Rails e frontend em Next.js.

## Stack

- **API:** Ruby on Rails 8.1 (API-only), PostgreSQL 17, Devise + JWT (`devise-jwt`)
- **Web:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Recharts 3
- **DB:** PostgreSQL 17
- **Dev:** Docker Compose
- **Deploy:** GitHub Actions → droplet DigitalOcean com Nginx

## Primeiros passos

Copie e ajuste o ambiente:

```bash
cp .env.example .env
# Edite .env com suas credenciais e portas desejadas
```

Suba os containers e prepare o banco:

```bash
docker compose up -d --build
docker compose exec api bundle exec rails db:prepare
```

Acesse:

- Web: http://localhost:5001
- API: http://localhost:5000
- Health check: http://localhost:5000/up

Usuário de teste no banco de desenvolvimento: `test@example.com` / `password123`.

## Funcionalidades

- Cadastro e login com JWT (token de 30 minutos), sessão restaurada ao recarregar
- Senha forte no cadastro: mínimo 6 caracteres, com letra, número e caractere especial
- CRUD de categorias, despesas e entradas, com paginação de 50 itens por página
- Filtros de período (hoje, semana, mês, ano) nas listas
- Dashboard com gráficos por categoria e por data
- Importação de despesas por CSV, com deduplicação e resumo do resultado

## Estrutura

- `api/` — Rails 8.1 API-only (auth, CRUD, dashboard, importação CSV)
- `web/` — Next.js 16 (`domain/` → `usecases/` → `infrastructure/`)
- `nginx/` — configuração de reverse proxy para o deploy
- `.github/workflows/ci-cd.yml` — testes e deploy
- `docker-compose.yml` — ambiente de desenvolvimento
- `docker-compose.prod.yml` — ambiente de produção

## Testes

API:

```bash
docker compose exec api bundle exec rails test
```

Web:

```bash
docker compose exec web npm run test:run
docker compose exec web npx tsc --noEmit
docker compose exec web npm run lint
```

## Prisma

O schema do Prisma é gerado por introspecção do banco gerenciado pelo Rails e serve apenas para
tipagem. A URL de conexão fica em `web/prisma.config.ts`, que lê `DATABASE_URL` (já definida para o
serviço `web` no compose de desenvolvimento):

```bash
docker compose exec web npm run db:pull
docker compose exec web npm run db:generate
```

Não edite `web/prisma/schema.prisma` à mão: rode `db:pull` depois de cada migração do Rails.

## Deploy

O deploy é automático via GitHub Actions a cada push em `main`, depois que as suítes de teste
passam. O job faz SSH no droplet, atualiza o repositório em `/var/www/projects/daily-expenses`,
reconstrói as imagens de produção, roda `db:prepare`, sobe a stack e valida as URLs públicas.

- Web: https://expenses.krotedev.com.br
- API: https://api.expenses.krotedev.com.br

Segredos necessários no GitHub: `DROPLET_HOST`, `DROPLET_USER`, `DROPLET_SSH_KEY` e
`RAILS_MASTER_KEY`.

No servidor, crie o `.env` a partir de `.env.production.example` e preencha o `RAILS_MASTER_KEY`
(conteúdo de `api/config/master.key`). Recomendado adicionar também:

```
COMPOSE_FILE=docker-compose.prod.yml
```

Assim comandos `docker compose` executados no servidor usam o arquivo de produção, e não o de
desenvolvimento (os dois usam os mesmos nomes de container).

Comandos úteis no servidor:

```bash
cd /var/www/projects/daily-expenses
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm api bin/rails db:prepare
docker compose -f docker-compose.prod.yml up -d
```

O `nginx/daily-expenses.conf` traz o exemplo de reverse proxy com SSL para os dois domínios.

## Referência para agentes

Instruções detalhadas de arquitetura, convenções e estado atual ficam em `AGENTS.md`.
