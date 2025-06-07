'use client';

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const queryClient = new QueryClient()

export const metadata: Metadata = {
  title: 'Plavel',
  description: '여행 기록을 공유하고 발견하세요',
  manifest: '/manifest.json',
  themeColor: '#1C1C1E',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Plavel',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
} 