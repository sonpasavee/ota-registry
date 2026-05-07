# OTA Registry Backend

โปรเจคนี้คือ Backend API สำหรับจัดการ OTA model registry โดยใช้ `Node.js`, `Express`, `Prisma` และ `Supabase`

ความสามารถหลักของระบบ:

- login แอดมิน
- อัปโหลดโมเดลใหม่
- ดึงโมเดลเวอร์ชันล่าสุด
- เก็บข้อมูลโมเดลลงฐานข้อมูล
- คำนวณ `SHA-256` ของไฟล์โมเดล
- มี Swagger สำหรับดูและทดลองยิง API

## สารบัญ

- ภาพรวมระบบ
- เทคโนโลยีที่ใช้
- โครงสร้างโปรเจค
- วิธี setup แบบละเอียด
- วิธีตั้งค่า Supabase
- วิธีตั้งค่าไฟล์ `.env`
- วิธี migrate ฐานข้อมูล
- วิธีสร้าง Admin สำหรับใช้งาน
- วิธีรันโปรเจค
- วิธีใช้งาน Swagger
- วิธีใช้งาน API
- วิธีทดสอบด้วย Postman
- คำสั่งที่ใช้บ่อย
- ปัญหาที่เจอบ่อย

## ภาพรวมระบบ

API หลักในโปรเจคนี้:

- `POST /api/auth/login`
- `GET /api/models/latest`
- `POST /api/models/upload`
- `GET /health`
- `GET /health/db`

ไฟล์โมเดลที่อัปโหลดจะถูกเปิดผ่าน URL รูปแบบนี้:

- `/uploads/<fileName>`

## เทคโนโลยีที่ใช้

- Node.js
- Express
- Prisma 7
- Supabase Postgres
- JWT
- Multer
- Swagger UI

## โครงสร้างโปรเจค

```text
backend/
|- prisma/                  # schema และ migration ของ Prisma
|- scripts/                 # helper scripts
|- src/
|  |- controllers/          # controller ของแต่ละ endpoint
|  |- docs/                 # swagger / openapi spec
|  |- lib/                  # prisma setup
|  |- middlewares/          # middleware เช่น auth
|  |- routes/               # route ของระบบ
|  |- services/             # business logic
|  |- utils/                # helper functions
|- uploads/                 # เก็บไฟล์ที่ถูก upload
|- .env.example
|- .env.docker.example
|- Dockerfile
|- docker-compose.yml
```

## วิธี setup แบบละเอียด

### 1. clone โปรเจค

```bash
git clone <repo-url>
cd ota-registry/backend
```

### 2. ติดตั้ง dependencies

```bash
npm install
```

### 3. สร้างไฟล์ environment

คัดลอกจากไฟล์ตัวอย่าง:

```bash
cp .env.example .env
cp .env.docker.example .env.docker
```

ถ้าอยู่บน Windows และ `cp` ใช้ไม่ได้ จะสร้างไฟล์ด้วยวิธีอื่นก็ได้ ขอแค่ให้มี `.env` และ `.env.docker` ที่มีค่าถูกต้อง

### 4. ตั้งค่า Supabase

ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)

สิ่งที่ต้องมี:

- โปรเจค Supabase 1 โปรเจค
- database password
- project reference
- region

จากนั้นนำค่ามาใส่ใน `.env`

## วิธีตั้งค่า Supabase

โปรเจคนี้ใช้ connection string 2 ตัว:

- `DATABASE_URL`
- `DIRECT_URL`

แนวคิด:

- `DATABASE_URL` ใช้ตอนแอปรันจริง
- `DIRECT_URL` ใช้กับ Prisma CLI เช่น generate, migrate

