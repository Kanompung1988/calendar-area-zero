"use client"

import { ChevronLeft, ChevronRight, Download, LogOut, Moon, Plus, Sun, Upload } from "lucide-react"
import { useTheme } from "next-themes"
import { useRef } from "react"
import type { Member } from "@/lib/types"

export type View = "week" | "month" | "agenda" | "backlog"

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
  members: Member[]
  who: string | null // assignee email filter
  onWho: (email: string | null) => void
  backlogCount: number
}

const VIEWS: { id: View; label: string }[] = [
  { id: "week", label: "สัปดาห์" },
  { id: "month", label: "เดือน" },
  { id: "agenda", label: "รายการ" },
  { id: "backlog", label: "กองงาน" },
]

const btn = "flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-foreground/70 bg-card px-2.5 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"

export function CalendarHeader({ view, onView, label, onPrev, onNext, onToday, onNew, onExport, onImport, user, onSignOut, members, who, onWho, backlogCount }: Props) {
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
        <div className="flex flex-wrap items-center gap-2">
          {/* people filter */}
          <div className="flex items-center gap-1" role="group" aria-label="กรองตามคน">
            <button
              onClick={() => onWho(null)}
              className={`h-7 rounded-full border-2 px-2 text-[11px] font-medium transition-colors ${who === null ? "border-foreground bg-foreground text-background" : "border-foreground/30 text-muted-foreground hover:border-foreground/60"}`}
            >
              ทุกคน
            </button>
            {members.map((m) => {
              const on = who === m.email
              return (
                <button
                  key={m.email}
                  onClick={() => onWho(on ? null : m.email)}
                  title={m.name}
                  aria-pressed={on}
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full border-2 px-1.5 text-[11px] font-semibold transition-all ${on ? "scale-105 border-foreground bg-primary text-primary-foreground" : "border-foreground/30 bg-card text-muted-foreground hover:border-foreground/60"}`}
                >
                  {m.avatar ? <img src={m.avatar} alt="" className="h-5 w-5 rounded-full" referrerPolicy="no-referrer" /> : m.name.slice(0, 4)}
                </button>
              )
            })}
          </div>
        <div className="flex rounded-lg border-2 border-foreground/70 bg-card p-0.5">
          {VIEWS.map((v) => (
            <button key={v.id} onClick={() => onView(v.id)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === v.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {v.label}
              {v.id === "backlog" && backlogCount > 0 && (
                <span className={`ml-1 rounded-full px-1.5 text-[10px] tabular-nums ${view === v.id ? "bg-primary-foreground/15" : "bg-secondary"}`}>{backlogCount}</span>
              )}
            </button>
          ))}
        </div>
        </div>
      </div>
    </header>
  )
}
