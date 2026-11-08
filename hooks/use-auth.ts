"use client"

import { useEffect, useState } from "react"
import { FirebaseError } from "firebase/app"
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth"
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore"
import { db, getAuthClient, googleProvider } from "@/lib/firebase/config"
import type { Member } from "@/lib/types"
import { DEMO, demoMe, demoMembers } from "@/lib/demo"

// Turn a Firebase Auth error into something a teammate (or the admin) can act on.
// Returns null for "user just closed the popup", which is not an error worth showing.
export function describeAuthError(e: unknown): string | null {
  const code = e instanceof FirebaseError ? e.code : ""
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null
    case "auth/popup-blocked":
      return "เบราว์เซอร์บล็อกหน้าต่างล็อกอิน กรุณาอนุญาต popup สำหรับเว็บนี้แล้วลองใหม่"
    case "auth/unauthorized-domain":
      return `โดเมน ${typeof window !== "undefined" ? window.location.hostname : ""} ยังไม่ได้เพิ่มใน Firebase → Authentication → Settings → Authorized domains`
    case "auth/operation-not-allowed":
      return "ยังไม่ได้เปิด Google sign-in ใน Firebase → Authentication → Sign-in method"
    case "auth/network-request-failed":
      return "เชื่อมต่อเครือข่ายไม่ได้ ลองใหม่อีกครั้ง"
    case "auth/internal-error":
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "ค่า Firebase config ไม่ถูกต้อง ตรวจ NEXT_PUBLIC_FIREBASE_* ใน environment variables"
    default:
      return `ล็อกอินไม่สำเร็จ${code ? ` (${code})` : ""}`
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined) // undefined = loading
  const [members, setMembers] = useState<Member[] | null>(null) // null = not allowed / loading

  useEffect(() => {
    if (DEMO) return
    return onAuthStateChanged(getAuthClient(), setUser)
  }, [])

  useEffect(() => {
    if (DEMO || !user?.email) {
      setMembers(null)
      return
    }
    const email = user.email
    // Keep own profile fresh; this write is also the allowlist check (rules reject non-members).
    setDoc(doc(db, "members", email), { email, name: user.displayName ?? email, avatar: user.photoURL ?? null, uid: user.uid }, { merge: true }).catch(() => {})
    return onSnapshot(
      collection(db, "members"),
      (snap) => setMembers(snap.docs.map((d) => ({ email: d.id, ...d.data() }) as Member)),
      () => setMembers([]) // permission denied → not a member
    )
  }, [user])

  if (DEMO) {
    return {
      user: { email: demoMe.email, displayName: demoMe.name, photoURL: null } as User,
      members: demoMembers,
      loading: false,
      denied: false,
      signIn: async () => {},
      signOut: async () => {},
    }
  }

  return {
    user,
    members,
    loading: user === undefined || (!!user && members === null),
    denied: !!user && members !== null && !members.some((m) => m.email === user.email),
    signIn: () => signInWithPopup(getAuthClient(), googleProvider),
    signOut: () => signOut(getAuthClient()),
  }
}
