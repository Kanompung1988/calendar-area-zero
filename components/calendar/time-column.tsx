"use client"

import { HOURS, formatHour } from "@/lib/calendar-types"

interface TimeColumnProps {
  hourHeight: number
}

export function TimeColumn({ hourHeight }: TimeColumnProps) {
  return (
    <div className="relative w-14 shrink-0 border-r border-border lg:w-20">
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="relative border-b border-border/50"
          style={{ height: `${hourHeight}px` }}
        >
          <span className="absolute -top-2.5 right-1.5 text-[9px] font-medium text-muted-foreground lg:right-2 lg:text-xs">
            {formatHour(hour)}
          </span>
        </div>
      ))}
    </div>
  )
}
