import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Study Helper',
  description: 'Study Helper Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}