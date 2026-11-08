import { NextResponse } from "next/server"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { Resend } from "resend"
import type { Member } from "@/lib/types"
import { buildDigest, isEmpty, renderDigest, type DigestItem } from "@/lib/digest"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Daily digest, triggered by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer $CRON_SECRET`. Add `?to=email` to send one person only (for testing).
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT
  const resendKey = process.env.RESEND_API_KEY
  if (!sa || !resendKey) return NextResponse.json({ error: "FIREBASE_SERVICE_ACCOUNT / RESEND_API_KEY missing" }, { status: 500 })

  const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(sa)) })
  const db = getFirestore(app)
  const [membersSnap, itemsSnap] = await Promise.all([db.collection("members").get(), db.collection("items").get()])
  const members = membersSnap.docs.map((d) => ({ email: d.id, ...d.data() }) as Member)
  const items = itemsSnap.docs.map((d) => {
    const data = d.data()
    return { ...data, id: d.id, createdAtMs: data.createdAt?.toMillis?.() } as DigestItem
  })

  const now = Date.now()
  const todayKey = new Date(now).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }) // YYYY-MM-DD
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://calendar.areazeroai.com"
  const from = process.env.EMAIL_FROM ?? "Area Zero Calendar <onboarding@resend.dev>"
  const only = new URL(req.url).searchParams.get("to")
  const resend = new Resend(resendKey)

  const results: Record<string, string> = {}
  for (const m of members) {
    if (only && m.email !== only) continue
    const d = buildDigest(items, m.email, todayKey, now)
    if (isEmpty(d)) {
      results[m.email] = "skipped (nothing due)"
      continue
    }
    const { subject, html } = renderDigest(m, d, todayKey, appUrl)
    try {
      const { error } = await resend.emails.send({ from, to: m.email, subject, html })
      results[m.email] = error ? `error: ${error.message}` : "sent"
    } catch (e) {
      results[m.email] = `error: ${e instanceof Error ? e.message : String(e)}` // one failure must not stop the rest
    }
  }
  return NextResponse.json({ todayKey, results })
}
