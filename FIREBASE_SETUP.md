# 🔥 Firebase Setup Guide

คู่มือการติดตั้ง Firebase สำหรับ Calendar App แบบละเอียด

## ขั้นตอนที่ 1: สร้าง Firebase Project

1. เปิด [Firebase Console](https://console.firebase.google.com/)
2. คลิก **"Add project"** หรือ **"เพิ่มโปรเจกต์"**
3. ตั้งชื่อโปรเจกต์ เช่น `"my-calendar-app"`
4. (Optional) เปิดใช้งาน Google Analytics
5. คลิก **"Create project"**

## ขั้นตอนที่ 2: สร้าง Firestore Database

1. ในเมนูด้านซ้าย คลิก **"Firestore Database"**
2. คลิก **"Create database"**
3. เลือกโหมด:
   - **Production mode** (แนะนำ) - ต้องตั้งค่า Security Rules
   - **Test mode** - เปิดให้ทุกคนเข้าถึงได้ 30 วัน
4. เลือก Location ที่ใกล้คุณที่สุด เช่น:
   - `asia-southeast1` (Singapore)
   - `asia-northeast1` (Tokyo)
5. คลิก **"Enable"**

## ขั้นตอนที่ 3: ตั้งค่า Security Rules

1. ไปที่ **Firestore Database** > **Rules**
2. คัดลอกโค้ดนี้:

### สำหรับการใช้งานสาธารณะ (ทุกคนใช้ร่วมกันได้)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /calendar_events/{document=**} {
      // อนุญาตให้ทุกคนอ่านและเขียนได้
      allow read, write: if true;
    }
  }
}
```

### สำหรับการใช้งานแบบจำกัด (ต้อง login ก่อน)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /calendar_events/{document=**} {
      // เฉพาะผู้ใช้ที่ล็อกอินแล้วเท่านั้น
      allow read, write: if request.auth != null;
    }
  }
}
```

3. คลิก **"Publish"**

## ขั้นตอนที่ 4: รับ Firebase Configuration

1. คลิกไอคอน **⚙️ Settings** (ตั้งค่า)
2. เลือก **Project settings**
3. เลื่อนลงมาที่ **"Your apps"**
4. คลิกไอคอน **`</>`** (Web)
5. ตั้งชื่อแอพ เช่น `"Calendar Web App"`
6. ไม่ต้องเลือก "Firebase Hosting" (เราจะใช้ Vercel)
7. คลิก **"Register app"**
8. คัดลอกค่าใน `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

## ขั้นตอนที่ 5: ตั้งค่า Environment Variables

### สำหรับ Local Development

1. สร้างไฟล์ `.env` ในโฟลเดอร์โปรเจกต์:

```bash
cp .env.example .env
```

2. เปิดไฟล์ `.env` และใส่ค่าจาก Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

⚠️ **สำคัญ:** อย่าลืม prefix `NEXT_PUBLIC_` เพราะค่าเหล่านี้จะถูกใช้ใน browser

### สำหรับ Vercel Deployment

1. ไปที่ Vercel Dashboard
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **Settings** > **Environment Variables**
4. เพิ่มตัวแปรทีละตัว:
   - Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Value: `AIzaSy...`
   - คลิก **"Add"**
5. ทำซ้ำกับตัวแปรทั้งหมด 6 ตัว
6. Redeploy โปรเจกต์

## ขั้นตอนที่ 6: เพิ่มข้อมูลตัวอย่าง (Optional)

คุณสามารถเพิ่มข้อมูล event ตัวอย่างใน Firestore Console:

1. ไปที่ **Firestore Database** > **Data**
2. คลิก **"Start collection"**
3. Collection ID: `calendar_events`
4. เพิ่ม Document แรก:

```
Document ID: (Auto-ID)

Fields:
- title (string): "Team Meeting"
- description (string): "Weekly sync"
- day (number): 0
- start_time (number): 9
- end_time (number): 10
- participants (array): ["Alice", "Bob"]
- color (string): "blue"
- recurrence (string): "weekly"
- image_url (string): null
- created_at (timestamp): [คลิก "Set to current time"]
```

5. คลิก **"Save"**

## ขั้นตอนที่ 7: ทดสอบ

1. รันโปรเจกต์:
```bash
pnpm dev
```

2. เปิด http://localhost:3000

3. ทดสอบ:
   - ✅ เห็น event ที่เพิ่มไว้หรือไม่
   - ✅ เพิ่ม event ใหม่ได้หรือไม่
   - ✅ ลบ event ได้หรือไม่
   - ✅ เปิดอีก tab/browser แล้วเห็นข้อมูลเดียวกันหรือไม่ (real-time sync)

## 🔒 Security Best Practices

### 1. ปกป้อง API Key

- API Key ใน Firebase **ไม่ใช่ Secret** สามารถเปิดเผยได้
- Security จริงๆ อยู่ที่ **Firestore Rules**
- ถ้าต้องการความปลอดภัยสูง ให้เพิ่ม Authentication

### 2. จำกัด Domain (Recommended)

1. ไปที่ Firebase Console > **Authentication** > **Settings**
2. เพิ่ม Authorized domains:
   - `localhost` (สำหรับ dev)
   - `your-app.vercel.app` (สำหรับ production)

### 3. ตั้งค่า Budget Alerts

1. ไปที่ Google Cloud Console
2. เลือกโปรเจกต์เดียวกัน
3. ไปที่ **Billing** > **Budgets & alerts**
4. สร้าง budget alert เพื่อป้องกันค่าใช้จ่ายเกิน

## 💰 ค่าใช้จ่าย

### Firebase Free Tier (Spark Plan)

- **Firestore:**
  - 1 GB storage
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day

สำหรับแอพ Calendar ขนาดเล็ก-กลาง ใช้ฟรีได้เลย!

### เมื่อไหร่ต้องอัพเกรด

- มีผู้ใช้มากกว่า 50-100 คน
- มี events มากกว่า 1000 รายการ
- ต้องการ backup อัตโนมัติ

## 🆘 แก้ปัญหา

### ❌ "Firebase: Error (auth/api-key-not-valid)"

- เช็คว่า API Key ถูกต้อง
- เช็คว่าใส่ prefix `NEXT_PUBLIC_` ครบ
- ลอง copy-paste ใหม่จาก Firebase Console

### ❌ "Missing or insufficient permissions"

- เช็ค Firestore Rules
- ถ้าใช้ Test mode ดูว่าหมดอายุหรือยัง
- ลองเปลี่ยนเป็น `allow read, write: if true;`

### ❌ "Firebase: Firebase App named '[DEFAULT]' already exists"

- ปิด/เปิด dev server ใหม่
- Clear browser cache
- ตรวจสอบว่าไม่มีการ import `firebase/config` ซ้ำ

### ❌ Events ไม่ sync real-time

- เช็ค console logs
- ตรวจสอบว่าไม่มี error ใน Firestore listener
- ลองรีโหลดหน้าเว็บ

## 📚 เอกสารเพิ่มเติม

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

หากมีปัญหา สามารถเปิด Issue ใน GitHub หรือติดต่อทีมพัฒนา
