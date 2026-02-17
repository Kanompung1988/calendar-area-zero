export type EventRecurrence = "once" | "weekly"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  day: number // 0-6 (Monday to Sunday)
  startTime: number // hour number (8-21)
  endTime: number // hour number (9-22)
  participants: string[]
  color: string
  imageUrl?: string
  recurrence: EventRecurrence
  createdAt: string // ISO timestamp from Supabase
}

export const EVENT_COLORS = [
  "teal",
  "blue",
  "emerald",
  "orange",
  "pink",
  "violet",
  "rose",
  "amber",
  "cyan",
  "indigo",
  "lime",
  "red",
] as const

export type EventColor = typeof EVENT_COLORS[number]

export const EVENT_COLOR_CLASSES: Record<EventColor, { bg: string; border: string; text: string; dot: string }> = {
  teal:    { bg: "bg-teal-500/15",    border: "border-teal-500/50",    text: "text-teal-700 dark:text-teal-300",    dot: "bg-teal-500" },
  blue:    { bg: "bg-blue-500/15",    border: "border-blue-500/50",    text: "text-blue-700 dark:text-blue-300",    dot: "bg-blue-500" },
  emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/50", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  orange:  { bg: "bg-orange-500/15",  border: "border-orange-500/50",  text: "text-orange-700 dark:text-orange-300",  dot: "bg-orange-500" },
  pink:    { bg: "bg-pink-500/15",    border: "border-pink-500/50",    text: "text-pink-700 dark:text-pink-300",    dot: "bg-pink-500" },
  violet:  { bg: "bg-violet-500/15",  border: "border-violet-500/50",  text: "text-violet-700 dark:text-violet-300",  dot: "bg-violet-500" },
  rose:    { bg: "bg-rose-500/15",    border: "border-rose-500/50",    text: "text-rose-700 dark:text-rose-300",    dot: "bg-rose-500" },
  amber:   { bg: "bg-amber-500/15",   border: "border-amber-500/50",   text: "text-amber-700 dark:text-amber-300",   dot: "bg-amber-500" },
  cyan:    { bg: "bg-cyan-500/15",    border: "border-cyan-500/50",    text: "text-cyan-700 dark:text-cyan-300",    dot: "bg-cyan-500" },
  indigo:  { bg: "bg-indigo-500/15",  border: "border-indigo-500/50",  text: "text-indigo-700 dark:text-indigo-300",  dot: "bg-indigo-500" },
  lime:    { bg: "bg-lime-500/15",    border: "border-lime-500/50",    text: "text-lime-700 dark:text-lime-300",    dot: "bg-lime-500" },
  red:     { bg: "bg-red-500/15",     border: "border-red-500/50",     text: "text-red-700 dark:text-red-300",     dot: "bg-red-500" },
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export const START_HOUR = 8
export const END_HOUR = 22
export const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getColorClasses(color: string) {
  return EVENT_COLOR_CLASSES[color as EventColor] || EVENT_COLOR_CLASSES.teal
}