ตัวอย่างรูปแบบ:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
```

## วิธีตั้งค่าไฟล์ `.env`

ตัวอย่าง `.env`

```env
PORT=3000
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES="7d"
```

คำอธิบาย:

- `PORT` คือพอร์ตของ API
- `DATABASE_URL` ใช้ตอน runtime ของแอป
- `DIRECT_URL` ใช้ตอนรันคำสั่ง Prisma
- `JWT_SECRET` ใช้สำหรับสร้าง token
- `JWT_EXPIRES` คืออายุ token

## วิธี migrate ฐานข้อมูล

หลังตั้งค่า `.env` แล้ว ให้รันตามลำดับนี้:

### สร้าง Prisma Client

```bash
npm run prisma:generate
```

### ตรวจสถานะ migration

```bash
npm run prisma:status
```

### apply migrations

```bash
npm run prisma:migrate:deploy
```

ถ้าสำเร็จ ตารางสำคัญจะถูกสร้าง เช่น:

- `Admin`
- `ModelRegistry`
- `_prisma_migrations`

## วิธีสร้าง Admin สำหรับใช้งาน

โปรเจคนี้กำหนดให้คนที่ clone ไปใช้ **ใช้แอดมินชุดเดียวกันสำหรับทดสอบ**

### Admin สำหรับใช้งาน

- username: `testuser`
- password: `password123`

โปรเจคนี้ตั้งใจให้ใช้ชุดนี้เป็นหลักในการทดสอบ ถ้าเพื่อน clone โปรเจคไป ให้ใช้ username/password นี้เท่านั้น

### สำคัญ

ในฐานข้อมูลห้ามเก็บ `password123` แบบ plain text

ต้องแปลงเป็น `bcrypt hash` ก่อน แล้วค่อยบันทึกลงตาราง `Admin`

### วิธีสร้าง hash

รันคำสั่งนี้:

```bash
npm run admin:hash -- password123
```

ระบบจะคืนค่า hash ออกมา เช่น:

```text
$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### วิธีเพิ่ม Admin ลงใน Supabase

เปิด SQL Editor ของ Supabase แล้วรัน:

```sql
delete from "Admin";

insert into "Admin" ("username", "password")
values (
  'testuser',
  '$2b$10$PASTE_HASH_HERE'
);
```

คำสั่งข้างบนลบ admin เก่าออกก่อน แล้วสร้างใหม่ให้เหลือแค่ `testuser`

ถ้าคุณต้องการให้ทุกคนในทีมใช้ credential เดียวกัน แนะนำให้ใช้วิธีนี้

## วิธีรันโปรเจค

### รันแบบ local

โหมดพัฒนา:

```bash
npm run dev
```

โหมดปกติ:

```bash
npm run start
```

เมื่อรันสำเร็จ:

- API Base URL: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- Swagger JSON: `http://localhost:3000/docs.json`

### รันด้วย Docker

ถ้าต้องการรันด้วย Docker:

```bash
docker compose up --build
```

เมื่อรันสำเร็จ:

- API Base URL: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/docs`
- Swagger JSON: `http://localhost:3001/docs.json`

## วิธีใช้งาน Swagger

Swagger ใช้สำหรับ:

- ดูรายการ endpoint ทั้งหมด
- ดู request/response example
- ทดลองยิง API จากหน้าเว็บได้ทันที

### URL

ตอนรัน local:

- `http://localhost:3000/docs`

ตอนรัน Docker:

- `http://localhost:3001/docs`

### วิธีใช้ Swagger

1. รันโปรเจคให้สำเร็จก่อน
2. เปิดเบราว์เซอร์ไปที่ `/docs`
3. จะเห็นรายการ endpoint ทั้งหมด
4. กด endpoint ที่ต้องการ
5. กด `Try it out`
6. กรอกข้อมูลที่ต้องใช้
7. กด `Execute`

### วิธีใช้ Swagger กับ endpoint ที่ต้อง login

สำหรับ `POST /api/models/upload`

ให้ทำตามนี้:

1. ใช้ `POST /api/auth/login` เพื่อเอา token ก่อน
2. คัดลอก token ที่ได้
3. ใน Swagger กดปุ่ม `Authorize`
4. ใส่ค่าแบบนี้:

```text
Bearer YOUR_JWT_TOKEN
```

5. กด `Authorize`
6. จากนั้นค่อยทดลอง `POST /api/models/upload`

## วิธีใช้งาน API

Base URL ตอน local:

- `http://localhost:3000`

### 1. Health Check

#### `GET /health`

ใช้ตรวจว่า API ทำงานอยู่หรือไม่

ตัวอย่าง response:

```json
{
  "status": "ok"
}
```

#### `GET /health/db`

ใช้ตรวจว่า API เชื่อมต่อฐานข้อมูลได้หรือไม่

ตัวอย่าง response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. Login

