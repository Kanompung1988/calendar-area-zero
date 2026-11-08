# Area Zero Calendar (v2)

ปฏิทินงานของทีม: นัด/ประชุม (event) + งาน/deadline (task) มุมมองสัปดาห์ / เดือน / รายการ, Google login เฉพาะสมาชิก, ข้อมูลใน Firestore แบบ real-time ธีมตาม areazeroai.com

## ตั้งค่าครั้งแรก (Firebase)

รายละเอียดทีละขั้นอยู่ใน [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) สรุปคือ

1. **Authentication → Sign-in method → Google** เปิดใช้งาน และเพิ่ม domain ที่ใช้ใน **Authorized domains** (`localhost`, `calendar.areazeroai.com`, โดเมน `*.vercel.app` ที่ใช้)
2. Publish rules: `npx firebase-tools login` แล้ว `npx firebase-tools deploy --only firestore:rules` (หรือวางเนื้อหาจาก [`firestore.rules`](firestore.rules) ใน console)
3. **Firestore → เพิ่มสมาชิก**: สร้าง collection `members` แล้วเพิ่ม document ที่ **document ID = อีเมล Google ของสมาชิก (ตัวพิมพ์เล็ก)** ใส่ field `name` (string) หนึ่ง doc ต่อคน — คนที่ไม่มี doc จะ login ได้แต่เข้าปฏิทินไม่ได้
4. (ไม่บังคับ) เปิด Storage แล้ว `npx firebase-tools deploy --only storage` เพื่อให้แนบรูปได้
5. ค่า Firebase config: `vercel link --project calendar-areazero && vercel env pull .env.local` หรือ `cp .env.example .env.local` แล้วใส่เอง

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit check ของ logic วันที่
```

## อีเมลสรุปทุกเช้า (08:00)

Vercel Cron ยิง `/api/cron/digest` ทุกวัน 01:00 UTC = 08:00 ไทย ส่งอีเมลหาแต่ละคน **เฉพาะวันที่มีงานของคนนั้น**: เลยกำหนด / วันนี้ / 3 วันข้างหน้า / งานใหม่ที่เพิ่งถูก assign ใน 24 ชม.

ตั้งค่าบน Vercel → Project → Settings → Environment Variables (ดูชื่อตัวแปรใน `.env.example`):

1. `FIREBASE_SERVICE_ACCOUNT` — Firebase console → Project settings → Service accounts → Generate new private key → วาง JSON ทั้งก้อน
2. `RESEND_API_KEY` — สมัคร [resend.com](https://resend.com) (ฟรี 3,000 ฉบับ/เดือน) ถ้ายังไม่ verify domain ให้ใช้ `EMAIL_FROM` ค่า default (`onboarding@resend.dev`) ไปก่อน ส่งได้เฉพาะอีเมลที่สมัคร Resend เท่านั้น
3. `CRON_SECRET` — string สุ่มอะไรก็ได้ Vercel จะส่งให้ cron เอง
4. redeploy แล้วทดสอบส่งให้ตัวเองคนเดียว:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://calendar.areazeroai.com/api/cron/digest?to=you@example.com"
```

## นำเข้าข้อมูล

ปุ่ม Import (ไอคอนอัปโหลด) รับไฟล์ JSON ที่เป็น array หรือ `{ "items": [...] }` ของ item ตาม [`lib/types.ts`](lib/types.ts) ตัวอย่าง: [`scripts/seed-selfmade.json`](scripts/seed-selfmade.json) (timeline โปรเจกต์ Selfmade)

ข้อมูลจาก v1 (collection `calendar_events`) ไม่ถูกย้ายอัตโนมัติ เพราะของเดิมไม่มีวันที่ ให้สร้างใหม่ตามต้องการ

## โครงสร้าง

- `lib/types.ts` — schema `Item`/`Member`, palette สี (เลือกเองต่องาน หรือตามโปรเจกต์), helper วันที่
- `lib/digest.ts` + `app/api/cron/digest/route.ts` — อีเมลสรุปเช้า (logic แยกเป็น pure function มี test) (วันที่เป็น `YYYY-MM-DD`, เวลาเป็นนาทีจากเที่ยงคืน ไม่มี timezone)
- `hooks/use-auth.ts` — Google login + ตรวจ allowlist `members`
- `hooks/use-items.ts` — อ่าน/เขียน Firestore จาก client โดยตรง (rules เป็นคนคุมสิทธิ์)
- `components/calendar/` — `calendar.tsx` (shell), `week-view`, `month-view`, `agenda-view`, `item-modal`, `item-chip`, `event-block`
- `firestore.rules`, `storage.rules` — ต้อง publish เองใน console

## ยังไม่ทำ (ดู `../PROPOSAL.md`)

quick add บรรทัดเดียว, search, checklist ย่อย, comment, iCal feed, เตือนทันทีตอนถูก assign (ตอนนี้รวมในเมลเช้า)

---

<details><summary>v1 notes (เก่า)</summary>

## Quick Start

### 1. Setup Firebase Project

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Create Firestore Database:**
   - In your Firebase project, go to **Firestore Database**
   - Click "Create database"
   - Start in **production mode** (or test mode for development)
   - Choose your server location

