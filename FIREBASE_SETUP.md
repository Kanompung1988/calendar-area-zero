# ตั้งค่า Firebase + Google login (v2)

Firebase project ที่ใช้: `areazero-e50b8` (ค่า config อยู่ใน Vercel env และ `.env.local`)

ระบบทำงานแบบนี้: ล็อกอินด้วย Google → Firestore rules เช็คว่าอีเมลมี document ใน `members/{อีเมล}` หรือไม่ → ถ้ามีถึงเห็นและแก้ปฏิทินได้ ดังนั้นต้องทำครบทุกข้อด้านล่างก่อนจึงจะเข้าใช้งานได้

## 0. ลงทะเบียน Web app และเปิด Firestore

- [Project settings → General](https://console.firebase.google.com/project/areazero-e50b8/settings/general) → **Add app** → Web (`</>`) → ตั้งชื่อ → Register app (ไม่ต้องติ๊ก Hosting) แล้วคัดลอก `firebaseConfig` เก็บไว้ใส่ใน env ทั้ง 6 ตัว (ดูหัวข้อ Environment variables)
- [Firestore Database → Create database](https://console.firebase.google.com/project/areazero-e50b8/firestore) → เลือก **Production mode** และ location (เช่น `asia-southeast1`) ซึ่งเปลี่ยนทีหลังไม่ได้

## 1. เปิด Google sign-in

[Authentication → Sign-in method](https://console.firebase.google.com/project/areazero-e50b8/authentication/providers) → **Google** → Enable → เลือก support email → Save

ถ้ายังไม่เปิด ปุ่มล็อกอินจะแจ้งว่า "ยังไม่ได้เปิด Google sign-in" (`auth/operation-not-allowed`)

## 2. เพิ่ม Authorized domains

[Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/areazero-e50b8/authentication/settings) → Add domain ให้ครบทุกโดเมนที่เปิดแอปจริง:

- `localhost` และ `areazero-e50b8.firebaseapp.com` (มีให้แล้ว)
- `calendar.areazeroai.com`
- `calendar-areazero.vercel.app`
- `calendar-area-zero.vercel.app`

ถ้าขาด ปุ่มล็อกอินจะแจ้ง `auth/unauthorized-domain` พร้อมชื่อโดเมน หมายเหตุ: URL preview ของ Vercel (`*-git-xxx-….vercel.app`) ใช้ wildcard ไม่ได้ ถ้าจะทดสอบล็อกอินบน preview ต้องเพิ่มทีละ URL

## 3. Publish rules

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

(`firebase.json` / `.firebaserc` ตั้งไว้แล้ว) หรือเปิด Firestore → Rules แล้ววางเนื้อหาจาก [`firestore.rules`](firestore.rules) → Publish

rules ชุดนี้ปฏิเสธทุก collection ที่ไม่ได้ระบุไว้ และอนุญาต `items` กับ `members` เฉพาะผู้ที่อยู่ในรายชื่อ `members` เท่านั้น

## 4. เพิ่มสมาชิกทีม

[Firestore → Data](https://console.firebase.google.com/project/areazero-e50b8/firestore/data) → Start collection `members` แล้วเพิ่ม document หนึ่งอันต่อคน

| ช่อง | ค่า |
| --- | --- |
| Document ID | อีเมล Google ของสมาชิก **ตัวพิมพ์เล็กทั้งหมด** เช่น `fin@areazeroai.com` |
| `name` (string) | ชื่อที่แสดง |

เพิ่มตัวเองก่อนเป็นคนแรก เพราะ rules ไม่ให้สร้าง/ลบสมาชิกจากในแอป (ต้องทำใน console เท่านั้น) คนที่ล็อกอินแล้วแต่ไม่มี document จะเห็นหน้า "ยังไม่อยู่ในรายชื่อทีม" พร้อมปุ่มคัดลอกอีเมลส่งให้ admin

## 5. (ถ้าต้องการอัปโหลดรูป) เปิด Storage

[Storage → Get started](https://console.firebase.google.com/project/areazero-e50b8/storage) แล้ว

```bash
npx firebase-tools deploy --only storage
```

โปรเจกต์ใหม่อาจต้องอัปเกรดเป็นแผน Blaze จึงจะสร้าง bucket ได้ ถ้ายังไม่เปิด แอปใช้งานได้ปกติ ยกเว้นการแนบรูปจะแจ้ง "อัปโหลดรูปไม่สำเร็จ"

## Environment variables

ต้องมีครบ 6 ตัวทั้งใน local และ Vercel (ดูชื่อใน [`.env.example`](.env.example))

```bash
vercel link --project calendar-areazero
vercel env pull .env.local     # ดึงค่าลง .env.local สำหรับรัน local
```

เปลี่ยนค่า env บน Vercel แล้วต้อง Redeploy เพราะค่า `NEXT_PUBLIC_*` ถูกฝังตอน build

## แก้ปัญหาที่เจอบ่อย

| อาการ | สาเหตุ |
| --- | --- |
| กดล็อกอินแล้วแจ้ง "ยังไม่ได้เปิด Google sign-in" | ข้อ 1 ยังไม่ทำ |
| แจ้ง `auth/unauthorized-domain` | ข้อ 2: โดเมนนั้นยังไม่อยู่ใน Authorized domains |
| ล็อกอินได้แต่ขึ้น "ยังไม่อยู่ในรายชื่อทีม" | ข้อ 4: ยังไม่มี `members/{อีเมล}` หรือพิมพ์ใหญ่/เล็กไม่ตรง หรือยังไม่ publish rules (ข้อ 3) |
| ล็อกอินแล้วหมุนค้าง / ข้อมูลไม่ขึ้น | เปิด DevTools ดู error `Missing or insufficient permissions` → ข้อ 3 และ 4 |
| บันทึก/ลบแล้วขึ้น "บันทึกไม่สำเร็จ" | ไม่ใช่สมาชิก หรือ rules ยังเป็นของ v1 |
| แจ้ง `auth/popup-blocked` | เบราว์เซอร์บล็อก popup ให้อนุญาตสำหรับเว็บนี้ |
