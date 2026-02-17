"use client"

import { X, Trash2, ImagePlus, XCircle } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import type { CalendarEvent, EventRecurrence } from "@/lib/calendar-types"
import {
  HOURS,
  formatHour,
  generateId,
  EVENT_COLORS,
  EVENT_COLOR_CLASSES,
  DAYS,
} from "@/lib/calendar-types"
import type { EventColor } from "@/lib/calendar-types"
import { ParticipantList } from "./participant-list"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete?: (id: string) => void
  event?: CalendarEvent | null
  defaultDay?: number
  defaultStartTime?: number
  hasOverlap: (day: number, start: number, end: number, excludeId?: string) => boolean
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  defaultDay = 0,
  defaultStartTime = 9,
  hasOverlap,
}: EventModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [day, setDay] = useState(defaultDay)
  const [startTime, setStartTime] = useState(defaultStartTime)
  const [endTime, setEndTime] = useState(defaultStartTime + 1)
  const [participants, setParticipants] = useState<string[]>([])
  const [colorKey, setColorKey] = useState<EventColor>("teal")
  const [recurrence, setRecurrence] = useState<EventRecurrence>("once")
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined)
  const [error, setError] = useState("")
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setTitle(event.title)
        setDescription(event.description || "")
        setDay(event.day)
        setStartTime(event.startTime)
        setEndTime(event.endTime)
        setParticipants([...event.participants])
        setColorKey((EVENT_COLORS.includes(event.color as EventColor) ? event.color : "teal") as EventColor)
        setRecurrence(event.recurrence || "once")
        setImageUrl(event.imageUrl)
        setImagePreview(event.imageUrl)
      } else {
        setTitle("")
        setDescription("")
        setDay(defaultDay)
        setStartTime(defaultStartTime)
        setEndTime(Math.min(defaultStartTime + 1, 22))
        setParticipants([])
        setColorKey("teal")
        setRecurrence("once")
        setImageUrl(undefined)
        setImagePreview(undefined)
      }
      setError("")
    }
  }, [isOpen, event, defaultDay, defaultStartTime])

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImageUrl(dataUrl)
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }, [])

  const removeImage = useCallback(() => {
    setImageUrl(undefined)
    setImagePreview(undefined)
  }, [])

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    let finalEnd = endTime
    if (finalEnd <= startTime) {
      finalEnd = startTime + 1
    }

    if (hasOverlap(day, startTime, finalEnd, event?.id)) {
      setError("This time slot overlaps with another event")
      return
    }

    const savedEvent: CalendarEvent = {
      id: event?.id || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      day,
      startTime,
      endTime: finalEnd,
      participants,
      color: colorKey,
      imageUrl,
      recurrence,
      createdAt: event?.createdAt || new Date().toISOString(),
    }

    onSave(savedEvent)
    onClose()
  }, [title, description, day, startTime, endTime, participants, colorKey, imageUrl, recurrence, event, hasOverlap, onSave, onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - slides up on mobile, centered on desktop */}
      <div className="glass relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border shadow-2xl sm:max-w-md sm:rounded-2xl">
        {/* Drag indicator on mobile */}
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between px-5 pb-0 pt-4 sm:px-6 sm:pt-6">
          <h3 className="text-lg font-semibold text-foreground">
            {event ? "Edit Event" : "New Event"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-title" className="text-xs font-medium text-muted-foreground">
                Title *
              </label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError("") }}
                placeholder="Event title..."
                autoFocus
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-desc" className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                id="event-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                rows={2}
                className="resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Image Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Image
              </label>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="h-32 w-full object-cover sm:h-40"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/60 text-background transition-colors hover:bg-foreground/80"
                    aria-label="Remove image"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-sm font-medium">Add Image</span>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Day */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-day" className="text-xs font-medium text-muted-foreground">
                Day
              </label>
              <select
                id="event-day"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
            </div>

            {/* Recurrence */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Repeat
              </label>
              <div className="flex rounded-lg border border-input bg-background p-1">
                <button
                  type="button"
                  onClick={() => setRecurrence("once")}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    recurrence === "once"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  One-time
                </button>
                <button
                  type="button"
                  onClick={() => setRecurrence("weekly")}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    recurrence === "weekly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Every week
                </button>
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="event-start" className="text-xs font-medium text-muted-foreground">
                  Start Time
                </label>
                <select
                  id="event-start"
                  value={startTime}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setStartTime(v)
                    if (endTime <= v) setEndTime(v + 1)
                  }}
                  className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{formatHour(h)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="event-end" className="text-xs font-medium text-muted-foreground">
                  End Time
                </label>
                <select
                  id="event-end"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {HOURS.filter((h) => h > startTime).map((h) => (
                    <option key={h} value={h}>{formatHour(h)}</option>
                  ))}
                  <option value={22}>{formatHour(22)}</option>
                </select>
              </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Color</label>
              <div className="grid grid-cols-6 gap-2">
                {EVENT_COLORS.map((key) => {
                  const c = EVENT_COLOR_CLASSES[key]
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColorKey(key)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${c.dot} transition-all ${
                        key === colorKey
                          ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      aria-label={key}
                    >
                      {key === colorKey && (
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Participants */}
            <ParticipantList participants={participants} onChange={setParticipants} />

            {/* Error */}
            {error && (
              <p className="text-xs font-medium text-destructive">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {event ? "Update" : "Create"} Event
              </button>
              {event && onDelete && (
                <button
                  onClick={() => {
                    onDelete(event.id)
                    onClose()
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                  aria-label="Delete event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
