import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '九条蛇',
  description: '礼物',
  generator: '心',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
