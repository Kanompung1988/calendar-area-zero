"use client"

import { Check, Repeat } from "lucide-react"
import type { Item } from "@/lib/types"
import { fmtMin, itemColor } from "@/lib/types"

interface Props {
  item: Item
  onClick: (item: Item) => void
  onToggle?: (item: Item) => void
  showTime?: boolean
  overdue?: boolean
  className?: string
}

export function ItemChip({ item, onClick, onToggle, showTime, overdue, className = "" }: Props) {
  const c = itemColor(item)
  const done = item.status === "done"
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => e.key === "Enter" && onClick(item)}
      className={`flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-md border px-1.5 text-left text-[11px] font-medium leading-[18px] transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
        overdue ? "border-destructive border-dashed" : "border-foreground/25"
      } ${done ? "opacity-50" : ""} ${className}`}
      style={{ background: c.bg, color: c.text }}
      title={item.title}
    >
      {item.kind === "task" && onToggle && (
        <button
          type="button"
          aria-label={done ? "Mark not done" : "Mark done"}
          onClick={(e) => {
            e.stopPropagation()
            onToggle(item)
          }}
          className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] border-current ${done ? "bg-current" : ""}`}
        >
          {done && <Check className="h-2.5 w-2.5" style={{ color: c.bg }} strokeWidth={3} />}
        </button>
      )}
      {showTime && (item.allDay ? item.dueMin : item.startMin) !== undefined && (
        <span className="shrink-0 tabular-nums opacity-70">{fmtMin((item.allDay ? item.dueMin : item.startMin)!)}</span>
      )}
      <span className={`truncate ${done ? "line-through" : ""}`}>{item.title}</span>
      {item.recurrence === "weekly" && <Repeat className="ml-auto h-2.5 w-2.5 shrink-0 opacity-50" />}
    </div>
  )
}
