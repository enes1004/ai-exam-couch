import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Exam Couch - Tutoring Agent',
  description: 'A multi-turn tutoring agent with real tool use and streaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
