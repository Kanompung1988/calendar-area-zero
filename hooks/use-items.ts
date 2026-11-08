"use client"

import { useEffect, useState } from "react"
import {
  collection, deleteDoc, deleteField, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase/config"
import type { Item } from "@/lib/types"
import { DEMO, demoItems } from "@/lib/demo"

const col = collection(db, "items")

// Firestore rejects `undefined`. Writes use merge/update, so merely dropping a key would leave
// the old value in the document (e.g. a removed image or an unticked "weekly"); send deleteField()
// instead so cleared optional fields are actually cleared.
const withDeletes = (o: object) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === undefined ? deleteField() : v]))
// For brand-new docs there is nothing to delete, so just drop undefined keys.
const clean = (o: object) => JSON.parse(JSON.stringify(o))

const BATCH_MAX = 400 // Firestore allows 500 writes per batch

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (DEMO) {
      setItems(demoItems())
      setLoaded(true)
      return
    }
    return onSnapshot(col, (snap) => {
      setItems(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Item))
      setLoaded(true)
    })
  }, [])

  if (DEMO) {
    return {
      items,
      loaded,
      save: async (item: Item) => setItems((p) => (p.some((i) => i.id === item.id) ? p.map((i) => (i.id === item.id ? item : i)) : [...p, item])),
      patch: async (id: string, data: Partial<Item>) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...data } : i))),
      remove: async (id: string) => setItems((p) => p.filter((i) => i.id !== id)),
      importItems: async (list: Omit<Item, "id">[], createdBy: string) => {
        setItems((p) => [...p, ...list.map((it) => ({ ...it, id: crypto.randomUUID(), createdBy }) as Item)])
        return list.length
      },
    }
  }

  return {
    items,
    loaded,
    save: (item: Item) =>
      setDoc(doc(col, item.id), { ...withDeletes(item), updatedAt: serverTimestamp() }, { merge: true }),
    patch: (id: string, data: Partial<Item>) =>
      updateDoc(doc(col, id), { ...withDeletes(data), updatedAt: serverTimestamp() }),
    remove: (id: string) => deleteDoc(doc(col, id)),
    importItems: async (list: Omit<Item, "id">[], createdBy: string) => {
      for (let i = 0; i < list.length; i += BATCH_MAX) {
        const batch = writeBatch(db)
        for (const it of list.slice(i, i + BATCH_MAX)) {
          batch.set(doc(col), { ...clean(it), createdBy, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
        }
        await batch.commit()
      }
      return list.length
    },
  }
}

export async function uploadImage(file: File): Promise<string> {
  if (DEMO) return URL.createObjectURL(file)
  const r = ref(storage, `items/${crypto.randomUUID()}-${file.name}`)
  await uploadBytes(r, file, { contentType: file.type })
  return getDownloadURL(r)
}
