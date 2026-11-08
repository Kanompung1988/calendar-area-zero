// Demo mode (NEXT_PUBLIC_DEMO=1): in-memory data so the UI runs without Firebase.
import { addDays } from "date-fns"
import type { Item, Member } from "./types"
import { toKey, weekStart } from "./types"
import seed from "@/scripts/seed-selfmade.json"

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1"

export const demoMembers: Member[] = [
  { email: "king@areazeroai.com", name: "King" },
  { email: "fin@areazeroai.com", name: "Fin" },
  { email: "nong@areazeroai.com", name: "Nong" },
  { email: "mild@areazeroai.com", name: "Mild" },
]
export const demoMe = demoMembers[0]

export function demoItems(): Item[] {
  const mon = weekStart(new Date())
  const d = (n: number) => toKey(addDays(mon, n))
  const today = toKey(new Date())
  const base = { assignees: [demoMe.email], createdBy: demoMe.email }
  const ev = (id: string, title: string, day: number, s: number, e: number, extra: Partial<Item> = {}): Item => ({
    id, kind: "event", title, startDate: d(day), endDate: d(day), allDay: false, startMin: s, endMin: e, ...base, ...extra,
  })
  const task = (id: string, title: string, due: number, extra: Partial<Item> = {}): Item => ({
    id, kind: "task", title, startDate: d(due), endDate: d(due), allDay: true, status: "todo", ...base, ...extra,
  })
  const seeded = (seed.items as Omit<Item, "id" | "createdBy">[]).map((it, i) => ({ ...it, id: `seed-${i}`, assignees: [demoMe.email, demoMembers[1].email], createdBy: demoMe.email }) as Item)
  return [
    ev("e1", "Standup ทีม", 0, 570, 600, { recurrence: "weekly", assignees: demoMembers.map((m) => m.email) }),
    ev("e2", "Review KAPI sprint", 1, 840, 930, { project: "KAPI", description: "ดู demo ฟีเจอร์ใหม่ก่อนส่งลูกค้า", assignees: [demoMe.email, demoMembers[2].email] }),
    ev("e3", "Design sync", 1, 870, 900, { project: "JODJAM", assignees: [demoMembers[3].email] }),
    ev("e4", "Client call Selfmade", 4, 660, 720, { project: "Selfmade", description: "เตรียม agenda onsite" }),
    ev("e5", "Content การตลาด", 2, 720, 780, { project: "Nongsai", recurrence: "weekly" }),
    ev("e6", "MEDX demo โรงพยาบาล", 3, 600, 690, { project: "MEDX", assignees: [demoMembers[1].email, demoMembers[2].email] }),
    task("t1", "ส่ง proposal JODJAM", 3, { project: "JODJAM", description: "รอบสอง หลังแก้ตามคอมเมนต์" }),
    task("t2", "แก้ bug export รายงาน MEDX", -2, { project: "MEDX" }),
    task("t3", "สรุป feedback U-Talk", 1, { project: "U-Talk", status: "done" }),
    task("t4", "เตรียมสไลด์ onsite", 4, { project: "Selfmade", status: "doing" }),
    { ...task("t5", "เขียน blog PhatoX", 9, { project: "PhatoX" }), startDate: today },
    ...seeded,
  ]
}
