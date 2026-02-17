"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { startOfWeek, addDays, format, isToday as checkIsToday } from "date-fns"
import type { CalendarEvent } from "@/lib/calendar-types"
import { DAYS_SHORT, START_HOUR } from "@/lib/calendar-types"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { CalendarHeader } from "./calendar-header"
import { TimeColumn } from "./time-column"
import { DayColumn } from "./day-column"
import { EventModal } from "./event-modal"
import { getColorClasses, formatHour } from "@/lib/calendar-types"
import { ImageIcon, Users, Repeat } from "lucide-react"

const HOUR_HEIGHT = 64

export function Calendar() {
  const {
    events,
    isLoaded,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    resizeEvent,
    hasOverlap,
    importEvents,
    exportEvents,
  } = useCalendarEvents()

  const [weekOffset, setWeekOffset] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newSlotDay, setNewSlotDay] = useState(0)
  const [newSlotHour, setNewSlotHour] = useState(9)
  const [currentTimeOffset, setCurrentTimeOffset] = useState<number | null>(null)
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null)

  // Compute week dates
  const weekStart = useMemo(() => {
    const now = new Date()
    const monday = startOfWeek(now, { weekStartsOn: 1 })
    return addDays(monday, weekOffset * 7)
  }, [weekOffset])

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const weekLabel = useMemo(() => {
    const start = weekDates[0]
    const end = weekDates[6]
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "d")} - ${format(end, "d MMMM yyyy")}`
    }
    return `${format(start, "d MMM")} - ${format(end, "d MMM yyyy")}`
  }, [weekDates])

  // Map events by weekday index with week-based filtering
  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {}
    for (let i = 0; i < 7; i++) map[i] = []
    
    events.forEach((e) => {
      // Weekly events: always show
      if (e.recurrence === "weekly") {
        if (map[e.day]) map[e.day].push(e)
      }
      // One-time events: only show in current week (weekOffset === 0)
      else if (e.recurrence === "once" && weekOffset === 0) {
        if (map[e.day]) map[e.day].push(e)
      }
    })
    return map
  }, [events, weekOffset])

  // Current time line
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()

      if (hours >= START_HOUR && hours < 22) {
        setCurrentTimeOffset((hours - START_HOUR + minutes / 60) * HOUR_HEIGHT)
      } else {
        setCurrentTimeOffset(null)
      }

      const jsDay = now.getDay()
      const mondayIndex = jsDay === 0 ? 6 : jsDay - 1
      setCurrentDayIndex(weekOffset === 0 ? mondayIndex : null)
    }

    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [weekOffset])

  const handleSlotClick = useCallback((day: number, hour: number) => {
    setEditingEvent(null)
    setNewSlotDay(day)
    setNewSlotHour(hour)
    setModalOpen(true)
  }, [])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setModalOpen(true)
  }, [])

  const handleSave = useCallback(
    (event: CalendarEvent) => {
      if (editingEvent) {
        updateEvent(event)
      } else {
        addEvent(event)
      }
    },
    [editingEvent, updateEvent, addEvent]
  )

  const handleDrop = useCallback(
    (eventId: string, day: number, hour: number) => {
      moveEvent(eventId, day, hour)
    },
    [moveEvent]
  )

  const handleExport = useCallback(() => {
    const data = exportEvents()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `area-zero-calendar-${format(new Date(), "yyyy-MM-dd")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportEvents])

  const handleImport = useCallback(
    (data: string) => {
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          importEvents(parsed)
        }
      } catch {
        // Invalid JSON
      }
    },
    [importEvents]
  )

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              Connection Error
            </h2>
            <p className="text-sm text-muted-foreground">
              Failed to connect to the database. Please check your Supabase configuration.
            </p>
            <p className="rounded-lg bg-muted px-3 py-2 text-xs font-mono text-destructive">
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <CalendarHeader
        onExport={handleExport}
        onImport={handleImport}
        weekLabel={weekLabel}
        onPrevWeek={() => setWeekOffset((w) => w - 1)}
        onNextWeek={() => setWeekOffset((w) => w + 1)}
        onToday={() => setWeekOffset(0)}
        weekOffset={weekOffset}
      />

      {/* Desktop / Tablet grid view (md and up) */}
      <div className="hidden flex-1 flex-col overflow-hidden md:flex">
        {/* Day headers */}
        <div className="flex border-b border-border bg-card">
          <div className="w-14 shrink-0 border-r border-border lg:w-20" />
          {weekDates.map((date, i) => {
            const today = checkIsToday(date) && weekOffset === 0
            return (
              <div
                key={i}
                className={`flex flex-1 flex-col items-center py-2 lg:py-2.5 ${
                  today ? "bg-primary/5" : ""
                }`}
              >
                <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground lg:text-[10px]">
                  {DAYS_SHORT[i]}
                </span>
                <span
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold lg:h-8 lg:w-8 lg:text-sm ${
                    today
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {format(date, "d")}
                </span>
              </div>
            )
          })}
        </div>

        {/* Grid body */}
        <div className="flex flex-1 overflow-auto">
          <TimeColumn hourHeight={HOUR_HEIGHT} />
          <div className="flex flex-1">
            {weekDates.map((date, i) => (
              <DayColumn
                key={i}
                dayIndex={i}
                events={eventsByDay[i]}
                hourHeight={HOUR_HEIGHT}
                isToday={checkIsToday(date) && weekOffset === 0}
                currentTimeOffset={
                  currentDayIndex === i ? currentTimeOffset : null
                }
                onSlotClick={handleSlotClick}
                onEventClick={handleEventClick}
                onResize={resizeEvent}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view (below md) */}
      <div className="flex flex-1 flex-col overflow-auto md:hidden">
        {weekDates.map((date, i) => {
          const today = checkIsToday(date) && weekOffset === 0
          const dayEvents = eventsByDay[i]
          return (
            <div key={i} className="border-b border-border">
              <div
                className={`flex items-center gap-3 px-4 py-3 ${
                  today ? "bg-primary/5" : "bg-card"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    today
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {format(date, "d")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {DAYS_SHORT[i]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(date, "MMMM yyyy")}
                  </p>
                </div>
                <button
                  onClick={() => handleSlotClick(i, 9)}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  + Add
                </button>
              </div>
              {dayEvents.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs text-muted-foreground">
                  No events
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 px-4 py-2">
                  {dayEvents
                    .sort((a, b) => a.startTime - b.startTime)
                    .map((ev) => {
                      const colors = getColorClasses(ev.color)
                      return (
                        <button
                          key={ev.id}
                          onClick={() => handleEventClick(ev)}
                          className={`flex items-start gap-3 rounded-xl border-l-[3px] ${colors.border} ${colors.bg} p-3 text-left transition-colors hover:shadow-md`}
                        >
                          {/* Time column */}
                          <div className="flex flex-col items-center pt-0.5">
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {formatHour(ev.startTime)}
                            </span>
                            <div className="my-0.5 h-3 w-px bg-border" />
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {formatHour(ev.endTime)}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex flex-1 flex-col gap-1">
                            <p className={`text-sm font-semibold ${colors.text}`}>
                              {ev.title}
                            </p>
                            {ev.description && (
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {ev.description}
                              </p>
                            )}
                            {/* Image thumbnail on mobile */}
                            {ev.imageUrl && (
                              <div className="mt-1 overflow-hidden rounded-lg">
                                <img
                                  src={ev.imageUrl}
                                  alt=""
                                  className="h-20 w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-0.5">
                              {ev.recurrence === "weekly" && (
                                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                  <Repeat className="h-2.5 w-2.5" />
                                  Weekly
                                </span>
                              )}
                              {ev.participants.length > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  <Users className="h-2.5 w-2.5" />
                                  {ev.participants.length}
                                </span>
                              )}
                              {ev.imageUrl && (
                                <span className="flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  <ImageIcon className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingEvent(null)
        }}
        onSave={handleSave}
        onDelete={deleteEvent}
        event={editingEvent}
        defaultDay={newSlotDay}
        defaultStartTime={newSlotHour}
        hasOverlap={hasOverlap}
      />
    </div>
  )
}
