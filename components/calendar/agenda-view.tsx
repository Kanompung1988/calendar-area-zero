"use client"

import { useMemo } from "react"
import { addDays, format } from "date-fns"
import { th } from "date-fns/locale"
import { Check, Repeat } from "lucide-react"
import type { Item, Member } from "@/lib/types"
import { fmtMin, fromKey, isOverdue, occursOn, projectColor, toKey } from "@/lib/types"

const DAYS_AHEAD = 30

interface Props {
  from: Date
  items: Item[]
  members: Member[]
  todayKey: string
  onItemClick: (item: Item) => void
  onToggle: (item: Item) => void
}

// Tasks appear on their due date only (not every day of their range); events on each occurrence.
const agendaOn = (it: Item, key: string) => (it.kind === "task" ? it.endDate === key : occursOn(it, key))

function Avatars({ emails, members }: { emails: string[]; members: Member[] }) {
  return (
    <div className="flex -space-x-1.5">
      {emails.slice(0, 4).map((e) => {
        const m = members.find((x) => x.email === e)
        const name = m?.name ?? e
        return m?.avatar ? (
          <img key={e} src={m.avatar} alt={name} title={name} className="h-5 w-5 rounded-full border border-card" referrerPolicy="no-referrer" />
        ) : (
          <span key={e} title={name} className="flex h-5 w-5 items-center justify-center rounded-full border border-card bg-secondary text-[9px] font-semibold uppercase">
            {name.slice(0, 1)}
          </span>
        )
      })}
    </div>
  )
}

function Row({ it, members, overdue, onItemClick, onToggle }: { it: Item; members: Member[]; overdue?: boolean; onItemClick: (i: Item) => void; onToggle: (i: Item) => void }) {
  const c = projectColor(it.project)
  const done = it.status === "done"
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onItemClick(it)}
      onKeyDown={(e) => e.key === "Enter" && onItemClick(it)}
      className={`group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-card focus-visible:outline-2 focus-visible:outline-primary ${done ? "opacity-50" : ""}`}
    >
      <div className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {it.allDay ? (it.kind === "task" ? "ส่ง" : "ทั้งวัน") : fmtMin(it.startMin!)}
      </div>
      {it.kind === "task" ? (
        <button
          type="button"
          aria-label={done ? "Mark not done" : "Mark done"}
          onClick={(e) => {
            e.stopPropagation()
            onToggle(it)
          }}
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] ${done ? "border-foreground bg-foreground text-background" : overdue ? "border-destructive" : "border-foreground/60 group-hover:border-foreground"}`}
        >
          {done && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>
      ) : (
        <span className="h-4 w-1.5 shrink-0 rounded-full" style={{ background: c.text }} />
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${done ? "line-through" : ""} ${overdue ? "text-destructive" : ""}`}>
          {it.title}
          {it.recurrence === "weekly" && <Repeat className="ml-1.5 inline h-3 w-3 opacity-50" />}
        </p>
        {it.description && <p className="truncate text-xs text-muted-foreground">{it.description}</p>}
      </div>
      {it.project && (
        <span className="hidden shrink-0 rounded-md border border-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold sm:inline" style={{ background: c.bg, color: c.text }}>
          {it.project}
        </span>
      )}
      <Avatars emails={it.assignees} members={members} />
    </div>
  )
}

export function AgendaView({ from, items, members, todayKey, onItemClick, onToggle }: Props) {
  const overdue = useMemo(
    () => items.filter((it) => isOverdue(it, todayKey)).sort((a, b) => a.endDate.localeCompare(b.endDate)),
    [items, todayKey]
  )
  const days = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const key = toKey(addDays(from, i))
        const on = items.filter((it) => agendaOn(it, key)).sort((a, b) => Number(b.allDay) - Number(a.allDay) || (a.startMin ?? 0) - (b.startMin ?? 0))
        return { key, on }
      }).filter((d) => d.on.length > 0),
    [from, items]
  )

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-3 py-5 sm:px-6">
        {overdue.length > 0 && (
          <section>
            <h3 className="mb-1 px-2 font-display text-sm font-semibold text-destructive">เลยกำหนด · {overdue.length}</h3>
            {overdue.map((it) => <Row key={it.id} it={it} members={members} overdue onItemClick={onItemClick} onToggle={onToggle} />)}
          </section>
        )}
        {days.length === 0 && overdue.length === 0 && (
          <div className="board mx-auto mt-10 max-w-xs rounded-2xl p-8 text-center">
            <p className="font-display text-lg">ว่างทั้ง {DAYS_AHEAD} วัน</p>
            <p className="mt-1 text-sm text-muted-foreground">กด "เพิ่ม" เพื่อใส่งานหรือนัดแรก</p>
          </div>
        )}
        {days.map(({ key, on }) => {
          const d = fromKey(key)
          const today = key === todayKey
          return (
            <section key={key} className="flex gap-3">
              <div className="w-12 shrink-0 pt-1 text-center">
                <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full font-display text-lg font-semibold ${today ? "border-2 border-foreground bg-primary text-primary-foreground" : ""}`}>
                  {format(d, "d")}
                </div>
                <div className="mt-0.5 text-[10px] uppercase text-muted-foreground">{format(d, "EEE", { locale: th })}</div>
              </div>
              <div className="min-w-0 flex-1 border-t border-border/70 pt-1">
                {on.map((it) => <Row key={it.id} it={it} members={members} onItemClick={onItemClick} onToggle={onToggle} />)}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
