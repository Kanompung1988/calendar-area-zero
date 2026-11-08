"use client"

import { Toaster } from "sonner"
import { Calendar } from "@/components/calendar/calendar"
import { useAuth } from "@/hooks/use-auth"

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
          onClick={() => signIn().catch(() => {})}
          className="w-full rounded-lg border-2 border-foreground bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          เข้าสู่ระบบด้วย Google
        </button>
      </Board>
    )
  }

  if (denied || !members) {
    return (
      <Board>
        <p className="text-sm">
          <span className="font-medium">{user.email}</span> ยังไม่อยู่ในรายชื่อทีม
        </p>
        <p className="text-xs text-muted-foreground">ให้ admin เพิ่มอีเมลนี้ใน Firestore collection <code>members</code> แล้วลองใหม่</p>
        <button onClick={signOut} className="text-sm underline">ออกจากระบบ</button>
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
