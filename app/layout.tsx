import type { Metadata, Viewport } from "next"
import { Anuphan, Mitr } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const anuphan = Anuphan({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-anuphan" })
const mitr = Mitr({ subsets: ["thai", "latin"], weight: ["400", "500", "600"], variable: "--font-mitr" })

export const metadata: Metadata = {
  title: "Area Zero Calendar",
  description: "ปฏิทินงานและ deadline ของทีม Area Zero",
  icons: {
    icon: {
      url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect x="2" y="2" width="28" height="28" rx="6" fill="%23f5c443" stroke="%2316241c" stroke-width="2"/%3E%3Ctext x="16" y="21" text-anchor="middle" fill="%2316241c" font-size="12" font-weight="bold"%3EAZ%3C/text%3E%3C/svg%3E',
      type: "image/svg+xml",
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#1d2330" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${anuphan.variable} ${mitr.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