#### `POST /api/auth/login`

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "username": "testuser",
  "password": "password123"
}
```

Response:

```json
{
  "token": "YOUR_JWT_TOKEN"
}
```

### 3. ดึงโมเดลล่าสุด

#### `GET /api/models/latest`

Response เมื่อมีข้อมูล:

```json
{
  "id": 1,
  "version": "1.0.0",
  "fileName": "1710000000000-model.tflite",
  "fileUrl": "/uploads/1710000000000-model.tflite",
  "sha256": "f6d8d4c8f2f7e6f0e7f7f4f4b6b8c6f6f6a6a9c4f3a2a1e8b5d6c7a8b9c0d1e2",
  "releaseNote": "Initial OTA model release",
  "createdAt": "2026-05-07T06:08:04.312Z"
}
```

ถ้ายังไม่มีโมเดล:

```json
{
  "message": "No model has been uploaded yet"
}
```

### 4. อัปโหลดโมเดล

#### `POST /api/models/upload`

Headers:

- `Authorization: Bearer <JWT_TOKEN>`

Body:

- `form-data`

Fields:

- `model` = file
- `version` = text
- `releaseNote` = text (optional)

ตัวอย่าง:

- `model`: เลือกไฟล์โมเดล
- `version`: `1.0.0`
- `releaseNote`: `Initial OTA model release`

Response เมื่อสำเร็จ:

```json
{
  "id": 1,
  "version": "1.0.0",
  "fileName": "1710000000000-model.tflite",
  "fileUrl": "/uploads/1710000000000-model.tflite",
  "sha256": "f6d8d4c8f2f7e6f0e7f7f4f4b6b8c6f6f6a6a9c4f3a2a1e8b5d6c7a8b9c0d1e2",
  "releaseNote": "Initial OTA model release",
  "createdAt": "2026-05-07T06:08:04.312Z"
}
```

## วิธีทดสอบด้วย Postman

ลำดับที่แนะนำ:

1. `GET /health`
2. `GET /health/db`
3. `POST /api/auth/login`
4. คัดลอก token
5. `POST /api/models/upload`
6. `GET /api/models/latest`

### ตัวอย่าง login ผ่าน Postman

Method:

- `POST`

URL:

- `http://localhost:3000/api/auth/login`

Body:

- `raw`
- `JSON`

```json
{
  "username": "testuser",
  "password": "password123"
}
```

### ตัวอย่าง upload ผ่าน Postman

Method:

- `POST`

URL:

- `http://localhost:3000/api/models/upload`

Headers:

- `Authorization: Bearer <JWT_TOKEN>`

Body:

- `form-data`

Fields:

- `model` = file
- `version` = text
- `releaseNote` = text

## คำสั่งที่ใช้บ่อย

ติดตั้ง dependencies:

```bash
npm install
```

รันโหมด dev:

```bash
npm run dev
```

รันแอป:

```bash
npm run start
```

สร้าง hash ของ admin password:

```bash
npm run admin:hash -- password123
```

สร้าง Prisma client:

```bash
npm run prisma:generate
```

เช็ก migration status:

```bash
npm run prisma:status
```

apply migrations:

```bash
npm run prisma:migrate:deploy
```

เปิด Prisma Studio:

```bash
npm run prisma:studio
```

รัน Docker:

```bash
docker compose up --build
```

## ปัญหาที่เจอบ่อย

### Login แล้วได้ `401 Invalid password`

สาเหตุ:

- password ในฐานข้อมูลเป็น plain text

วิธีแก้:

- รัน `npm run admin:hash -- password123`
- เอาค่า hash ที่ได้ไปบันทึกในตาราง `Admin`

### `GET /api/models/latest` ได้ `404`

สาเหตุ:

- ยังไม่มีการอัปโหลดโมเดล

วิธีแก้:

- login
- upload โมเดลก่อน

### `/health/db` ไม่ผ่าน

สาเหตุที่เป็นไปได้:

- `.env` ผิด
- Supabase URL ผิด
- migration ยังไม่ได้รัน

วิธีแก้:

- ตรวจค่าใน `.env`
- รัน `npm run prisma:generate`
- รัน `npm run prisma:migrate:deploy`

### Swagger เปิดไม่ได้

สาเหตุ:

- แอปยังไม่รัน
- เปิดผิดพอร์ต

วิธีแก้:

- ถ้า local ใช้ `http://localhost:3000/docs`
- ถ้า Docker ใช้ `http://localhost:3001/docs`

## สรุปสำหรับเพื่อนที่ clone โปรเจคนี้ไปใช้

ให้จำ 5 อย่างนี้:

1. ใช้ admin ชุดเดียวคือ `testuser / password123`
2. password ในฐานข้อมูลต้องเป็น bcrypt hash
3. ตั้งค่า `.env` ให้ถูกก่อน
4. รัน `npm install`
5. รัน `npm run prisma:generate` และ `npm run prisma:migrate:deploy` ก่อน `npm run dev`
