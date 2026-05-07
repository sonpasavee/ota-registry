# OTA Registry Backend

Backend สำหรับระบบ OTA Registry พัฒนาด้วย `Node.js`, `Express`, `Prisma` และ `Supabase Postgres`

โปรเจคนี้มีหน้าที่หลักดังนี้:

- login แอดมิน
- อัปโหลดโมเดลใหม่
- ดึงข้อมูลโมเดลล่าสุด
- เก็บไฟล์โมเดลและ checksum
- มี Swagger สำหรับดูและทดลองยิง API

## สิ่งสำคัญก่อนเริ่ม

คนที่ clone โปรเจคนี้ไปใช้ ให้ใช้ admin สำหรับทดสอบเพียงชุดเดียวคือ:

- username: `testuser`
- password: `password123`

โปรเจคนี้ไม่ได้ตั้งใจให้ทุกคนเข้า Supabase Dashboard ของเจ้าของโปรเจค  
ให้ใช้เฉพาะค่าการเชื่อมต่อฐานข้อมูลที่ถูกส่งให้สำหรับ environment ที่ใช้ร่วมกัน หรือใช้ฐานข้อมูลของตัวเองแทน

## สารบัญ

- ภาพรวมระบบ
- เทคโนโลยีที่ใช้
- โครงสร้างโปรเจค
- วิธี setup แบบละเอียด
- การตั้งค่า environment
- การตั้งค่าฐานข้อมูล
- การสร้าง admin user
- วิธีรันโปรเจค
- วิธีใช้งาน Swagger
- วิธีใช้งาน API
- วิธีทดสอบผ่าน Postman
- คำสั่งที่ใช้บ่อย
- ปัญหาที่เจอบ่อย

## ภาพรวมระบบ

API หลักในโปรเจคนี้มีดังนี้:

- `GET /health`
- `GET /health/db`
- `POST /api/auth/login`
- `GET /api/models/latest`
- `POST /api/models/upload`

เมื่ออัปโหลดไฟล์โมเดลแล้ว ไฟล์จะถูกเปิดได้ผ่าน path นี้:

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
|- .env.example
|- .env.docker.example
|- docker-compose.yml
|- Dockerfile
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

### 3. สร้างไฟล์ `.env`

คัดลอกจากไฟล์ตัวอย่าง:

```bash
cp .env.example .env
cp .env.docker.example .env.docker
```

ถ้าใช้ Windows และ `cp` ไม่ได้ ให้สร้างไฟล์ `.env` และ `.env.docker` ด้วยวิธีอื่นแทนได้

### 4. ใส่ค่าการเชื่อมต่อฐานข้อมูล

โปรเจคนี้ไม่ควรเขียน Supabase dashboard link หรือ secret จริงลง README  
คนที่ clone ไปควรได้รับค่าพวกนี้จากเจ้าของโปรเจคหรือใช้ database ของตัวเอง

ค่าที่ต้องใส่ใน `.env` มีดังนี้:

```env
PORT=3000
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[DB_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES="7d"
```

ความหมายของแต่ละตัว:

- `PORT` คือพอร์ตของ API
- `DATABASE_URL` ใช้ตอน runtime ของแอป
- `DIRECT_URL` ใช้กับ Prisma CLI
- `JWT_SECRET` ใช้สร้าง JWT token
- `JWT_EXPIRES` คืออายุของ token

## การตั้งค่าฐานข้อมูล

หลังจากตั้ง `.env` แล้ว ให้รันคำสั่งเหล่านี้ตามลำดับ

### 1. สร้าง Prisma Client

```bash
npm run prisma:generate
```

### 2. ตรวจ migration

```bash
npm run prisma:status
```

### 3. apply migration

```bash
npm run prisma:migrate:deploy
```

ถ้าสำเร็จ ตารางหลักจะถูกสร้าง เช่น:

- `Admin`
- `ModelRegistry`
- `_prisma_migrations`

## การสร้าง admin user

แม้ทุกคนจะใช้ username/password ชุดเดียวกันในการทดสอบ แต่ในฐานข้อมูลจะต้องเก็บ password เป็น `bcrypt hash` เท่านั้น

### ข้อมูลสำหรับทดสอบ

- username: `testuser`
- password: `password123`

### 1. สร้าง hash

```bash
npm run admin:hash -- password123
```

ระบบจะคืนค่า hash ออกมา

### 2. บันทึกลงฐานข้อมูล

เปิด SQL Editor ของฐานข้อมูลที่คุณใช้งานอยู่ แล้วรัน:

```sql
delete from "Admin";

insert into "Admin" ("username", "password")
values (
  'testuser',
  '$2b$10$PASTE_HASH_HERE'
);
```

หมายเหตุ:

