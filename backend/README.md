# Backend Setup

This backend is now set up to use Supabase Postgres for both local development and Docker.

## Environment files

Create these files before running the app:

- `.env` for local development
- `.env.docker` for Docker

You can copy the examples:

```powershell
Copy-Item .env.example .env
Copy-Item .env.docker.example .env.docker
```

Then replace these placeholders with your Supabase values:

- `[YOUR_PROJECT_REF]`
- `[YOUR_DB_PASSWORD]`
- `[YOUR_REGION]`

## Why there are two database URLs

- `DATABASE_URL` is used by the running app through Prisma's `@prisma/adapter-pg`.
- `DIRECT_URL` is used by Prisma CLI commands such as generate, migrate, and studio.
- For this project, `DIRECT_URL` should include `sslmode=require`.
- `DATABASE_URL` uses `sslmode=no-verify` here because Prisma 7 runtime validates SSL certificates more strictly and Supabase pooler connections can otherwise fail on some machines.

This split is recommended for Prisma with Supabase.

## Run locally

```powershell
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate:deploy
npm.cmd run dev
```

## Run with Docker

```powershell
docker compose up --build
```

The container reads environment variables from `.env.docker`.

## Health endpoints

- `GET /health` checks whether the API process is alive.
- `GET /health/db` checks whether Prisma can reach Supabase.
