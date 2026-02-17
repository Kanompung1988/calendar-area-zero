"use client"

import Image from "next/image"
import { Moon, Sun, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { useRef } from "react"
import { AREA_ZERO_LOGO, AI_CHARACTER_AVATAR } from "@/lib/images"

interface CalendarHeaderProps {
  onExport: () => void
  onImport: (data: string) => void
  weekLabel: string
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
  weekOffset?: number // เพิ่มเพื่อแสดงสถานะสัปดาห์
}

export function CalendarHeader({
  onExport,
  onImport,
  weekLabel,
  onPrevWeek,
  onNextWeek,
  onToday,
  weekOffset = 0,
}: CalendarHeaderProps) {
  const { theme, setTheme } = useTheme()
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      onImport(text)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
      {/* Top row: logo, actions, mascot */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img
            src={AREA_ZERO_LOGO}
            alt="Area Zero AI Software House"
            className="h-8 w-auto sm:h-10 lg:h-12"
          />
          <div className="hidden sm:block text-xs font-medium text-muted-foreground">
            AI SOFTWARE HOUSE
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-2 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 sm:px-3 sm:py-2"
            title="Import JSON"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-2 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 sm:px-3 sm:py-2"
            title="Export JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 sm:h-9 sm:w-9"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="ml-1 hidden lg:block">
            <img
              src={AI_CHARACTER_AVATAR}
              alt="Area Zero AI Assistant"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/30 animate-pulse"
            />
          </div>
        </div>
      </div>

      {/* Bottom row: week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onPrevWeek}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onToday}
            className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-3 sm:py-1.5 sm:text-xs"
          >
            Today
          </button>
          <button
            onClick={onNextWeek}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-foreground sm:text-sm lg:text-base">{weekLabel}</h2>
          {weekOffset !== 0 && (
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              {weekOffset > 0 ? `+${weekOffset}w` : `${weekOffset}w`}
            </span>
          )}
          {weekOffset === 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary font-medium">
              Current Week
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
