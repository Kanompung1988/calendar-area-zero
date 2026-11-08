"use client"

import { useMemo } from "react"
import { addDays, format, isSameMonth, startOfMonth } from "date-fns"
import { th } from "date-fns/locale"
import type { Item } from "@/lib/types"
import { occursOn, toKey, weekStart } from "@/lib/types"
import { ItemChip } from "./item-chip"
import { SpanRow } from "./span-row"

const MAX_TIMED = 2

interface Props {
  month: Date
  items: Item[]
  todayKey: string
  onDayClick: (dateKey: string) => void
  onItemClick: (item: Item) => void
  onToggle: (item: Item) => void
}

export function MonthView({ month, items, todayKey, onDayClick, onItemClick, onToggle }: Props) {
  const weeks = useMemo(() => {
    const first = weekStart(startOfMonth(month))
    return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)))
  }, [month])
  const allDay = useMemo(() => items.filter((i) => i.allDay), [items])
  const timed = useMemo(() => items.filter((i) => !i.allDay), [items])
  const weekdays = weeks[0].map((d) => format(d, "EEEEEE", { locale: th }))

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="grid grid-cols-7 border-b-2 border-foreground bg-card">
        {weekdays.map((w) => (
          <div key={w} className="py-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{w}</div>
        ))}
      </div>
      {weeks.map((days, w) => (
        <div key={w} className="flex min-h-[7.5rem] flex-1 flex-col border-b border-border/70 last:border-b-0">
          {/* day numbers */}
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const key = toKey(d)
              const today = key === todayKey
              const inMonth = isSameMonth(d, month)
              return (
                <div key={key} onClick={() => onDayClick(key)} className={`flex cursor-pointer items-start border-r border-border/50 px-1 pt-1 last:border-r-0 hover:bg-primary/5 ${today ? "bg-primary/10" : ""}`}>
                  <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-display text-xs font-semibold ${today ? "border border-foreground bg-primary text-primary-foreground" : inMonth ? "" : "text-muted-foreground/60"}`}>
                    {d.getDate() === 1 ? format(d, "d MMM", { locale: th }) : format(d, "d")}
                  </span>
                </div>
              )
            })}
          </div>
          <SpanRow days={days} items={allDay} todayKey={todayKey} maxLanes={3} onCellClick={onDayClick} onItemClick={onItemClick} onToggle={onToggle} />
          {/* timed events per day */}
          <div className="grid flex-1 grid-cols-7">
            {days.map((d) => {
              const key = toKey(d)
              const on = timed.filter((it) => occursOn(it, key)).sort((a, b) => (a.startMin ?? 0) - (b.startMin ?? 0))
              return (
                <div key={key} onClick={() => onDayClick(key)} className={`flex cursor-pointer flex-col gap-0.5 border-r border-border/50 p-0.5 pb-1 last:border-r-0 hover:bg-primary/5 ${key === todayKey ? "bg-primary/10" : ""}`}>
                  {on.slice(0, MAX_TIMED).map((it) => (
                    <div key={it.id} onClick={(e) => e.stopPropagation()}>
                      <ItemChip item={it} onClick={onItemClick} showTime />
                    </div>
                  ))}
                  {on.length > MAX_TIMED && <span className="px-1 text-[10px] text-muted-foreground">+{on.length - MAX_TIMED} อีก</span>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
