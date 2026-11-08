"use client"

import { ImagePlus, Trash2, X, XCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { Item, Kind, Member, Status } from "@/lib/types"
import { END_HOUR, PALETTE, PROJECTS, START_HOUR, fmtMin, itemColor } from "@/lib/types"
import { uploadImage } from "@/hooks/use-items"

interface Props {
  open: boolean
  onClose: () => void
  onSave: (item: Item) => void
  onDelete: (id: string) => void
  item: Item | null
  defaults: { dateKey: string; hour: number } // hour -1 = all-day
  members: Member[]
  me: string
}

const inp = "w-full rounded-lg border-2 border-foreground/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
const lbl = "text-xs font-medium text-muted-foreground"
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + (m || 0)
}

export function ItemModal({ open, onClose, onSave, onDelete, item, defaults, members, me }: Props) {
  const [kind, setKind] = useState<Kind>("event")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [project, setProject] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [assignees, setAssignees] = useState<string[]>([])
  const [status, setStatus] = useState<Status>("todo")
  const [recurrence, setRecurrence] = useState(false)
  const [color, setColor] = useState<string | undefined>()
  const [dueTime, setDueTime] = useState("")
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setError("")
    if (item) {
      setKind(item.kind)
      setTitle(item.title)
      setDescription(item.description ?? "")
      setProject(item.project ?? "")
      setStartDate(item.startDate)
      setEndDate(item.endDate)
      setAllDay(item.allDay)
      setStartTime(fmtMin(item.startMin ?? START_HOUR * 60))
      setEndTime(fmtMin(item.endMin ?? START_HOUR * 60 + 60))
      setAssignees(item.assignees)
      setStatus(item.status ?? "todo")
      setRecurrence(item.recurrence === "weekly")
      setColor(item.color)
      setDueTime(item.dueMin !== undefined ? fmtMin(item.dueMin) : "")
      setImageUrl(item.imageUrl)
    } else {
      const h = defaults.hour < 0 ? START_HOUR + 1 : defaults.hour
      setKind(defaults.hour < 0 ? "task" : "event")
      setTitle("")
      setDescription("")
      setProject("")
      setStartDate(defaults.dateKey)
      setEndDate(defaults.dateKey)
      setAllDay(defaults.hour < 0)
      setStartTime(fmtMin(h * 60))
      setEndTime(fmtMin(Math.min(h + 1, END_HOUR) * 60))
      setAssignees([me])
      setStatus("todo")
      setRecurrence(false)
      setColor(undefined)
      setDueTime(defaults.hour < 0 ? "" : fmtMin(h * 60))
      setImageUrl(undefined)
    }
  }, [open, item, defaults, me])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const isTask = kind === "task"
  const timed = !isTask && !allDay

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    if (f.size > 5 * 1024 * 1024) return setError("รูปต้องไม่เกิน 5MB")
    setUploading(true)
    try {
      setImageUrl(await uploadImage(f))
    } catch {
      setError("อัปโหลดรูปไม่สำเร็จ")
    } finally {
      setUploading(false)
    }
  }

  const save = () => {
    if (!title.trim()) return setError("ใส่ชื่องานก่อน")
    const end = timed ? startDate : endDate || startDate
    if (end < startDate) return setError("วันสิ้นสุดต้องไม่ก่อนวันเริ่ม")
    const sMin = toMin(startTime)
    const eMin = toMin(endTime)
    if (timed && eMin <= sMin) return setError("เวลาสิ้นสุดต้องหลังเวลาเริ่ม")
    onSave({
      id: item?.id ?? crypto.randomUUID(),
      kind,
      title: title.trim(),
      description: description.trim() || undefined,
      startDate,
      endDate: end,
      allDay: !timed,
      startMin: timed ? sMin : undefined,
      endMin: timed ? eMin : undefined,
      dueMin: isTask && dueTime ? toMin(dueTime) : undefined,
      color,
      assignees,
      project: project.trim() || undefined,
      status: isTask ? status : undefined,
      imageUrl,
      recurrence: !isTask && recurrence ? "weekly" : undefined,
      remindDaysBefore: item?.remindDaysBefore,
      createdBy: item?.createdBy ?? me,
    })
    onClose()
  }

  const toggleAssignee = (email: string) =>
    setAssignees((a) => (a.includes(email) ? a.filter((x) => x !== email) : [...a, email]))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-foreground/30 animate-in fade-in duration-150" onClick={onClose} />
      <div className="board relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-2xl animate-in slide-in-from-bottom-4 fade-in duration-200 ease-out sm:max-w-lg sm:rounded-2xl sm:slide-in-from-bottom-2">
        <div className="flex items-center justify-between px-5 pt-4 sm:px-6">
          <h3 className="font-display text-lg font-semibold">{item ? "แก้ไข" : "เพิ่มใหม่"}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4 sm:px-6">
          {/* Kind */}
          <div className="flex rounded-lg border-2 border-foreground/70 p-1">
            {(["task", "event"] as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {k === "task" ? "งาน / deadline" : "นัด / ประชุม"}
              </button>
            ))}
          </div>

          <input className={`${inp} font-display text-base`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่องาน..." autoFocus />

          <textarea className={`${inp} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียด..." />

          {/* Dates */}
          {isTask ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className={lbl}>เริ่ม</span>
                <input type="date" className={inp} value={startDate} onChange={(e) => { setStartDate(e.target.value); if (endDate < e.target.value) setEndDate(e.target.value) }} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={lbl}>ครบกำหนด (due)</span>
                <input type="date" className={inp} value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <label className="col-span-2 flex items-center gap-3">
                <span className={`${lbl} shrink-0 whitespace-nowrap`}>เวลาส่ง (ไม่บังคับ)</span>
                <input type="time" step={1800} className={`${inp} w-auto`} value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
                {dueTime && <button type="button" onClick={() => setDueTime("")} className="text-xs text-muted-foreground underline">ไม่ระบุ</button>}
              </label>
            </div>
          ) : (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
                ทั้งวัน
              </label>
              {allDay ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className={lbl}>วันเริ่ม</span>
                    <input type="date" className={inp} value={startDate} onChange={(e) => { setStartDate(e.target.value); if (endDate < e.target.value) setEndDate(e.target.value) }} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={lbl}>วันสิ้นสุด</span>
                    <input type="date" className={inp} value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className={lbl}>วันที่</span>
                    <input type="date" className={inp} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={lbl}>เริ่ม</span>
                    <input type="time" step={1800} className={inp} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className={lbl}>สิ้นสุด</span>
                    <input type="time" step={1800} className={inp} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </label>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={recurrence} onChange={(e) => setRecurrence(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
                ทุกสัปดาห์
              </label>
            </>
          )}

          {/* Project + status */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className={lbl}>โปรเจกต์</span>
              <input list="projects" className={inp} value={project} onChange={(e) => setProject(e.target.value)} placeholder="เช่น JODJAM" />
              <datalist id="projects">
                {Object.keys(PROJECTS).map((p) => <option key={p} value={p} />)}
              </datalist>
            </label>
            {isTask && (
              <label className="flex flex-col gap-1">
                <span className={lbl}>สถานะ</span>
                <select className={inp} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                  <option value="todo">ยังไม่เริ่ม</option>
                  <option value="doing">กำลังทำ</option>
                  <option value="done">เสร็จแล้ว</option>
                </select>
              </label>
            )}
          </div>

          {/* Colour */}
          <div className="flex flex-col gap-1.5">
            <span className={lbl}>สี <span className="opacity-60">(ว่าง = ตามโปรเจกต์)</span></span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setColor(undefined)}
                title="ตามโปรเจกต์"
                className={`flex h-7 items-center rounded-full border-2 px-2 text-[11px] font-medium ${color === undefined ? "border-foreground" : "border-foreground/25 text-muted-foreground"}`}
                style={color === undefined ? { background: itemColor({ project }).bg, color: itemColor({ project }).text } : undefined}
              >
                auto
              </button>
              {Object.entries(PALETTE).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  aria-label={key}
                  onClick={() => setColor(key)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${color === key ? "scale-110 border-foreground" : "border-foreground/20 hover:scale-105"}`}
                  style={{ background: c.bg }}
                >
                  {color === key && <span className="block text-center text-[11px] font-bold leading-6" style={{ color: c.text }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Assignees */}
          <div className="flex flex-col gap-1.5">
            <span className={lbl}>ผู้รับผิดชอบ</span>
            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => {
                const on = assignees.includes(m.email)
                return (
                  <button
                    key={m.email}
                    type="button"
                    onClick={() => toggleAssignee(m.email)}
                    className={`flex items-center gap-1.5 rounded-full border-2 px-2 py-0.5 text-xs font-medium ${on ? "border-foreground bg-primary text-primary-foreground" : "border-foreground/30 text-muted-foreground hover:border-foreground/60"}`}
                  >
                    {m.avatar && <img src={m.avatar} alt="" className="h-4 w-4 rounded-full" referrerPolicy="no-referrer" />}
                    {m.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Image */}
          <div className="flex flex-col gap-1.5">
            <span className={lbl}>รูป</span>
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-lg border-2 border-foreground/70">
                <img src={imageUrl} alt="" className="h-32 w-full object-cover" />
                <button type="button" onClick={() => setImageUrl(undefined)} className="absolute right-2 top-2 rounded-full bg-foreground/70 p-1 text-background" aria-label="Remove image">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-foreground/40 py-4 text-sm text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-50">
                <ImagePlus className="h-4 w-4" /> {uploading ? "กำลังอัปโหลด..." : "เพิ่มรูป"}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button onClick={save} disabled={uploading} className="flex-1 rounded-lg border-2 border-foreground bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50">
              {item ? "บันทึก" : "เพิ่ม"}
            </button>
            {item && (
              <button onClick={() => { onDelete(item.id); onClose() }} className="rounded-lg border-2 border-destructive p-2.5 text-destructive hover:bg-destructive/10" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="rounded-lg border-2 border-foreground/40 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">ยกเลิก</button>
          </div>
        </div>
      </div>
    </div>
  )
}
