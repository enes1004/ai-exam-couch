import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Exam Couch - Your Friendly Study Buddy',
  description: 'A conversational AI tutor that helps you study and ace your exams with friendly, interactive guidance.',
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