3. **Get Firebase Configuration:**
   - Go to **Project Settings** (gear icon) > **General**
   - Scroll down to "Your apps"
   - Click the **Web** icon (`</>`) to add a web app
   - Register your app (name it whatever you like)
   - Copy the Firebase configuration values

### 2. Local Development

1. **Clone and install dependencies:**
```bash
cd calendar-app-with-persistence
pnpm install
```

2. **Configure environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Firebase credentials
```

Your `.env` file should look like this:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

3. **Run the development server:**
```bash
pnpm dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### 3. Add Sample Events (Optional)

You can add initial events through the UI, or use the automated script:

```bash
# Add sample events to Firestore
pnpm add-samples
```

Or manually via Firebase Console:
- Go to Firestore Database
- Create a new collection called `calendar_events`
- Add documents with these fields:
  - `title` (string)
  - `description` (string)
  - `day` (number: 0-6, Monday-Sunday)
  - `start_time` (number: 8-21)
  - `end_time` (number: 9-22)
  - `participants` (array of strings)
  - `color` (string: "blue", "emerald", "violet", etc.)
  - `recurrence` (string: "once" or "weekly")
  - `image_url` (string, nullable)
  - `created_at` (timestamp)

## 📦 Deploy to Vercel

The easiest way to deploy this app:

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub**

2. **Go to [vercel.com](https://vercel.com) and import your project**

3. **Add Environment Variables:**
   - In the Vercel project settings, add all your Firebase environment variables:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. **Deploy!**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
pnpm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted
# Or set them in Vercel dashboard
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

## 🔐 Security: Configure Firestore Rules

**Important:** Update your Firestore Security Rules to protect your data:

1. Go to **Firestore Database** > **Rules** in Firebase Console

2. Use these rules for public read/write (anyone can use the calendar):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /calendar_events/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. For production, you might want to add authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /calendar_events/{document=**} {
      // Only authenticated users can read/write
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🏗️ Architecture

- **Frontend:** Next.js 16 with React 19
- **Backend:** Next.js API Routes (optional, for complex operations)
- **Database:** Firebase Firestore (NoSQL, real-time)
- **Real-time Updates:** Firestore onSnapshot listeners
- **Hosting:** Vercel (recommended) or any Next.js hosting platform
- **Styling:** Tailwind CSS with shadcn/ui components

## 📁 Project Structure

```
calendar-app-with-persistence/
├── app/
│   ├── api/
│   │   └── events/
│   │       └── route.ts         # API endpoints (optional with Firestore)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── calendar/
│   │   ├── calendar.tsx         # Main calendar component
│   │   ├── event-modal.tsx      # Event creation/editing modal
│   │   └── ...
│   └── ui/                      # shadcn/ui components
├── hooks/
│   └── use-calendar-events.ts   # Event management with Firestore
├── lib/
│   ├── firebase/
│   │   └── config.ts            # Firebase configuration
│   ├── calendar-types.ts        # TypeScript types
│   └── utils.ts
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

## 🎨 Customization

### Changing Time Range

Edit [`lib/calendar-types.ts`](lib/calendar-types.ts):

```typescript
export const START_HOUR = 6  // Change from 8 to 6
export const END_HOUR = 24   // Change from 22 to 24
```

### Adding More Colors

Edit [`lib/calendar-types.ts`](lib/calendar-types.ts) to add more color options.

## 🔧 Tech Stack

- **Framework:** Next.js 16.1.6
- **React:** 19.2.4
- **Database:** Firebase Firestore
- **TypeScript:** 5.7.3
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** Radix UI + shadcn/ui
- **Date Handling:** date-fns 4.1.0
- **Icons:** Lucide React

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 💡 Tips

- **Event Colors:** Choose from 12 beautiful color options
- **Drag Events:** Click and drag events to move them
- **Resize Events:** Drag the bottom edge to change duration
- **Add Events:** Click on any empty time slot
- **Delete Events:** Open event details and click delete
- **Real-time:** Changes appear instantly for all users

## 🐛 Troubleshooting

**Firebase connection errors?**
- Check that all environment variables are set correctly
- Verify your Firebase project is active
- Check Firestore is enabled in your Firebase project

**Events not syncing?**
- Check browser console for errors
- Verify Firestore security rules allow read/write
- Make sure you're using the same Firebase project across all clients

**Deploy issues?**
- Ensure all environment variables are added in Vercel
- Check build logs for errors
- Verify Firebase credentials are correct

**CORS or API errors?**
- Firebase client SDK works directly in the browser
- API routes are optional for complex server-side operations
- Make sure to use `NEXT_PUBLIC_` prefix for environment variables

## 🌟 Features Coming Soon

- [ ] User authentication (Firebase Auth)
- [ ] Event categories and tags
- [ ] Calendar sharing with invite links
- [ ] Email notifications
- [ ] Mobile apps (React Native)
- [ ] Calendar integrations (Google Calendar, Outlook)

---

Made with ❤️ using Next.js, Firebase, and Tailwind CSS

## 📸 Screenshots

Add your screenshots here once deployed!

</details>
