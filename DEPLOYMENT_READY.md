# Calendar App - Firebase + Vercel

## ✅ โปรเจกต์พร้อม Deploy แล้ว!

### 🎯 สิ่งที่แก้ไข

1. ✅ ลบ Supabase dependencies ออกหมด
2. ✅ เพิ่ม Firebase Firestore เป็น database
3. ✅ ใช้ Firestore real-time listener (ไม่ต้อง polling)
4. ✅ แก้ไข API routes ให้ทำงานกับ Firestore
5. ✅ สร้าง Firebase configuration
6. ✅ เพิ่ม environment variables
7. ✅ อัพเดท README และสร้างคู่มือ setup

### 📂 ไฟล์ใหม่ที่สร้าง

- `lib/firebase/config.ts` - Firebase configuration
- `.env.example` - ตัวอย่าง environment variables  
- `FIREBASE_SETUP.md` - คู่มือ setup Firebase แบบละเอียด (ภาษาไทย)
- `QUICK_DEPLOY.md` - คู่มือ deploy แบบรวดเร็ว
- `scripts/add-sample-events.mjs` - Script เพิ่มข้อมูลตัวอย่าง
- `vercel.json` - Vercel configuration

### 🚀 ขั้นตอนถัดไป

1. **Setup Firebase:**
   ```bash
   # อ่านคู่มือละเอียด
   cat FIREBASE_SETUP.md
   
   # หรืออ่านแบบสั้น
   cat QUICK_DEPLOY.md
   ```

2. **สร้าง Firebase Project:**
   - ไปที่ https://console.firebase.google.com/
   - สร้างโปรเจกต์ใหม่
   - เปิด Firestore Database
   - คัดลอก config

3. **ตั้งค่า Local:**
   ```bash
   # ติดตั้ง dependencies
   pnpm install
   
   # สร้าง .env
   cp .env.example .env
   # แก้ไข .env ใส่ค่า Firebase
   ```

4. **ทดสอบ:**
   ```bash
   pnpm dev
   # เปิด http://localhost:3000
   ```

5. **เพิ่มข้อมูลตัวอย่าง (Optional):**
   ```bash
   pnpm add-samples
   ```

6. **Deploy บน Vercel:**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push
   
   # Deploy ที่ vercel.com
   # อย่าลืมเพิ่ม Environment Variables ทั้ง 6 ตัว!
   ```

### 🔑 Environment Variables ที่ต้องตั้งใน Vercel

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### ⚡ คุณสมบัติ

- ✨ **Real-time Sync** - เห็นการเปลี่ยนแปลงทันทีทุกอุปกรณ์
- 💾 **Persistent Storage** - ข้อมูลเก็บถาวรใน Firestore
- 🌍 **Shared Calendar** - ทุกคนเห็นข้อมูลเดียวกัน
- 🚀 **Zero Config Deploy** - Deploy ง่ายบน Vercel
- 🆓 **Free Tier** - ใช้ฟรีกับ Firebase Spark Plan

### 📚 เอกสารทั้งหมด

- `README.md` - ข้อมูลโปรเจกต์และ features
- `FIREBASE_SETUP.md` - คู่มือ Firebase setup แบบละเอียด
- `QUICK_DEPLOY.md` - Quick start guide
- `.env.example` - ตัวอย่าง environment variables

### 💡 Tips

- Firestore Free Tier: 50K reads/day, 20K writes/day (เพียงพอสำหรับแอพขนาดกลาง)
- Real-time sync ทำงานอัตโนมัติ ไม่ต้องรีโหลดหน้า
- Vercel deploy ฟรี และรองรับ Next.js อย่างสมบูรณ์
- ถ้าต้องการ Authentication เพิ่ม Firebase Auth ได้ง่ายมาก

---

**พร้อม Deploy แล้ว! 🎉**
