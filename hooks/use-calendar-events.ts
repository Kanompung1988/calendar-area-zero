"use client"

import { useState, useEffect, useCallback } from "react"
import type { CalendarEvent } from "@/lib/calendar-types"
import { db } from "@/lib/firebase/config"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"

// DB row shape (snake_case) -> App shape (camelCase)
interface DbRow {
  id: string
  title: string
  description: string | null
  day: number
  start_time: number
  end_time: number
  participants: string[]
  color: string
  image_url: string | null
  recurrence: string
  created_at: string
}

function rowToEvent(row: DbRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    participants: row.participants ?? [],
    color: row.color,
    imageUrl: row.image_url ?? undefined,
    recurrence: (row.recurrence as "once" | "weekly") || "once",
    createdAt: row.created_at,
  }
}

function eventToRow(event: CalendarEvent) {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    day: event.day,
    start_time: event.startTime,
    end_time: event.endTime,
    participants: event.participants,
    color: event.color,
    image_url: event.imageUrl ?? null,
    recurrence: event.recurrence,
  }
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to Firestore real-time updates
  useEffect(() => {
    console.log("[v0] Setting up Firestore real-time listener...")
    
    try {
      const eventsRef = collection(db, 'calendar_events')
      const q = query(eventsRef, orderBy('created_at', 'asc'))
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log("[v0] Received Firestore update, events count:", snapshot.docs.length)
          const fetchedEvents = snapshot.docs.map(doc => {
            const data = doc.data()
            return rowToEvent({
              id: doc.id,
              ...data,
              created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString()
            } as DbRow)
          })
          setEvents(fetchedEvents)
          setIsLoaded(true)
        },
        (err) => {
          console.error("[v0] Firestore listener error:", err)
          setError(err.message)
          setIsLoaded(true)
        }
      )

      return () => {
        console.log("[v0] Cleaning up Firestore listener")
        unsubscribe()
      }
    } catch (err) {
      console.error("[v0] Error setting up Firestore:", err)
      setError(err instanceof Error ? err.message : "Failed to connect to Firestore")
      setIsLoaded(true)
    }
  }, [])

  const addEvent = useCallback(
    async (event: CalendarEvent) => {
      // Optimistic update
      setEvents((prev) => [...prev, event])

      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventToRow(event)),
        })

        if (!response.ok) {
          console.error("[v0] Failed to add event")
          // Rollback
          setEvents((prev) => prev.filter((e) => e.id !== event.id))
        }
      } catch (error) {
        console.error("[v0] Failed to add event:", error)
        setEvents((prev) => prev.filter((e) => e.id !== event.id))
      }
    },
    []
  )

  const updateEvent = useCallback(
    async (updated: CalendarEvent) => {
      // Optimistic update
      setEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      )

      try {
        const response = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventToRow(updated)),
        })

        if (!response.ok) {
          console.error("[v0] Failed to update event")
        }
      } catch (error) {
        console.error("[v0] Failed to update event:", error)
      }
    },
    []
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      const prev = events
      setEvents((p) => p.filter((e) => e.id !== id))

      try {
        const response = await fetch(`/api/events?id=${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          console.error("[v0] Failed to delete event")
          setEvents(prev)
        }
      } catch (error) {
        console.error("[v0] Failed to delete event:", error)
        setEvents(prev)
      }
    },
    [events]
  )

  const moveEvent = useCallback(
    async (id: string, day: number, startTime: number) => {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e
          const duration = e.endTime - e.startTime
          const newEnd = Math.min(startTime + duration, 22)
          const newStart = Math.max(newEnd - duration, 8)
          return { ...e, day, startTime: newStart, endTime: newEnd }
        })
      )

      const found = events.find((e) => e.id === id)
      if (found) {
        const duration = found.endTime - found.startTime
        const newEnd = Math.min(startTime + duration, 22)
        const newStart = Math.max(newEnd - duration, 8)
        
        const updated = { ...found, day, startTime: newStart, endTime: newEnd }
        
        try {
          await fetch('/api/events', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventToRow(updated)),
          })
        } catch (error) {
          console.error("[v0] Failed to move event:", error)
        }
      }
    },
    [events]
  )

  const resizeEvent = useCallback(
    async (id: string, newEndTime: number) => {
      const found = events.find((e) => e.id === id)
      if (!found) return
      const clamped = Math.min(Math.max(newEndTime, found.startTime + 1), 22)

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, endTime: clamped } : e))
      )

      const updated = { ...found, endTime: clamped }

      try {
        await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventToRow(updated)),
        })
      } catch (error) {
        console.error("[v0] Failed to resize event:", error)
      }
    },
    [events]
  )

  const hasOverlap = useCallback(
    (day: number, startTime: number, endTime: number, excludeId?: string) => {
      return events.some(
        (e) =>
          e.day === day &&
          e.id !== excludeId &&
          startTime < e.endTime &&
          endTime > e.startTime
      )
    },
    [events]
  )

  const importEvents = useCallback(
    async (imported: CalendarEvent[]) => {
      try {
        // Clear existing events
        for (const event of events) {
          await fetch(`/api/events?id=${event.id}`, { method: 'DELETE' })
        }

        // Insert all imported events
        for (const event of imported) {
          await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventToRow(event)),
          })
        }

        setEvents(imported)
      } catch (error) {
        console.error("[v0] Failed to import events:", error)
      }
    },
    [events]
  )

  const exportEvents = useCallback(() => {
    return JSON.stringify(events, null, 2)
  }, [events])

  return {
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
  }
}
