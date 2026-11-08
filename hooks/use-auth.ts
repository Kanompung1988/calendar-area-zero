"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth"
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore"
import { db, getAuthClient, googleProvider } from "@/lib/firebase/config"
import type { Member } from "@/lib/types"
import { DEMO, demoMe, demoMembers } from "@/lib/demo"

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
