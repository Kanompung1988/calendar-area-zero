"use client"

import { ChevronLeft, ChevronRight, Download, LogOut, Moon, Plus, Sun, Upload } from "lucide-react"
import { useTheme } from "next-themes"
import { useRef } from "react"

export type View = "week" | "month" | "agenda"

interface Props {
  view: View
  onView: (v: View) => void
  label: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNew: () => void
  onExport: () => void
  onImport: (text: string) => void
  user: { name: string; avatar?: string | null }
  onSignOut: () => void
}

const VIEWS: { id: View; label: string }[] = [
  { id: "week", label: "สัปดาห์" },
  { id: "month", label: "เดือน" },
  { id: "agenda", label: "รายการ" },
]

const btn = "flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-foreground/70 bg-card px-2.5 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"

export function CalendarHeader({ view, onView, label, onPrev, onNext, onToday, onNew, onExport, onImport, user, onSignOut }: Props) {
  const { theme, setTheme } = useTheme()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="flex flex-col gap-2 border-b-2 border-foreground bg-card px-3 py-2 sm:px-4 lg:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight">Area Zero</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">calendar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onNew} className={`${btn} border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--foreground)]`}>
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">เพิ่ม</span>
          </button>
          <button onClick={() => fileRef.current?.click()} className={btn} title="Import JSON">
            <Upload className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ""
              f?.text().then(onImport)
            }}
          />
          <button onClick={onExport} className={btn} title="Export JSON">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={btn} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button onClick={onSignOut} className={`${btn} pl-1`} title={`${user.name} · sign out`}>
            {user.avatar ? <img src={user.avatar} alt="" className="h-5 w-5 rounded-full" referrerPolicy="no-referrer" /> : <LogOut className="h-3.5 w-3.5" />}
            <span className="hidden max-w-[8rem] truncate lg:inline">{user.name}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <button onClick={onPrev} className={`${btn} w-8 justify-center px-0`} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={onToday} className={btn}>วันนี้</button>
          <button onClick={onNext} className={`${btn} w-8 justify-center px-0`} aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
          <h2 className="ml-1.5 truncate font-display text-sm font-semibold sm:ml-2 sm:text-base">{label}</h2>
        </div>
        <div className="flex rounded-lg border-2 border-foreground/70 bg-card p-0.5">
          {VIEWS.map((v) => (
            <button key={v.id} onClick={() => onView(v.id)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === v.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
