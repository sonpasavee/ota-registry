# OTA Registry Backend

Backend สำหรับจัดการระบบ OTA model registry โดยใช้ `Express`, `Prisma` และ `Supabase Postgres`

โปรเจคนี้มีความสามารถหลักดังนี้:

- login แอดมินด้วย JWT
- อัปโหลดโมเดลใหม่ผ่าน API
- ดึงโมเดลเวอร์ชันล่าสุด
- เก็บ checksum แบบ `SHA-256` ของไฟล์ที่อัปโหลด
- มี Swagger สำหรับดูและทดสอบ API

## สารบัญ

- ภาพรวมโปรเจค
- เทคโนโลยีที่ใช้
- โครงสร้างโปรเจค
- การเตรียมความพร้อมก่อนเริ่ม
- วิธีตั้งค่า Supabase
- วิธีตั้งค่าไฟล์ `.env`
- วิธีติดตั้งและรันโปรเจค
- วิธีสร้างแอดมิน
- วิธีใช้งาน API
- วิธีใช้งาน Swagger
- วิธีทดสอบผ่าน Postman
- คำแนะนำเรื่องการวางข้อมูลสำคัญใน README
- คำสั่งที่ใช้บ่อย
- ปัญหาที่เจอบ่อย

## ภาพรวมโปรเจค

API หลักของระบบนี้คือ:

- `POST /api/auth/login`
- `GET /api/models/latest`
- `POST /api/models/upload`
- `GET /health`
- `GET /health/db`

ไฟล์ที่อัปโหลดจะถูกเสิร์ฟผ่าน:

- `GET /uploads/<fileName>`

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
|- prisma/                  # schema และ migrations ของ Prisma
|- scripts/                 # helper scripts เช่น hash password
|- src/
|  |- controllers/          # controller ของแต่ละ endpoint
|  |- docs/                 # OpenAPI / Swagger spec
|  |- lib/                  # prisma client setup
|  |- middlewares/          # auth middleware
|  |- routes/               # route definitions
|  |- services/             # business logic และ db access
|  |- utils/                # helper functions
|- uploads/                 # ไฟล์โมเดลที่อัปโหลด
|- .env.example
|- .env.docker.example
|- docker-compose.yml
|- Dockerfile
```

## การเตรียมความพร้อมก่อนเริ่ม

สิ่งที่ควรมีในเครื่อง:

- Node.js เวอร์ชัน 22 ขึ้นไป
- npm
- โปรเจค Supabase ที่สร้างไว้แล้ว
- Docker Desktop ถ้าต้องการรันผ่าน Docker

## วิธีตั้งค่า Supabase

### 1. สร้างโปรเจคใน Supabase

ไปที่ [Supabase Dashboard](https://supabase.com/dashboard) แล้วสร้างโปรเจคใหม่

สิ่งที่ต้องเตรียมจาก Supabase:

- Project Reference
- Database Password
- Region
- Connection String สำหรับ pooler

### 2. เตรียม connection string

โปรเจคนี้ใช้ตัวแปร 2 ตัว:

- `DATABASE_URL` สำหรับ runtime ของแอป
- `DIRECT_URL` สำหรับ Prisma CLI เช่น generate, migrate, studio

แนวคิดคือ:

- `DATABASE_URL` ใช้ pooler และตั้ง `sslmode=no-verify`
- `DIRECT_URL` ใช้ connection สำหรับ Prisma CLI และตั้ง `sslmode=require`

ตัวอย่างรูปแบบ:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
```

## วิธีตั้งค่าไฟล์ `.env`

ให้คัดลอกจากไฟล์ตัวอย่าง:

```bash
cp .env.example .env
cp .env.docker.example .env.docker
```

ถ้าใช้ PowerShell ก็ทำได้เหมือนกัน แต่ใน README นี้จะใช้ `npm` ตามที่คุณต้องการ

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
- `DATABASE_URL` ใช้ตอนแอปรันจริง
- `DIRECT_URL` ใช้กับ Prisma CLI
- `JWT_SECRET` ใช้ sign token
- `JWT_EXPIRES` คืออายุของ token

## วิธีติดตั้งและรันโปรเจค

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. สร้าง Prisma Client

```bash
npm run prisma:generate
```

### 3. ตรวจสอบสถานะ migration

```bash
npm run prisma:status
```

### 4. apply migrations

```bash
npm run prisma:migrate:deploy
```

### 5. รันโปรเจค

โหมดพัฒนา:

```bash
npm run dev
```

โหมดปกติ:

