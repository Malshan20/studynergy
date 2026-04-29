import { Toaster } from "@/components/ui/sonner"
import React from "react"
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Studynergy - AI-Powered Study Tools for Students',
  description: 'Upload your documents and let AI create flashcards, summaries, quizzes, and mock exams instantly. Study smarter with Studynergy.',
  keywords: ['study', 'AI', 'flashcards', 'quizzes', 'summaries', 'mock exams', 'education', 'students'],
  authors: [{ name: 'Studynergy' }],
  openGraph: {
    title: 'Studynergy - AI-Powered Study Tools',
    description: 'Transform your study materials into interactive learning content with AI',
    type: 'website',
  },
  icons: [
    { rel: 'icon', url: '/favicon.png', type: 'image/png' }
  ]
}

export const viewport: Viewport = {
  themeColor: '#e67e22',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* <!-- Google tag (gtag.js) --> */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-D4HEWXLWRC"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D4HEWXLWRC');
            `,
          }}
        />
      </head>
      <body className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