- คำสั่งนี้จะลบ admin เดิมทั้งหมด แล้วเหลือแค่ `testuser`
- ถ้าต้องการล็อกให้ใช้แค่ user เดียว วิธีนี้เหมาะที่สุด
- ห้ามใส่ `password123` ตรง ๆ ลงในตาราง เพราะ login จะไม่ผ่าน

## วิธีรันโปรเจค

### รันแบบ local

```bash
npm run dev
```

หรือ

```bash
npm run start
```

เมื่อรันสำเร็จ:

- API Base URL: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- Swagger JSON: `http://localhost:3000/docs.json`

### รันผ่าน Docker

```bash
docker compose up --build
```

เมื่อรันสำเร็จ:

- API Base URL: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/docs`
- Swagger JSON: `http://localhost:3001/docs.json`

## วิธีใช้งาน Swagger

Swagger ใช้สำหรับ:

- ดู endpoint ทั้งหมด
- ดูรูปแบบ request/response
- ทดลองยิง API ได้จากหน้าเว็บ

### เปิด Swagger

ตอนรัน local:

- `http://localhost:3000/docs`

ตอนรัน Docker:

- `http://localhost:3001/docs`

### วิธีทดลอง endpoint ทั่วไป

1. เปิด `/docs`
2. เลือก endpoint ที่ต้องการ
3. กด `Try it out`
4. ใส่ข้อมูล
5. กด `Execute`

### วิธีใช้ Swagger กับ endpoint ที่ต้อง login

สำหรับ `POST /api/models/upload`

1. ยิง `POST /api/auth/login` ก่อน
2. คัดลอก token ที่ได้
3. กดปุ่ม `Authorize` ใน Swagger
4. ใส่ค่าแบบนี้:

```text
Bearer YOUR_JWT_TOKEN
```

5. กด `Authorize`
6. ทดลอง `POST /api/models/upload`

## วิธีใช้งาน API

Base URL ตอนรัน local:

- `http://localhost:3000`

### 1. เช็กว่า API ทำงานอยู่หรือไม่

#### `GET /health`

ตัวอย่าง response:

```json
{
  "status": "ok"
}
```

### 2. เช็กว่าเชื่อมฐานข้อมูลได้หรือไม่

#### `GET /health/db`

ตัวอย่าง response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### 3. login

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

### 4. ดึงโมเดลล่าสุด

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

Response เมื่อยังไม่มีโมเดล:

```json
{
  "message": "No model has been uploaded yet"
}
```

### 5. อัปโหลดโมเดลใหม่

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

- `model`: ไฟล์โมเดล
- `version`: `1.0.0`
- `releaseNote`: `Initial OTA model release`

Response:

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

## วิธีทดสอบผ่าน Postman

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

รันโหมดพัฒนา:

```bash
npm run dev
```

รันแอป:

```bash
npm run start
```

สร้าง hash ของ password:

```bash
npm run admin:hash -- password123
```

สร้าง Prisma client:

```bash
npm run prisma:generate
```

เช็ก migration:

```bash
npm run prisma:status
```

apply migration:

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

### ได้ `401 Invalid password`

สาเหตุ:

- password ในตาราง `Admin` ไม่ใช่ bcrypt hash

วิธีแก้:

- รัน `npm run admin:hash -- password123`
- เอาค่า hash ที่ได้ไปใส่ในฐานข้อมูล

### `GET /api/models/latest` ได้ `404`

สาเหตุ:

- ยังไม่มีโมเดลในระบบ

วิธีแก้:

- login แล้ว upload โมเดลก่อน

### `/health/db` ไม่ผ่าน

สาเหตุที่เป็นไปได้:

- `.env` ไม่ถูก
- connection string ผิด
- ยังไม่ได้ migrate

วิธีแก้:

- ตรวจ `.env`
- รัน `npm run prisma:generate`
- รัน `npm run prisma:migrate:deploy`

### Swagger เปิดไม่ได้

สาเหตุ:

- แอปยังไม่รัน
- เปิดผิดพอร์ต

วิธีแก้:

- local ใช้ `http://localhost:3000/docs`
- Docker ใช้ `http://localhost:3001/docs`

## สรุปสั้นสำหรับคนที่ clone โปรเจคนี้

ทำตามนี้:

1. `npm install`
2. สร้าง `.env`
3. ใส่ค่า database connection ของ environment ที่จะใช้
4. `npm run prisma:generate`
5. `npm run prisma:migrate:deploy`
6. `npm run admin:hash -- password123`
7. insert admin เป็น `testuser`
8. `npm run dev`
9. เปิด `http://localhost:3000/docs`

และให้ใช้ admin สำหรับทดสอบแค่ชุดเดียว:

- username: `testuser`
- password: `password123`
