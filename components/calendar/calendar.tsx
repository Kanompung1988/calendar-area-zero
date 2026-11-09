"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { addDays, addMonths, format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"
import type { Item, Member } from "@/lib/types"
import { END_HOUR, isDated, toKey, weekDays, weekStart } from "@/lib/types"
import { useItems } from "@/hooks/use-items"
import { CalendarHeader, type View } from "./calendar-header"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"
import { AgendaView } from "./agenda-view"
import { BacklogView } from "./backlog-view"
import { ItemModal } from "./item-modal"

interface Props {
  me: { email: string; name: string; avatar?: string | null }
  members: Member[]
  onSignOut: () => void
}

export function Calendar({ me, members, onSignOut }: Props) {
  const { items, loaded, save, patch, remove, importItems } = useItems()
  const [view, setView] = useState<View>("week")
  const [who, setWho] = useState<string | null>(null)
  const [cursor, setCursor] = useState(() => new Date())
  const [modal, setModal] = useState<{ open: boolean; item: Item | null; defaults: { dateKey: string; hour: number; undated?: boolean } }>({
    open: false,
    item: null,
    defaults: { dateKey: toKey(new Date()), hour: 9 },
  })
  const todayKey = toKey(new Date())

  useEffect(() => {
    if (window.innerWidth < 768) setView("agenda")
  }, [])

  const visible = useMemo(() => (who ? items.filter((i) => i.assignees.includes(who)) : items), [items, who])
  const backlog = useMemo(() => visible.filter((i) => i.kind === "task" && !isDated(i) && i.status !== "done"), [visible])
  const days = useMemo(() => weekDays(cursor), [cursor])
  const label = useMemo(() => {
    if (view === "month") return format(cursor, "MMMM yyyy", { locale: th })
    if (view === "agenda") return `30 วันจาก ${format(cursor, "d MMM", { locale: th })}`
    if (view === "backlog") return "งานที่ยังไม่ลงวัน"
    const [a, b] = [days[0], days[6]]
    return a.getMonth() === b.getMonth()
      ? `${format(a, "d")} – ${format(b, "d MMM yyyy", { locale: th })}`
      : `${format(a, "d MMM", { locale: th })} – ${format(b, "d MMM yyyy", { locale: th })}`
  }, [view, cursor, days])

  const step = view === "month" ? (n: number) => addMonths(cursor, n) : (n: number) => addDays(cursor, 7 * n)

  const openNew = useCallback((dateKey: string, hour: number, undated = false) => setModal({ open: true, item: null, defaults: { dateKey, hour, undated } }), [])
  const openEdit = useCallback((item: Item) => setModal((m) => ({ ...m, open: true, item })), [])
  const close = useCallback(() => setModal((m) => ({ ...m, open: false, item: null })), [])

  const toggle = (it: Item) => patch(it.id, { status: it.status === "done" ? "todo" : "done" })
  const move = (id: string, dateKey: string, startMin: number) => {
    const it = items.find((i) => i.id === id)
    if (!it || it.allDay) return
    const dur = (it.endMin ?? 0) - (it.startMin ?? 0)
    const end = Math.min(startMin + dur, END_HOUR * 60)
    patch(id, { startDate: dateKey, endDate: dateKey, startMin: end - dur, endMin: end })
  }
  const resize = (id: string, endMin: number) => {
    const it = items.find((i) => i.id === id)
    if (!it || it.startMin === undefined) return
    patch(id, { endMin: Math.min(Math.max(endMin, it.startMin + 30), END_HOUR * 60) })
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `area-zero-calendar-${todayKey}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importJson = async (text: string) => {
    try {
      const parsed = JSON.parse(text)
      const list: unknown[] = Array.isArray(parsed) ? parsed : parsed.items
      if (!Array.isArray(list)) throw new Error("no items")
      const ok = list.filter((x): x is Omit<Item, "id"> => {
        const o = x as Partial<Item>
        const dated = !!o?.startDate && !!o?.endDate
        return !!o?.title && (o.kind === "task" ? dated || (!o.startDate && !o.endDate) : o.kind === "event" && dated)
      })
      if (ok.length === 0) throw new Error("ไม่พบรายการที่มี title/kind (event ต้องมี startDate/endDate)")
      const n = await importItems(
        ok.map(({ id: _id, ...rest }: Partial<Item>) => ({ assignees: [], allDay: true, ...rest })) as Omit<Item, "id">[],
        me.email
      )
      toast.success(`นำเข้า ${n} รายการ${ok.length < list.length ? ` (ข้าม ${list.length - ok.length})` : ""}`)
    } catch (e) {
      toast.error(`นำเข้าไม่สำเร็จ: ${e instanceof Error ? e.message : "JSON ผิดรูปแบบ"}`)
    }
  }

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <CalendarHeader
        view={view}
        onView={setView}
        label={label}
        onPrev={() => setCursor(step(-1))}
        onNext={() => setCursor(step(1))}
        onToday={() => setCursor(new Date())}
        onNew={() => openNew(todayKey, -1, view === "backlog")}
        onExport={exportJson}
        onImport={importJson}
        user={me}
        onSignOut={onSignOut}
        members={members}
        who={who}
        onWho={setWho}
        backlogCount={backlog.length}
      />
      <div className="flex flex-1 overflow-auto">
        {view === "week" && (
          <WeekView days={days} items={visible} todayKey={todayKey} onSlotClick={openNew} onItemClick={openEdit} onToggle={toggle} onMove={move} onResize={resize} />
        )}
        {view === "month" && (
          <MonthView month={cursor} items={visible} todayKey={todayKey} onDayClick={(k) => openNew(k, -1)} onItemClick={openEdit} onToggle={toggle} />
        )}
        {view === "backlog" && (
          <BacklogView
            items={backlog}
            members={members}
            onItemClick={openEdit}
            onToggle={toggle}
            onQuickAdd={(title) =>
              save({ id: crypto.randomUUID(), kind: "task", title, allDay: true, status: "todo", assignees: who ? [who] : [me.email], createdBy: me.email }).catch(() => toast.error("บันทึกไม่สำเร็จ"))
            }
          />
        )}
        {view === "agenda" && <AgendaView from={weekStart(cursor)} items={visible} members={members} todayKey={todayKey} onItemClick={openEdit} onToggle={toggle} />}
      </div>
      <ItemModal
        open={modal.open}
        onClose={close}
        onSave={(it) => save(it).catch(() => toast.error("บันทึกไม่สำเร็จ"))}
        onDelete={(id) => remove(id).catch(() => toast.error("ลบไม่สำเร็จ"))}
        item={modal.item}
        defaults={modal.defaults}
        members={members}
        me={me.email}
      />
    </div>
  )
}
