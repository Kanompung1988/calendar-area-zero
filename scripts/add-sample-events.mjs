// Script to add sample events to Firestore
// Run this file with: node --env-file=.env scripts/add-sample-events.mjs

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const sampleEvents = [
  {
    title: "Team Meeting",
    description: "Weekly sync with the team",
    day: 0, // Monday
    start_time: 9,
    end_time: 10,
    participants: ["Alice", "Bob"],
    color: "blue",
    image_url: null,
    recurrence: "weekly", // แสดงทุกสัปดาห์
  },
  {
    title: "Lunch Break",
    description: "Time to eat and relax",
    day: 0,
    start_time: 12,
    end_time: 13,
    participants: [],
    color: "emerald",
    image_url: null,
    recurrence: "weekly", // แสดงทุกสัปดาห์
  },
  {
    title: "Special Presentation",
    description: "One-time important presentation",
    day: 1, // Tuesday
    start_time: 14,
    end_time: 15,
    participants: ["Director", "Manager"],
    color: "red",
    image_url: null,
    recurrence: "once", // แสดงเฉพาะสัปดาห์นี้
  },
  {
    title: "Project Review",
    description: "Review current projects and progress",
    day: 2, // Wednesday
    start_time: 14,
    end_time: 16,
    participants: ["Charlie", "Diana"],
    color: "violet",
    image_url: null,
    recurrence: "once", // แสดงเฉพาะสัปดาห์นี้
  },
  {
    title: "Coffee Chat",
    description: "Casual discussion with team",
    day: 3, // Thursday
    start_time: 10,
    end_time: 11,
    participants: ["Eve"],
    color: "orange",
    image_url: null,
    recurrence: "weekly", // แสดงทุกสัปดาห์
  },
  {
    title: "Client Call",
    description: "Weekly check-in with client",
    day: 4, // Friday
    start_time: 15,
    end_time: 16,
    participants: ["Frank", "Grace"],
    color: "cyan",
    image_url: null,
    recurrence: "weekly", // แสดงทุกสัปดาห์
  },
]

async function addSampleEvents() {
  console.log('🔥 Adding sample events to Firestore...')
  
  try {
    for (const event of sampleEvents) {
      const docRef = await addDoc(collection(db, 'calendar_events'), {
        ...event,
        created_at: Timestamp.now()
      })
      console.log(`✅ Added: ${event.title} (ID: ${docRef.id})`)
    }
    
    console.log('\n🎉 Successfully added all sample events!')
    console.log('🌐 Open your app to see the events')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error adding events:', error)
    process.exit(1)
  }
}

addSampleEvents()
