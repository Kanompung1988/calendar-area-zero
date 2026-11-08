"use client"

import { useMemo } from "react"
import type { Item } from "@/lib/types"
import { isOverdue, occursOn, toKey } from "@/lib/types"
import { ItemChip } from "./item-chip"

export const LANE = 22 // px per lane

interface Props {
  days: Date[]
  items: Item[] // all-day items only
  todayKey: string
  maxLanes?: number
  onCellClick: (dateKey: string) => void
  onItemClick: (item: Item) => void
  onToggle: (item: Item) => void
}

// Multi-day items drawn as one bar across the row, packed into lanes (Google Calendar style).
export function SpanRow({ days, items, todayKey, maxLanes = Infinity, onCellClick, onItemClick, onToggle }: Props) {
  const keys = useMemo(() => days.map(toKey), [days])
  const { bars, hidden, lanes } = useMemo(() => {
    const segs = items
      .map((it) => {
        const on = keys.map((k) => occursOn(it, k))
        const start = on.indexOf(true)
        const end = on.lastIndexOf(true)
        return { it, start, end }
      })
      .filter((s) => s.start >= 0)
      .sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || a.it.title.localeCompare(b.it.title))
    const laneEnd: number[] = [] // last occupied column per lane
    const bars: { it: Item; start: number; end: number; lane: number }[] = []
    const hidden = new Array(keys.length).fill(0)
    for (const s of segs) {
      let lane = laneEnd.findIndex((e) => e < s.start)
      if (lane === -1) lane = laneEnd.length
      if (lane >= maxLanes) {
        for (let c = s.start; c <= s.end; c++) hidden[c]++
        continue
      }
      laneEnd[lane] = s.end
      bars.push({ ...s, lane })
    }
    return { bars, hidden, lanes: laneEnd.length }
  }, [items, keys, maxLanes])

  const extraRow = hidden.some((n) => n > 0) ? 1 : 0
  const height = (lanes + extraRow) * LANE

  return (
    <div className="relative" style={{ minHeight: height }}>
      {/* click targets */}
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${keys.length}, minmax(0, 1fr))` }}>
        {keys.map((k) => (
          <div key={k} className="cursor-pointer border-r border-border/50 last:border-r-0 hover:bg-primary/5" onClick={() => onCellClick(k)} />
        ))}
      </div>
      {bars.map(({ it, start, end, lane }) => (
        <div
          key={it.id}
          className="absolute px-0.5"
          style={{ left: `${(start / keys.length) * 100}%`, width: `${((end - start + 1) / keys.length) * 100}%`, top: lane * LANE + 2, height: LANE - 2 }}
        >
          <ItemChip item={it} onClick={onItemClick} onToggle={onToggle} overdue={isOverdue(it, todayKey)} showTime className="h-full" />
        </div>
      ))}
      {extraRow > 0 &&
        hidden.map((n, c) =>
          n > 0 ? (
            <span key={c} className="absolute px-1.5 text-[10px] leading-[22px] text-muted-foreground" style={{ left: `${(c / keys.length) * 100}%`, top: lanes * LANE }}>
              +{n} อีก
            </span>
          ) : null
        )}
    </div>
  )
}
