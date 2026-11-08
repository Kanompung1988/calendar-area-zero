"use client"

import { useState } from "react"
import { Toaster } from "sonner"
import { Calendar } from "@/components/calendar/calendar"
import { describeAuthError, useAuth } from "@/hooks/use-auth"

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

function Board({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="board flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Area Zero Calendar</h1>
        {children}
      </div>
    </div>
  )
}

export default function Page() {
  const { user, members, loading, denied, signIn, signOut } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSignIn = async () => {
    setError(null)
    setSigningIn(true)
    try {
      await signIn()
    } catch (e) {
      setError(describeAuthError(e))
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <Board>
        <p className="text-sm text-muted-foreground">ปฏิทินงานของทีม เข้าได้เฉพาะสมาชิก</p>
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full rounded-lg border-2 border-foreground bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60"
        >
          {signingIn ? "กำลังเปิดหน้าต่าง Google..." : "เข้าสู่ระบบด้วย Google"}
        </button>
        {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
      </Board>
    )
  }

  if (denied || !members) {
    const email = user.email ?? ""
    return (
      <Board>
        <p className="text-sm">
          <span className="font-medium">{email}</span> ยังไม่อยู่ในรายชื่อทีม
        </p>
        <p className="text-xs text-muted-foreground">
          ให้ admin เพิ่ม document ใน Firestore collection <code>members</code> โดยใช้อีเมลนี้เป็น Document ID (ตัวพิมพ์เล็กทั้งหมด) แล้วลองใหม่
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <button
            onClick={() => navigator.clipboard?.writeText(email).then(() => setCopied(true), () => {})}
            className="rounded-lg border-2 border-foreground/40 px-3 py-1.5 font-medium hover:bg-secondary"
          >
            {copied ? "คัดลอกแล้ว" : "คัดลอกอีเมล"}
          </button>
          {PROJECT_ID && (
            <a
              href={`https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/~2Fmembers`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border-2 border-foreground/40 px-3 py-1.5 font-medium hover:bg-secondary"
            >
              เปิด Firestore (admin)
            </a>
          )}
        </div>
        <button onClick={signOut} className="text-sm underline">ออกจากระบบ / เปลี่ยนบัญชี</button>
      </Board>
    )
  }

  return (
    <>
      <Calendar me={{ email: user.email!, name: user.displayName ?? user.email!, avatar: user.photoURL }} members={members} onSignOut={signOut} />
      <Toaster position="bottom-center" />
    </>
  )
}
