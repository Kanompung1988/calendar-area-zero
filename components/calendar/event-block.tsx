"use client"

import { Repeat, Users } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import type { Item } from "@/lib/types"
import { START_HOUR, fmtMin, projectColor } from "@/lib/types"

interface Props {
  item: Item
  col: number
  cols: number
  hourHeight: number
  onClick: (item: Item) => void
  onResize: (id: string, endMin: number) => void
}

export function EventBlock({ item, col, cols, hourHeight, onClick, onResize }: Props) {
  const c = projectColor(item.project)
  const start = item.startMin ?? START_HOUR * 60
  const end = item.endMin ?? start + 60
  const [resizing, setResizing] = useState(false)
  const drag = useRef<{ y: number; end: number } | null>(null)

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      setResizing(true)
      drag.current = { y: e.clientY, end }
      let lastSteps = 0
      const move = (me: MouseEvent) => {
        if (!drag.current) return
        const steps = Math.round((me.clientY - drag.current.y) / (hourHeight / 2)) // 30-min steps
        if (steps === lastSteps) return // each call is a Firestore write; only write when the size actually changes
        lastSteps = steps
        onResize(item.id, drag.current.end + steps * 30)
      }
      const up = () => {
        setResizing(false)
        drag.current = null
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
      }
      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", up)
    },
    [end, hourHeight, item.id, onResize]
  )

  const top = ((start - START_HOUR * 60) / 60) * hourHeight
  const height = ((end - start) / 60) * hourHeight - 2

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id)
        e.dataTransfer.effectAllowed = "move"
      }}
      onClick={(e) => {
        if (resizing) return
        e.stopPropagation()
        onClick(item)
      }}
      className="group absolute z-10 cursor-pointer overflow-hidden rounded-md border border-foreground/40 shadow-[2px_2px_0_0_var(--foreground)] transition-shadow hover:shadow-[3px_3px_0_0_var(--foreground)]"
      style={{
        top,
        height,
        left: `calc(${(col / cols) * 100}% + 2px)`,
        width: `calc(${100 / cols}% - 4px)`,
        background: c.bg,
        color: c.text,
      }}
      title={`${item.title}\n${fmtMin(start)} - ${fmtMin(end)}${item.description ? "\n" + item.description : ""}`}
    >
      {item.imageUrl && (
        <img src={item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      <div className="relative flex h-full flex-col px-1.5 py-1">
        <div className="flex items-start gap-1">
          <p className="flex-1 truncate text-xs font-semibold leading-tight">{item.title}</p>
          {item.recurrence === "weekly" && <Repeat className="h-3 w-3 shrink-0 opacity-60" />}
        </div>
        {end - start >= 60 && (
          <p className="truncate text-[10px] opacity-70">
            {fmtMin(start)} - {fmtMin(end)}
          </p>
        )}
        {end - start >= 120 && item.description && (
          <p className="mt-0.5 line-clamp-2 text-[10px] opacity-60">{item.description}</p>
        )}
        {item.assignees.length > 0 && (
          <div className="mt-auto flex items-center gap-1 pt-0.5 text-[10px] opacity-70">
            <Users className="h-2.5 w-2.5" />
            {item.assignees.length}
          </div>
        )}
      </div>
      <div
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100"
      >
        <div className="mx-auto mt-0.5 h-1 w-8 rounded-full bg-current opacity-40" />
      </div>
    </div>
  )
}
