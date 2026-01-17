import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CookieConsent } from '@/components/shared/CookieConsent'

export const metadata: Metadata = {
  title: 'CALI Sound - Global Afro House City Series',
  description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.',
  keywords: 'Afro House, Melodic House, Electronic Music, DJ Sets, Global Music',
  authors: [{ name: 'CALI Sound' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://calisound.com',
    siteName: 'CALI Sound',
    title: 'CALI Sound - Global Afro House City Series',
    description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'CALI Sound',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CALI Sound - Global Afro House City Series',
    description: 'Experience the world through Afro House music.',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-black">
        <ThemeProvider>
          <Navigation />
          <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}
