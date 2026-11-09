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
  startDate?: string // task without dates = backlog ("กองงาน"); events always have dates
  endDate?: string // inclusive; task: due date
  allDay: boolean
  startMin?: number // event only, when !allDay
  endMin?: number
  dueMin?: number // task only: optional time of day for the deadline
  assignees: string[] // member emails
  project?: string
  color?: string // PALETTE key; when absent, colour follows the project
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

// Colours taken from areazeroai.com academies. Items pick one directly, or inherit from their project.
export const PALETTE: Record<string, { bg: string; text: string }> = {
  forest: { bg: "#2f4a3e", text: "#f1f0e6" },
  moss: { bg: "#4a6a58", text: "#f1f0e6" },
  mint: { bg: "#ddefea", text: "#0e3b3a" },
  sky: { bg: "#cbe8f3", text: "#0e3b3a" },
  sand: { bg: "#f6e3c4", text: "#3b2516" },
  peach: { bg: "#f2dccb", text: "#3b2516" },
  butter: { bg: "#fff1bf", text: "#3b2516" },
  lavender: { bg: "#dad7f2", text: "#231e33" },
  rose: { bg: "#f3d6d3", text: "#5a1f1a" },
  slate: { bg: "#e6ece4", text: "#16241c" },
}
export const PROJECTS: Record<string, string> = {
  KAPI: "forest", "U-Talk": "moss", "Taro.ai": "moss",
  MEDX: "mint", PhatoX: "sky", Remedy: "mint",
  JODJAM: "sand", CHAI: "peach", Nongsai: "butter",
  Selfmade: "lavender",
}
export const itemColor = (it: Pick<Item, "color" | "project">) =>
  PALETTE[it.color ?? ""] ?? PALETTE[PROJECTS[it.project ?? ""] ?? "slate"]

export const toKey = (d: Date) => format(d, "yyyy-MM-dd")
export const fromKey = (k: string) => parseISO(k)
export const weekStart = (d: Date) => startOfWeek(d, { weekStartsOn: 1 })
export const weekDays = (d: Date) => Array.from({ length: 7 }, (_, i) => addDays(weekStart(d), i))
export const fmtMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

export const isDated = (item: Item): item is Item & { startDate: string; endDate: string } => !!item.startDate && !!item.endDate

export function occursOn(item: Item, key: string): boolean {
  if (!isDated(item)) return false
  if (item.recurrence === "weekly") {
    return key >= item.startDate && fromKey(key).getDay() === fromKey(item.startDate).getDay()
  }
  return key >= item.startDate && key <= item.endDate
}

export const isOverdue = (item: Item, todayKey: string) =>
  item.kind === "task" && item.status !== "done" && !!item.endDate && item.endDate < todayKey
