# IARC Theme React MUI MongoDB

Original Design By @YOT-ANAN [YOT-ANAN]('https://github.com/YOT-ANAN')

## การพัฒนา

`npm install` ทั้งด้านนอกและด้านใน , Frontend รันที่พอร์ต 3000 Backend รันที่พอร์ต 3001

```
cd frontend && npm start
```

และ

```
cd backend && npm run dev
```

หรือ จากข้างนอก

```
npm run dev
```

## Frontend

รันโดย React, Material UI, React Redux, Tailwind CSS การรันโปรแกรมใน `/src` จะเริ่มที่ `index.js` จะเรียกใช้ฟังก์ชั่นใน Context ของ AuthProvider จะหา token และ userId ใน localStorage บน Browser ว่ามีหรือไม่ ถ้ามีก็จะเข้าไปที่ PrivateRoute แต่ถ้าไม่มีก็จะ Redirect ไปที่ AuthLayout ใน PrivateRoute จะมีการ Link ไปที่ Layout ต่าง ๆ โครงสร้างไฟล์ที่ต่าง ๆ เป็นดังนี้

- **assets** เก็บไฟล์ภาพ ไฟล์ css และ ไฟล์อื่น ๆ
- **components** เก็บพวก Component ที่เราสร้างกันไว้เอง เช่นพวก Header,Footer, ฟอร์มต่าง ๆ ,Card หรือ Box ต่าง ๆ สำหรับการทำ Reusable
- **contexts** เก็บฟังก์ชัน และ Provider ที่เราจะใช้เป็น Context
- **layouts** เป็น Router หลักของแต่ละโมดูล
- **redux** เก็บ actions และ reducers ของระบบ โดยเราจะแบ่งเป็น `common/` คือทั่วไป และ `feature/` คืออะไรที่เป็นเฉพาะระบบ
- **utils** เก็บ constants หรือ ค่าคงที่ที่ใช้ในระบบ และ functions สาธารณประโยชน์ต่าง ๆ ที่เราอาจจะเอาไปใช้ซ้ำในส่วนต่าง ๆ ของโปรแกรมได้
- **views** เก็บหน้าเว็บไซต์หน้าต่าง ๆ

โดยมีที่ผสมมา คือ

- `theme.js` เป็นการ config theme ของ MUI
- `.env` เป็นไฟล์สำหรับกำหนด Environment Variable โดยจะแยกเป็น .env.development และ .env.production
- `.eslintrc.json` เป็นการใส่ค่า config สำหรับ eslint หรือ ตัวตรวจ code ของเราว่าเป็นไปตาม style guideline หรือไม่
- `.prettierrc` เป็นการ config สำหรับ formatter
- `jsconfig.json` เป็นการ config สำหรับ VSCode

## Backend

เป็น Node.js Express ที่เชื่อกับ MongoDB โดยมี Mongoose เป็น ORM จะเริ่มจากไฟล์ `server.js` ซึ่งจะนำค่าจาก Routes ต่าง ๆ รวมถึงการใช้งาน Middleware ต่าง ๆ มารวมกัน
โดย API จะรันผ่านเข้าไปทาง Route -> Controller -> Service

- **configs** เก็บโค้ดเกี่ยวกับการเชื่อมต่อ plugin / library ต่าง ๆ หรือการตั้งค่า middleware ต่าง ๆ
- **constants** เก็บค่าคงที่ต่าง ๆ
- **credentials** เก็บไฟล์ที่ใช้เป็น key ในการเชื่อมต่อ service ต่าง ๆ เช่น Google GCS Storage
- **helper** เก็บพวก helper หรือ utilities functions
- **routes** เป็นตัวกำหนด Request ที่เข้ามาในระบบ เช่น จะให้มี GET/POST/PUT/DELETE ยังไงบ้าง
- **controllers** เป็นการเชื่อมต่อระหว่าง routes กับ service ต่าง ๆ มีการ Handle Error ต่าง ๆ ตรงนี้
- **services** Application Logic ของระบบ ใช้ในการเขียนฟังก์ชันทำงานของระบบ ไม่ว่าจะเป็นการคำนวณค่า การเชื่อมต่อ Query ไปยัง Database
- **models** เป็นโครงสร้างข้อมูลที่จะเอาไว้สร้าง Collection ใน Database
- **validators** เป็น helper function ที่ใช้ในการ validate ข้อมูลให้ตรงตามรูปแบบที่เราต้องการ
- **www** เป็นที่เก็บ static file ที่ได้จากการ Build Frontend Application

## การ Config โปรเจกต์

- ใส่ Database และ GCS Bucket ใน .env ของ Backend
- เปลี่ยน Font ของ Frontend ใน `frontend/tailwind.config.js` รวมถึง import มันใน `frontend/src/assets/styles/index.css`
- เปลี่ยนสีหัวของเว็บ `frontend/src/components/Navbars/HomeNavbar.js` และเปลี่ยนสี theme ของเว็บไซต์ `frontend/src/theme.js`

## การ Deploy

- Build Project

  ```
  cd frontend
  npm run build
  ```

  จากนั้น Copy ไฟล์ใน build มาไว้ที่ `backend/www` และมาใส่ routes ที่ `backend/routes/index.js` โดยใส่แค่เฉพาะตัวนอกสุด และตัวนอกสุดมีดอกจันทร์ \_ เช่น โมดูล hrms ใส่แค่ `/hrms`และ `/hrms/*`

- ใส่ Secret ใน Repository Secret `DOCKERHUB_USERNAME`,`DOCKERHUB_TOKEN`,`DROPLET_PASSWORD`
- เขียน Docker Compose ตามตัวอย่างในไฟล์ [docker-compose.yml](docker-compose.yml)

```
version: "3.8"
services:
  southernseafood:
    container_name: southernseafood
    image: iarc/erp-manufac:latest
    environment:
      - MONGODB_URI="mongodb://admin:IARCeimhtsj4IARC@db.eappsoft.net:27020,db.eappsoft.net:27021,db.eappsoft.net:27022/southernseafood?authSource=admin&readPreference=primary&ssl=false"
      - ENTITY_SIZE=50mb
      - GCS_BUCKET=erp_iarc
      - GCS_PROJECT_ID=erp-iarc-303708
      - SECRET=intelligentautomationresearchcenter
      - PORT=3001
      - LINE_NOTIFY_CLIENT_ID = z954ne3Cg1YLgLk1inOL99
      - LINE_NOTIFY_CLIENT_SECRET = mLSuZRCU2ZdtygdlHVSOZ5ZO1UW0cDfhtUb19ytrt3H
      - LINE_NOTIFY_REDIRECT_URL = https://southernseafood.eappsoft.net/profile/line/redirect
    ports:
      - 8801:3001

```

- แก้ไขชื่อต่าง ๆ ใน Pipelines ที่ `.github/workflows/deploy.yml` รวมถึงใน docker-compose.yml ตัวสำคัญคือชื่อ Docker Image
- Pipeline Trigger ที่ Branch **deploy** หรือ สร้าง Release ใหม่ ก็จะเป็นการ Deploy ระบบโดยอัตโนมัติ
