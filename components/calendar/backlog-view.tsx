"use client"

import { useMemo, useState } from "react"
import { CalendarPlus, Check, Plus } from "lucide-react"
import type { Item, Member } from "@/lib/types"
import { itemColor } from "@/lib/types"

interface Props {
  items: Item[] // undated, not-done tasks
  members: Member[]
  onItemClick: (item: Item) => void
  onToggle: (item: Item) => void
  onQuickAdd: (title: string) => void
}

// "กองงาน": tasks parked without a date, grouped by project. Click a row to give it a date.
export function BacklogView({ items, members, onItemClick, onToggle, onQuickAdd }: Props) {
  const [draft, setDraft] = useState("")
  const groups = useMemo(() => {
    const m = new Map<string, Item[]>()
    for (const it of items) {
      const k = it.project ?? ""
      m.set(k, [...(m.get(k) ?? []), it])
    }
    return [...m.entries()].sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)))
  }, [items])

  const submit = () => {
    const t = draft.trim()
    if (!t) return
    onQuickAdd(t)
    setDraft("")
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-3 py-5 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="board flex items-center gap-2 rounded-xl p-2 pl-3"
        >
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="จดงานที่ยังไม่รู้วัน แล้วกด Enter เช่น งานโรงบาลพี่นัส"
            className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
            aria-label="เพิ่มงานเข้ากองงาน"
          />
          <button type="submit" disabled={!draft.trim()} className="rounded-lg border-2 border-foreground bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">
            เพิ่ม
          </button>
        </form>

        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">กองงานว่าง ทุกงานมีวันแล้ว</p>
        )}

        {groups.map(([project, list]) => {
          const c = itemColor({ project: project || undefined })
          return (
            <section key={project || "_none"}>
              <h3 className="mb-1.5 flex items-center gap-2 px-2 font-display text-sm font-semibold">
                {project ? (
                  <span className="rounded-md border border-foreground/20 px-1.5 py-0.5 text-[11px]" style={{ background: c.bg, color: c.text }}>{project}</span>
                ) : (
                  <span className="text-muted-foreground">ไม่ระบุโปรเจกต์</span>
                )}
                <span className="text-xs font-normal text-muted-foreground">{list.length}</span>
              </h3>
              <div className="border-t border-border/70">
                {list.map((it) => (
                  <div
                    key={it.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onItemClick(it)}
                    onKeyDown={(e) => e.key === "Enter" && onItemClick(it)}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-card focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <button
                      type="button"
                      aria-label="Mark done"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggle(it)
                      }}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-foreground/60 group-hover:border-foreground"
                    >
                      <Check className="h-3 w-3 opacity-0 group-hover:opacity-30" strokeWidth={3} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.title}</p>
                      {it.description && <p className="truncate text-xs text-muted-foreground">{it.description}</p>}
                    </div>
                    {it.status === "doing" && <span className="shrink-0 rounded-md bg-primary/30 px-1.5 py-0.5 text-[10px] font-semibold">กำลังทำ</span>}
                    <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
                      {it.assignees.map((a) => members.find((m) => m.email === a)?.name ?? a.split("@")[0]).join(", ")}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <CalendarPlus className="h-3.5 w-3.5" /> ลงวัน
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
