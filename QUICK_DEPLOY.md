# 🚀 Quick Deploy Guide

## สรุปขั้นตอน Deploy บน Vercel + Firebase

### 1️⃣ Setup Firebase (5 นาที)

```bash
1. ไปที่ https://console.firebase.google.com/
2. สร้างโปรเจกต์ใหม่
3. เปิด Firestore Database (Production mode)
4. คัดลอก Firebase config จาก Project Settings
```

### 2️⃣ ตั้งค่า Local (2 นาที)

```bash
# Clone และติดตั้ง
cd calendar-app-with-persistence
pnpm install

# สร้าง .env file
cp .env.example .env

# แก้ไข .env ใส่ค่า Firebase ที่ได้มา
```

### 3️⃣ ทดสอบ Local (1 นาที)

```bash
pnpm dev
# เปิด http://localhost:3000
# ลองเพิ่ม event ใหม่
```

### 4️⃣ Deploy บน Vercel (3 นาที)

```bash
# Push code ไป GitHub
git add .
git commit -m "Initial commit with Firebase"
git push

# ไปที่ https://vercel.com
# Import project from GitHub
# เพิ่ม Environment Variables ทั้ง 6 ตัว:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID

# คลิก Deploy!
```

### 5️⃣ ตั้งค่า Firestore Security Rules

```javascript
// ไปที่ Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /calendar_events/{document=**} {
      allow read, write: if true; // ใช้ได้ทุกคน
    }
  }
}
```

## ✅ เสร็จแล้ว!

เว็บของคุณพร้อมใช้งานแล้ว!
- ✨ Real-time sync ทำงานอัตโนมัติ
- 💾 ข้อมูลเก็บถาวรใน Firebase
- 🌍 ทุกคนเห็นข้อมูลเดียวกัน
- 🚀 Deploy บน Vercel (โหลดเร็วมาก)

## 📖 เอกสารเพิ่มเติม

- [README.md](README.md) - ข้อมูลโปรเจกต์ทั้งหมด
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - คู่มือ Firebase แบบละเอียด

## 🆘 หากมีปัญหา

1. เช็คว่า Environment Variables ครบ 6 ตัว
2. เช็คว่า Firestore Rules เปิดให้ read/write
3. ดู Console logs หา error
4. อ่าน [FIREBASE_SETUP.md](FIREBASE_SETUP.md) ส่วน Troubleshooting
