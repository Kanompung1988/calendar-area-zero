// Run: npm test  (node --test with type stripping)
import { test } from "node:test"
import assert from "node:assert/strict"
import { isOverdue, occursOn, type Item } from "./types.ts"

const base: Item = { id: "x", kind: "task", title: "t", startDate: "2026-11-09", endDate: "2026-11-20", allDay: true, assignees: [], createdBy: "me" }

test("range task occurs on every day of its range, inclusive", () => {
  assert.equal(occursOn(base, "2026-11-08"), false)
  assert.equal(occursOn(base, "2026-11-09"), true)
  assert.equal(occursOn(base, "2026-11-20"), true)
  assert.equal(occursOn(base, "2026-11-21"), false)
})

test("weekly event repeats on the same weekday from its start date", () => {
  const ev: Item = { ...base, kind: "event", recurrence: "weekly", startDate: "2026-11-13", endDate: "2026-11-13" } // Friday
  assert.equal(occursOn(ev, "2026-11-06"), false) // before start
  assert.equal(occursOn(ev, "2026-11-13"), true)
  assert.equal(occursOn(ev, "2026-11-20"), true)
  assert.equal(occursOn(ev, "2026-11-19"), false)
})

test("overdue = task past due and not done", () => {
  assert.equal(isOverdue(base, "2026-11-21"), true)
  assert.equal(isOverdue(base, "2026-11-20"), false)
  assert.equal(isOverdue({ ...base, status: "done" }, "2026-11-21"), false)
  assert.equal(isOverdue({ ...base, kind: "event" }, "2026-11-21"), false)
})

test("undated (backlog) task never shows on a day and is never overdue", () => {
  const b: Item = { ...base, startDate: undefined, endDate: undefined }
  assert.equal(occursOn(b, "2026-11-09"), false)
  assert.equal(isOverdue(b, "2027-01-01"), false)
})
