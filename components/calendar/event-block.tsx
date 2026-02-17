"use client"

import { Users, ImageIcon, Repeat } from "lucide-react"
import type { CalendarEvent } from "@/lib/calendar-types"
import { getColorClasses, formatHour } from "@/lib/calendar-types"
import { AI_CHARACTER_AVATAR } from "@/lib/images"
import { useState, useRef, useCallback } from "react"

interface EventBlockProps {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
  onResize: (id: string, newEndTime: number) => void
  onDragStart: (event: CalendarEvent) => void
  hourHeight: number
}

export function EventBlock({
  event,
  onClick,
  onResize,
  onDragStart,
  hourHeight,
}: EventBlockProps) {
  const colors = getColorClasses(event.color)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<{
    startY: number
    startEndTime: number
  } | null>(null)

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      setIsResizing(true)
      resizeRef.current = {
        startY: e.clientY,
        startEndTime: event.endTime,
      }

      const handleMouseMove = (me: MouseEvent) => {
        if (!resizeRef.current) return
        const diff = me.clientY - resizeRef.current.startY
        const hoursDiff = Math.round(diff / hourHeight)
        const newEnd = resizeRef.current.startEndTime + hoursDiff
        onResize(event.id, newEnd)
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        resizeRef.current = null
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    },
    [event.id, event.endTime, hourHeight, onResize]
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", event.id)
      e.dataTransfer.effectAllowed = "move"
      onDragStart(event)
    },
    [event, onDragStart]
  )

  const duration = event.endTime - event.startTime

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        if (isResizing) return
        e.stopPropagation()
        onClick(event)
      }}
      className={`group absolute inset-x-1 z-10 cursor-pointer overflow-hidden rounded-lg border-l-[3px] ${colors.border} ${colors.bg} transition-shadow hover:shadow-lg`}
      style={{
        top: `${(event.startTime - 8) * hourHeight}px`,
        height: `${duration * hourHeight - 2}px`,
      }}
      title={`${event.title}\n${formatHour(event.startTime)} - ${formatHour(event.endTime)}${event.description ? "\n" + event.description : ""}`}
    >
      {/* AI Character avatar or custom image */}
      <div className="absolute inset-0">
        <img
          src={event.imageUrl || AI_CHARACTER_AVATAR}
          alt=""
          className="h-full w-full object-cover opacity-25 dark:opacity-20"
          crossOrigin="anonymous"
        />
        <div className={`absolute inset-0 ${colors.bg}`} />
      </div>

      <div className="relative flex h-full flex-col px-2 py-1">
        <div className="flex items-start gap-1">
          <p className={`flex-1 truncate text-xs font-semibold leading-tight ${colors.text}`}>
            {event.title}
          </p>
          {event.recurrence === "weekly" && (
            <Repeat className={`h-3 w-3 shrink-0 ${colors.text} opacity-60`} />
          )}
          <ImageIcon className={`h-3 w-3 shrink-0 ${colors.text} opacity-60`} />
        </div>
        {duration >= 2 && (
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {formatHour(event.startTime)} - {formatHour(event.endTime)}
          </p>
        )}
        {duration >= 2 && event.description && (
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
            {event.description}
          </p>
        )}
        {duration >= 3 && (
          <div className="mt-1 flex-1 overflow-hidden rounded">
            <img
              src={event.imageUrl || AI_CHARACTER_AVATAR}
              alt=""
              className="h-full w-full rounded object-cover"
              crossOrigin="anonymous"
            />
          </div>
        )}
        {event.participants.length > 0 && (
          <div className="mt-auto flex items-center gap-1 pt-0.5">
            <Users className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {event.participants.length}
            </span>
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-0.5 h-1 w-8 rounded-full bg-muted-foreground/30" />
      </div>
    </div>
  )
}
