"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Calendar } from "@/components/calendar/calendar"
import { useEffect, useState } from "react"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <main>
        <Calendar />
      </main>
    </ThemeProvider>
  )
}
