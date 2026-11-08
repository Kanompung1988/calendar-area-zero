"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import type { Item } from "@/lib/types"
import { END_HOUR, HOURS, START_HOUR, fmtMin, occursOn, toKey } from "@/lib/types"
import { EventBlock } from "./event-block"
import { SpanRow } from "./span-row"

const HOUR_HEIGHT = 64

interface Props {
  days: Date[]
  items: Item[]
  todayKey: string
  onSlotClick: (dateKey: string, hour: number) => void
  onItemClick: (item: Item) => void
  onToggle: (item: Item) => void
  onMove: (id: string, dateKey: string, startMin: number) => void
  onResize: (id: string, endMin: number) => void
}

// Greedy column packing so overlapping events sit side by side.
// ponytail: columns are shared across the whole day, not per overlap cluster.
function pack(evs: Item[]) {
  const sorted = [...evs].sort((a, b) => (a.startMin! - b.startMin!) || (b.endMin! - a.endMin!))
  const ends: number[] = []
  const col = new Map<string, number>()
  for (const e of sorted) {
    let c = ends.findIndex((end) => end <= e.startMin!)
    if (c === -1) c = ends.length
    ends[c] = e.endMin!
    col.set(e.id, c)
  }
  return { col, cols: Math.max(1, ends.length) }
}

export function WeekView({ days, items, todayKey, onSlotClick, onItemClick, onToggle, onMove, onResize }: Props) {
  const [nowOffset, setNowOffset] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      const min = n.getHours() * 60 + n.getMinutes()
      setNowOffset(min >= START_HOUR * 60 && min < END_HOUR * 60 ? ((min - START_HOUR * 60) / 60) * HOUR_HEIGHT : null)
    }
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [])

  const allDay = useMemo(() => items.filter((i) => i.allDay), [items])
  const byDay = useMemo(
    () =>
      days.map((d) => {
        const key = toKey(d)
        return { key, timed: items.filter((i) => !i.allDay && occursOn(i, key)) }
      }),
    [days, items]
  )

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const hour = Math.max(START_HOUR, Math.min(Math.floor(y / HOUR_HEIGHT) + START_HOUR, END_HOUR - 1))
    onMove(id, key, hour * 60)
  }

  return (
    <div className="flex min-w-[720px] flex-1 flex-col overflow-hidden">
      {/* Day headers */}
      <div className="flex border-b-2 border-foreground bg-card">
        <div className="w-14 shrink-0 border-r border-border" />
        {days.map((d, i) => {
          const today = byDay[i].key === todayKey
          return (
            <div key={i} className={`flex flex-1 flex-col items-center py-1.5 ${today ? "bg-primary/20" : ""}`}>
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{format(d, "EEEEEE", { locale: th })}</span>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-semibold ${today ? "bg-primary text-primary-foreground border border-foreground" : ""}`}>
                {format(d, "d")}
              </span>
            </div>
          )
        })}
      </div>

      {/* All-day row: tasks and all-day events as spanning bars */}
      <div className="flex border-b border-border bg-card/60">
        <div className="flex w-14 shrink-0 items-start justify-end border-r border-border pr-1.5 pt-1.5 text-[9px] text-muted-foreground">ทั้งวัน</div>
        <div className="min-h-[28px] flex-1 py-0.5">
          <SpanRow days={days} items={allDay} todayKey={todayKey} onCellClick={(k) => onSlotClick(k, -1)} onItemClick={onItemClick} onToggle={onToggle} />
        </div>
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-y-auto">
        <div className="relative w-14 shrink-0 border-r border-border">
          {HOURS.map((h) => (
            <div key={h} className="relative border-b border-border/50" style={{ height: HOUR_HEIGHT }}>
              <span className="absolute -top-2 right-1.5 text-[10px] tabular-nums text-muted-foreground">{fmtMin(h * 60)}</span>
            </div>
          ))}
        </div>
        {byDay.map(({ key, timed }) => {
          const { col, cols } = pack(timed)
          const today = key === todayKey
          return (
            <div
              key={key}
              className={`relative min-w-0 flex-1 border-r border-border/50 last:border-r-0 ${today ? "bg-primary/[0.06]" : ""}`}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
              }}
              onDrop={(e) => handleDrop(e, key)}
            >
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="cursor-pointer border-b border-border/50 hover:bg-primary/10"
                  style={{ height: HOUR_HEIGHT }}
                  onClick={() => onSlotClick(key, h)}
                />
              ))}
              {timed.map((it) => (
                <EventBlock key={it.id} item={it} col={col.get(it.id) ?? 0} cols={cols} hourHeight={HOUR_HEIGHT} onClick={onItemClick} onResize={onResize} />
              ))}
              {today && nowOffset !== null && (
                <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: nowOffset }}>
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                  <div className="h-[2px] flex-1 bg-destructive" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
