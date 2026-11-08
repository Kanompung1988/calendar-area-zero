import { test } from "node:test"
import assert from "node:assert/strict"
import { buildDigest, isEmpty, renderDigest, type DigestItem } from "./digest.ts"

const me = "king@areazeroai.com"
const other = "tee@areazeroai.com"
const today = "2026-11-09"
const now = Date.parse("2026-11-09T01:00:00Z")
const t = (id: string, endDate: string, extra: Partial<DigestItem> = {}): DigestItem => ({
  id, kind: "task", title: id, startDate: endDate, endDate, allDay: true, assignees: [me], createdBy: me, status: "todo", ...extra,
})

const items: DigestItem[] = [
  t("overdue", "2026-11-05"),
  t("done-overdue", "2026-11-05", { status: "done" }),
  t("due-today", today, { dueMin: 17 * 60 }),
  t("soon", "2026-11-12"),
  t("too-far", "2026-11-13"),
  t("not-mine", today, { assignees: [other] }),
  t("new", "2026-11-20", { createdAtMs: now - 3600_000 }),
  t("old", "2026-11-20", { createdAtMs: now - 48 * 3600_000 }),
  { id: "meeting", kind: "event", title: "meeting", startDate: today, endDate: today, allDay: false, startMin: 600, endMin: 660, assignees: [me], createdBy: me },
  { id: "weekly", kind: "event", title: "weekly", startDate: "2026-11-02", endDate: "2026-11-02", allDay: false, startMin: 570, endMin: 600, recurrence: "weekly", assignees: [me], createdBy: me },
]

test("buckets only my open items; 'soon' is 1-3 days; weekly events recur into today", () => {
  const d = buildDigest(items, me, today, now)
  assert.deepEqual(d.overdue.map((i) => i.id), ["overdue"])
  assert.deepEqual(d.today.map((i) => i.id), ["weekly", "meeting", "due-today"]) // sorted by time
  assert.deepEqual(d.soon.map((i) => i.id), ["soon"])
  assert.deepEqual(d.assigned.map((i) => i.id), ["new"])
})

test("someone with nothing due gets no email", () => {
  assert.equal(isEmpty(buildDigest(items, "nobody@areazeroai.com", today, now)), true)
})

test("render escapes html and links to the app", () => {
  const d = buildDigest([t("<b>x</b>", today)], me, today, now)
  const { subject, html } = renderDigest({ email: me, name: "King" }, d, today, "https://cal.test")
  assert.match(subject, /วันนี้ 1/)
  assert.ok(html.includes("&lt;b&gt;x&lt;/b&gt;") && !html.includes("<b>x</b>"))
  assert.ok(html.includes('href="https://cal.test"'))
})