```bash
npm run start
```

เมื่อรันสำเร็จ API จะอยู่ที่:

- `http://localhost:3000`

## วิธีรันผ่าน Docker

ตรวจสอบก่อนว่าไฟล์ `.env.docker` ถูกตั้งค่าแล้ว

จากนั้นรัน:

```bash
docker compose up --build
```

เมื่อรันผ่าน Docker แล้ว API จะอยู่ที่:

- `http://localhost:3001`

## วิธีสร้างแอดมิน

โปรเจคนี้ **ไม่เก็บ password แบบ plain text**

ในตาราง `Admin.password` ต้องเป็น `bcrypt hash` เท่านั้น

### ตัวอย่างข้อมูลแอดมินสำหรับ development

แนะนำให้ใช้ตัวอย่างนี้ในทีมตอน dev:

- username: `testuser`
- password: `password123`

### 1. สร้าง hash ของ password

```bash
npm run admin:hash -- password123
```

คำสั่งนี้จะคืนค่า bcrypt hash ออกมา

### 2. เพิ่มแอดมินลงใน Supabase

เปิด SQL Editor ใน Supabase แล้วรัน:

```sql
insert into "Admin" ("username", "password")
values (
  'testuser',
  '$2b$10$PASTE_HASH_HERE'
);
```

ถ้ามี user อยู่แล้ว ใช้:

```sql
update "Admin"
set password = '$2b$10$PASTE_HASH_HERE'
where username = 'testuser';
```

### สำคัญ

- ห้ามใส่ `password123` ตรง ๆ ลงในฐานข้อมูล
- ถ้าใส่ plain text จะ login ไม่ผ่านและจะได้ `401 Invalid password`

## วิธีใช้งาน API

Base URL ตอนรัน local:

- `http://localhost:3000`

### 1. Health check

#### `GET /health`

ใช้เช็กว่า API ยังรันอยู่ไหม

ตัวอย่าง response:

```json
{
  "status": "ok"
}
```

#### `GET /health/db`

ใช้เช็กว่า API คุยกับฐานข้อมูลได้ไหม

ตัวอย่าง response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. Login แอดมิน

#### `POST /api/auth/login`

Headers:

- `Content-Type: application/json`

Request body:

```json
{
  "username": "testuser",
  "password": "password123"
}
```

Response เมื่อสำเร็จ:

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
  "fileName": "1710000000000-my-model.tflite",
  "fileUrl": "/uploads/1710000000000-my-model.tflite",
  "sha256": "f6d8d4c8f2f7e6f0e7f7f4f4b6b8c6f6f6a6a9c4f3a2a1e8b5d6c7a8b9c0d1e2",
  "releaseNote": "Initial OTA model release",
  "createdAt": "2026-05-07T06:08:04.312Z"
}
```

ถ้ายังไม่มีข้อมูล:

```json
{
  "message": "No model has been uploaded yet"
}
```

### 4. อัปโหลดโมเดลใหม่

#### `POST /api/models/upload`

Headers:

- `Authorization: Bearer <JWT_TOKEN>`

Body:

- type: `form-data`

Fields:

- `model` = ไฟล์โมเดล
- `version` = เวอร์ชัน เช่น `1.0.0`
- `releaseNote` = ข้อความอธิบายเพิ่มเติม (optional)

Response เมื่อสำเร็จ:

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

## วิธีใช้งาน Swagger

โปรเจคนี้มี Swagger UI ให้แล้ว

### URL

ตอนรัน local:

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs.json`

ตอนรัน Docker:

- Swagger UI: `http://localhost:3001/docs`
- OpenAPI JSON: `http://localhost:3001/docs.json`

### วิธีใช้

1. รันโปรเจคก่อน
2. เปิดเบราว์เซอร์ไปที่ `/docs`
3. เลือก endpoint ที่ต้องการ
4. กด `Try it out`
5. กรอกค่าที่ต้องใช้
6. กด `Execute`

### การใช้ Swagger กับ endpoint ที่ต้องล็อกอิน

สำหรับ `POST /api/models/upload`

ให้ทำตามนี้:

1. เรียก `POST /api/auth/login` ก่อน
2. คัดลอก token ที่ได้
3. ใน Swagger กดปุ่ม `Authorize`
4. ใส่ค่า:

```text
Bearer YOUR_JWT_TOKEN
```

5. กด Authorize
6. จากนั้นจึงลองยิง `POST /api/models/upload`

## วิธีทดสอบผ่าน Postman

ลำดับที่แนะนำ:

