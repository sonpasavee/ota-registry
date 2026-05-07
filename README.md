# OTA Registry Backend

Express + Prisma backend for admin authentication and OTA model registry management.

## Features

- Supabase Postgres integration via Prisma 7
- Admin login with JWT
- Upload OTA model files with versioning
- SHA-256 checksum generation for uploaded files
- OpenAPI / Swagger documentation
- Docker support

## Tech stack

- Node.js
- Express
- Prisma
- Supabase Postgres
- JWT
- Multer

## Project structure

```text
backend/
|- prisma/
|- scripts/
|- src/
|  |- controllers/
|  |- docs/
|  |- lib/
|  |- middlewares/
|  |- routes/
|  |- services/
|  |- utils/
|- uploads/
```

## Prerequisites

- Node.js 22 or newer
- npm
- A Supabase project
- Docker Desktop if you want to run the API in Docker

## Environment setup

Create local env files from the examples:

```powershell
Copy-Item .env.example .env
Copy-Item .env.docker.example .env.docker
```

Required variables:

- `PORT`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_EXPIRES`

Example:

```env
PORT=3000
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_DB_PASSWORD]@aws-0-[YOUR_REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_DB_PASSWORD]@aws-0-[YOUR_REGION].pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES="7d"
```

Notes:

- `DATABASE_URL` is used by the running API.
- `DIRECT_URL` is used by Prisma CLI commands.
- In this project, `DATABASE_URL` uses `sslmode=no-verify` because Prisma 7 runtime can fail TLS validation on some Supabase pooler connections.
- `DIRECT_URL` should keep `sslmode=require`.

## Install dependencies

```powershell
npm.cmd install
```

## Prisma setup

Generate Prisma client:

```powershell
npm.cmd run prisma:generate
```

Check migration status:

```powershell
npm.cmd run prisma:status
```

Apply migrations:

```powershell
npm.cmd run prisma:migrate:deploy
```

## Create admin user

This API expects the admin password in the database to be stored as a `bcrypt` hash, not plain text.

Recommended local development credentials:

- username: `testuser`
- password: `password123`

Generate a bcrypt hash:

```powershell
npm.cmd run admin:hash -- password123
```

Copy the output hash and insert it into Supabase SQL Editor:

```sql
insert into "Admin" ("username", "password")
values (
  'testuser',
  '$2b$10$PASTE_GENERATED_HASH_HERE'
);
```

If the user already exists:

```sql
update "Admin"
set password = '$2b$10$PASTE_GENERATED_HASH_HERE'
where username = 'testuser';
```

Important:

- Do not store plain text passwords in the `Admin` table.
- If you previously inserted `password123` directly, login will fail with `Invalid password`.

## Run locally

Development mode:

```powershell
npm.cmd run dev
```

Production-style start:

```powershell
npm.cmd run start
```

Server URLs:

- API base URL: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs.json`

## Run with Docker

Make sure `.env.docker` is configured first, then run:

```powershell
docker compose up --build
```

Docker URLs:

- API base URL: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/docs`
- OpenAPI JSON: `http://localhost:3001/docs.json`

## API endpoints

### Health

- `GET /health`
- `GET /health/db`

### Auth

- `POST /api/auth/login`

Request body:

```json
{
  "username": "testuser",
  "password": "password123"
}
```

Success response:

```json
{
  "token": "YOUR_JWT_TOKEN"
}
```

### Models

- `GET /api/models/latest`
- `POST /api/models/upload`

`POST /api/models/upload` requirements:

- Header: `Authorization: Bearer <JWT_TOKEN>`
- Body type: `form-data`
- File field name: `model`
- Text field name: `version`
- Optional text field name: `releaseNote`

Example upload fields:

- `model`: select a file
- `version`: `1.0.0`
- `releaseNote`: `Initial OTA model release`

Success response example:

```json
{
  "id": 1,
  "version": "1.0.0",
  "fileName": "1710000000000-my-model.tflite",
  "fileUrl": "/uploads/1710000000000-my-model.tflite",
  "sha256": "f6d8d4c8f2f7e6f0e7f7f4f4b6b8c6f6f6a6a9c4f3a2a1e8b5d6c7a8b9c0d1e2",
  "releaseNote": "Initial OTA model release",
  "createdAt": "2026-05-07T06:08:04.312Z"
}
```

## Postman test flow

1. `GET /health`
2. `GET /health/db`
3. `POST /api/auth/login`
4. Copy the returned JWT token
5. `POST /api/models/upload`
6. `GET /api/models/latest`
7. Open the uploaded file from `http://localhost:3000/uploads/<fileName>`

## Common issues

### Login returns `401 Invalid password`

Cause:

- The `Admin.password` value in Supabase is plain text instead of a bcrypt hash.

Fix:

- Generate a hash with `npm.cmd run admin:hash -- your-password`
- Update the `Admin` row with the generated hash

### Prisma commands connect but runtime DB check fails

Cause:

- Prisma 7 runtime can be stricter about TLS validation.

Fix:

- Keep `DATABASE_URL` with `sslmode=no-verify`
- Keep `DIRECT_URL` with `sslmode=require`

### `/api/models/latest` returns `404`

Cause:

- No model has been uploaded yet.

Fix:

- Login as admin and upload a model first

## Useful scripts

- `npm.cmd run dev`
- `npm.cmd run start`
- `npm.cmd run admin:hash -- password123`
- `npm.cmd run prisma:generate`
- `npm.cmd run prisma:status`
- `npm.cmd run prisma:migrate:deploy`
- `npm.cmd run prisma:studio`
- `npm.cmd run docker:up`
- `npm.cmd run docker:down`
