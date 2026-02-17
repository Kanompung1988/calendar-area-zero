import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: 'Area Zero Calendar - AI Software House',
  description: 'Modern weekly calendar powered by Area Zero AI Software House - Real-time sync with Firebase',
  keywords: ['calendar', 'scheduling', 'area zero', 'ai software house', 'real-time', 'firebase'],
  authors: [{ name: 'Area Zero AI Software House' }],
  creator: 'Area Zero AI Software House',
  publisher: 'Area Zero AI Software House',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="14" fill="%2300D4AA"/%3E%3Ctext x="16" y="21" text-anchor="middle" fill="white" font-size="12" font-weight="bold"%3EAZ%3C/text%3E%3C/svg%3E',
        sizes: '32x32',
        type: 'image/svg+xml',
      },
    ],
    apple: {
      url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="180"%3E%3Ccircle cx="90" cy="90" r="80" fill="%2300D4AA"/%3E%3Ctext x="90" y="105" text-anchor="middle" fill="white" font-size="48" font-weight="bold"%3EAZ%3C/text%3E%3C/svg%3E',
      sizes: '180x180',
      type: 'image/svg+xml',
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2dd4bf' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