1. `GET /health`
2. `GET /health/db`
3. `POST /api/auth/login`
4. คัดลอก token
5. `POST /api/models/upload`
6. `GET /api/models/latest`
7. เปิดไฟล์จาก `fileUrl`

### ตัวอย่าง Postman สำหรับ login

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

### ตัวอย่าง Postman สำหรับ upload

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

## คำแนะนำเรื่องการวางข้อมูลสำคัญใน README

คำถามสำคัญคือควรแปะ `admin username/password` และ `database supabase link` ไว้ตรงไหน

### 1. Admin username/password ควรแปะตรงไหน

ถ้าเป็น **บัญชี dev สำหรับทีมภายใน**:

- แปะไว้ในหัวข้อ `วิธีสร้างแอดมิน`
- หรือทำหัวข้อแยกชื่อ `Development Credentials`

เหมาะสำหรับ:

- username ตัวอย่าง
- password ตัวอย่าง
- วิธีสร้าง hash

แต่ถ้า repo นี้มีโอกาส public:

- ไม่ควรใส่ password จริงใน README
- ควรใส่แค่:
  - username ตัวอย่าง
  - password ตัวอย่างสำหรับ local/dev เท่านั้น
  - หรือใส่ข้อความว่าให้ดูใน password manager / team vault

### 2. Supabase link ควรแปะตรงไหน

ควรแยกเป็น 2 แบบ:

- ลิงก์ Dashboard ของโปรเจค
- ลิงก์ API/Database connection

สิ่งที่ควรใส่ใน README:

- ลิงก์ Dashboard ของ Supabase สำหรับทีม
- ชื่อโปรเจค
- region
- คำอธิบายว่าค่า connection string อยู่ใน `.env`

ตัวอย่างหัวข้อที่แนะนำ:

```text
## Team Resources
- Supabase Dashboard: https://supabase.com/dashboard/project/your-project-ref
- API Docs: http://localhost:3000/docs
```

สิ่งที่ **ไม่ควร** ใส่ใน README:

- `DATABASE_URL` จริงที่มี password
- `DIRECT_URL` จริงที่มี password
- `JWT_SECRET` จริง

### สรุปแบบใช้งานง่าย

ถ้าคุณอยากให้เพื่อนเห็นง่ายที่สุด แนะนำให้มีหัวข้อท้าย README แบบนี้:

```text
## Team Resources
- Supabase Dashboard: <ลิงก์ dashboard>
- Swagger Docs: http://localhost:3000/docs
- Dev Admin Username: testuser
- Dev Admin Password: password123 (ใช้เฉพาะ local/dev)
```

แบบนี้อ่านง่ายและหาเจอง่าย แต่ต้องใช้เฉพาะกรณีที่เป็น dev credential เท่านั้น

## คำสั่งที่ใช้บ่อย

ติดตั้ง dependencies:

```bash
npm install
```

รันโหมดพัฒนา:

```bash
npm run dev
```

รันแอป:

```bash
npm run start
```

สร้าง bcrypt hash:

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

### Login ได้ `401 Invalid password`

สาเหตุ:

- password ในตาราง `Admin` เป็น plain text

วิธีแก้:

- สร้าง bcrypt hash ก่อน
- update ค่าใน Supabase ใหม่

### `GET /api/models/latest` ได้ `404`

สาเหตุ:

- ยังไม่มีโมเดลถูกอัปโหลด

วิธีแก้:

- login
- upload model ก่อน

### `/health/db` ไม่ผ่าน

สาเหตุที่เป็นไปได้:

- `.env` ผิด
- Supabase URL ผิด
- Prisma migrate ยังไม่ได้รัน

วิธีแก้:

- ตรวจ `.env`
- รัน `npm run prisma:generate`
- รัน `npm run prisma:migrate:deploy`

## ข้อเสนอแนะเพิ่มเติม

ถ้าต้องใช้ README นี้ในทีมจริง แนะนำให้เพิ่มหัวข้อท้ายสุดอีกหัวข้อชื่อ `Team Resources` แล้วใส่:

- Supabase Dashboard link
- Swagger URL
- Postman collection link
- Dev credential สำหรับ local/dev เท่านั้น

ตัวอย่าง:

```text
## Team Resources
- Supabase Dashboard: https://supabase.com/dashboard/project/your-project-ref
- Swagger Docs: http://localhost:3000/docs
- Postman Collection: <ลิงก์ถ้ามี>
- Dev Admin Username: testuser
- Dev Admin Password: password123
```
