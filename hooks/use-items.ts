"use client"

import { useEffect, useState } from "react"
import {
  collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase/config"
import type { Item } from "@/lib/types"
import { DEMO, demoItems } from "@/lib/demo"

const col = collection(db, "items")

// Firestore rejects `undefined`; strip it so optional fields can be cleared.
const clean = (o: object) => JSON.parse(JSON.stringify(o))

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
      setDoc(doc(col, item.id), { ...clean(item), updatedAt: serverTimestamp() }, { merge: true }),
    patch: (id: string, data: Partial<Item>) =>
      updateDoc(doc(col, id), { ...clean(data), updatedAt: serverTimestamp() }),
    remove: (id: string) => deleteDoc(doc(col, id)),
    importItems: async (list: Omit<Item, "id">[], createdBy: string) => {
      const batch = writeBatch(db) // ponytail: 500 writes max per batch, fine for seed files
      for (const it of list) {
        const d = doc(col)
        batch.set(d, { ...clean(it), createdBy, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      }
      await batch.commit()
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
