import { addDays, format, parseISO, startOfWeek } from "date-fns"

export type Kind = "event" | "task"
export type Status = "todo" | "doing" | "done"

// Dates are plain "YYYY-MM-DD" (team is in one timezone, Asia/Bangkok) and
// times are minutes from local midnight. No instants, no timezone math.
// ponytail: a timed event cannot cross midnight; split it in two if needed.
export interface Item {
  id: string
  kind: Kind
  title: string
  description?: string
  startDate: string
  endDate: string // inclusive; task: due date
  allDay: boolean
  startMin?: number // only when !allDay
  endMin?: number
  assignees: string[] // member emails
  project?: string
  status?: Status // task only
  imageUrl?: string
  recurrence?: "weekly" // event only: repeats every week from startDate
  remindDaysBefore?: number
  createdBy: string
}

export interface Member {
  email: string // doc id
  name: string
  avatar?: string
  uid?: string
}

export const START_HOUR = 8
export const END_HOUR = 22
export const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

// Project → colour, palettes taken from areazeroai.com academies.
export const PROJECTS: Record<string, { bg: string; text: string }> = {
  KAPI: { bg: "#2f4a3e", text: "#f1f0e6" },
  "U-Talk": { bg: "#3a5a4d", text: "#f1f0e6" },
  "Taro.ai": { bg: "#4a6a58", text: "#f1f0e6" },
  MEDX: { bg: "#ddefea", text: "#0e3b3a" },
  PhatoX: { bg: "#cbe8f3", text: "#0e3b3a" },
  Remedy: { bg: "#bfe3dc", text: "#0e3b3a" },
  JODJAM: { bg: "#f6e3c4", text: "#3b2516" },
  CHAI: { bg: "#f2dccb", text: "#3b2516" },
  Nongsai: { bg: "#fff1bf", text: "#3b2516" },
  Selfmade: { bg: "#dad7f2", text: "#231e33" },
}
export const DEFAULT_COLOR = { bg: "#e6ece4", text: "#16241c" }
export const projectColor = (p?: string) => (p && PROJECTS[p]) || DEFAULT_COLOR

export const toKey = (d: Date) => format(d, "yyyy-MM-dd")
export const fromKey = (k: string) => parseISO(k)
export const weekStart = (d: Date) => startOfWeek(d, { weekStartsOn: 1 })
export const weekDays = (d: Date) => Array.from({ length: 7 }, (_, i) => addDays(weekStart(d), i))
export const fmtMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

export function occursOn(item: Item, key: string): boolean {
  if (item.recurrence === "weekly") {
    return key >= item.startDate && fromKey(key).getDay() === fromKey(item.startDate).getDay()
  }
  return key >= item.startDate && key <= item.endDate
}

export const isOverdue = (item: Item, todayKey: string) =>
  item.kind === "task" && item.status !== "done" && item.endDate < todayKey
