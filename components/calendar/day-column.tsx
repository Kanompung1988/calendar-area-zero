"use client"

import { useCallback, useState } from "react"
import type { CalendarEvent } from "@/lib/calendar-types"
import { HOURS, START_HOUR } from "@/lib/calendar-types"
import { EventBlock } from "./event-block"

interface DayColumnProps {
  dayIndex: number
  events: CalendarEvent[]
  hourHeight: number
  isToday: boolean
  currentTimeOffset: number | null
  onSlotClick: (day: number, hour: number) => void
  onEventClick: (event: CalendarEvent) => void
  onResize: (id: string, newEndTime: number) => void
  onDrop: (eventId: string, day: number, hour: number) => void
}

export function DayColumn({
  dayIndex,
  events,
  hourHeight,
  isToday,
  currentTimeOffset,
  onSlotClick,
  onEventClick,
  onResize,
  onDrop,
}: DayColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const eventId = e.dataTransfer.getData("text/plain")
      if (!eventId) return

      const rect = e.currentTarget.getBoundingClientRect()
      const y = e.clientY - rect.top
      const hour = Math.floor(y / hourHeight) + START_HOUR
      const clampedHour = Math.max(START_HOUR, Math.min(hour, 21))
      onDrop(eventId, dayIndex, clampedHour)
    },
    [dayIndex, hourHeight, onDrop]
  )

  const handleDragStart = useCallback(() => {
    // No-op, required by EventBlock
  }, [])

  return (
    <div
      className={`relative min-w-0 flex-1 border-r border-border/50 last:border-r-0 transition-colors ${
        isDragOver ? "bg-primary/5" : ""
      } ${isToday ? "bg-primary/[0.03]" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hour grid lines */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="cursor-pointer border-b border-border/50 transition-colors hover:bg-primary/5"
          style={{ height: `${hourHeight}px` }}
          onClick={() => onSlotClick(dayIndex, hour)}
        />
      ))}

      {/* Events */}
      {events.map((event) => (
        <EventBlock
          key={event.id}
          event={event}
          onClick={onEventClick}
          onResize={onResize}
          onDragStart={handleDragStart}
          hourHeight={hourHeight}
        />
      ))}

      {/* Current time indicator */}
      {isToday && currentTimeOffset !== null && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20"
          style={{ top: `${currentTimeOffset}px` }}
        >
          <div className="flex items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
            <div className="h-[2px] flex-1 bg-red-500 shadow-sm shadow-red-500/50" />
          </div>
        </div>
      )}
    </div>
  )
}
