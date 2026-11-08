// Pure digest logic (no Firebase, no network) so it can be unit tested.
import type { Item, Member } from "./types.ts"
import { fmtMin, occursOn } from "./types.ts"

export type DigestItem = Item & { createdAtMs?: number }

export interface Digest {
  overdue: DigestItem[]
  today: DigestItem[] // tasks due today + events happening today
  soon: DigestItem[] // tasks due in the next 3 days
  assigned: DigestItem[] // assigned to this person in the last 24h
}

const addDays = (key: string, n: number) => {
  const d = new Date(`${key}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function buildDigest(items: DigestItem[], email: string, todayKey: string, nowMs: number): Digest {
  const mine = items.filter((it) => it.assignees.includes(email))
  const openTask = (it: DigestItem) => it.kind === "task" && it.status !== "done"
  const soonKeys = [1, 2, 3].map((n) => addDays(todayKey, n))
  const byTime = (a: DigestItem, b: DigestItem) => (a.startMin ?? a.dueMin ?? -1) - (b.startMin ?? b.dueMin ?? -1)
  return {
    overdue: mine.filter((it) => openTask(it) && it.endDate < todayKey).sort((a, b) => a.endDate.localeCompare(b.endDate)),
    today: mine.filter((it) => (openTask(it) ? it.endDate === todayKey : it.kind === "event" && occursOn(it, todayKey))).sort(byTime),
    soon: mine.filter((it) => openTask(it) && soonKeys.includes(it.endDate)).sort((a, b) => a.endDate.localeCompare(b.endDate)),
    assigned: mine.filter((it) => it.createdAtMs !== undefined && nowMs - it.createdAtMs < 24 * 3600 * 1000 && it.status !== "done"),
  }
}

export const isEmpty = (d: Digest) => !d.overdue.length && !d.today.length && !d.soon.length && !d.assigned.length

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
const thDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })

function line(it: DigestItem, showDate: boolean) {
  const time = it.kind === "task" ? (it.dueMin !== undefined ? fmtMin(it.dueMin) : "") : it.allDay ? "ทั้งวัน" : `${fmtMin(it.startMin!)}–${fmtMin(it.endMin!)}`
  const meta = [showDate ? thDate(it.endDate) : "", time, it.project].filter(Boolean).join(" · ")
  return `<li style="margin:0 0 6px"><strong>${esc(it.title)}</strong>${meta ? ` <span style="color:#4a5a50">— ${esc(meta)}</span>` : ""}</li>`
}

function section(title: string, list: DigestItem[], showDate: boolean, color = "#16241c") {
  if (!list.length) return ""
  return `<h3 style="margin:20px 0 6px;font-size:14px;color:${color}">${title} (${list.length})</h3><ul style="margin:0;padding-left:18px;font-size:14px">${list.map((it) => line(it, showDate)).join("")}</ul>`
}

export function renderDigest(member: Member, d: Digest, todayKey: string, appUrl: string) {
  const subjectBits = [
    d.overdue.length && `เลยกำหนด ${d.overdue.length}`,
    d.today.length && `วันนี้ ${d.today.length}`,
    d.soon.length && `ใกล้ถึง ${d.soon.length}`,
  ].filter(Boolean)
  const subject = `[Area Zero] ${thDate(todayKey)} · ${subjectBits.join(" · ") || `งานใหม่ ${d.assigned.length}`}`
  const html = `<!doctype html><html lang="th"><body style="margin:0;background:#f3eee6;padding:24px;font-family:Anuphan,Helvetica,Arial,sans-serif;color:#16241c">
<div style="max-width:560px;margin:0 auto;background:#fffdf6;border:2px solid #16241c;border-radius:14px;box-shadow:6px 6px 0 #16241c;padding:24px">
<h2 style="margin:0 0 4px;font-size:20px">สวัสดี ${esc(member.name)}</h2>
<p style="margin:0;color:#4a5a50;font-size:13px">สรุปงานของคุณ ${thDate(todayKey)}</p>
${section("เลยกำหนด", d.overdue, true, "#c8392f")}
${section("วันนี้", d.today, false)}
${section("3 วันข้างหน้า", d.soon, true)}
${section("งานใหม่ที่ได้รับมอบหมาย", d.assigned, true)}
<p style="margin:24px 0 0"><a href="${appUrl}" style="display:inline-block;background:#f5c443;color:#16241c;border:2px solid #16241c;border-radius:10px;padding:10px 16px;font-weight:600;text-decoration:none;box-shadow:3px 3px 0 #16241c">เปิดปฏิทิน</a></p>
</div>
<p style="max-width:560px;margin:16px auto 0;font-size:11px;color:#4a5a50">อีเมลอัตโนมัติจาก Area Zero Calendar ส่งทุกเช้า 08:00 เฉพาะวันที่มีงานของคุณ</p>
</body></html>`
  return { subject, html }
}
