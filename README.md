# Calendar App with Firebase & Real-time Sync

A beautiful, interactive weekly calendar application built with Next.js 16 and Firebase Firestore, featuring **real-time synchronization**, drag-and-drop events, color-coding, and shared event management. All users can see and add events in real-time across all devices!

## ✨ Features

- 📅 **Weekly Calendar View** - Beautiful weekly layout with 8:00 AM - 10:00 PM time slots
- 🎨 **Color-Coded Events** - 12 color options to organize your schedule
- 🖱️ **Drag & Drop** - Easily move and resize events
- 👥 **Participant Management** - Add participants to events
- 🔄 **Recurring Events** - Set events to repeat weekly
- ⚡ **Real-time Sync** - See updates instantly across all users and devices
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌓 **Dark Mode Support** - Toggle between light and dark themes
- 💾 **Persistent Storage** - Data stored in Firebase Firestore
- 📥 **Import/Export** - Export and import your calendar data

## 🚀 Quick Start

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
