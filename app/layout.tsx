import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CookieConsent } from '@/components/shared/CookieConsent'
import { StructuredData } from '@/components/shared/StructuredData'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { PerformanceMonitor } from '@/components/shared/PerformanceMonitor'
import { headers } from 'next/headers'
import dynamic from 'next/dynamic'
import { GA_MEASUREMENT_ID } from '@/lib/ga-config'

// Lazy load non-critical components for better performance
const PlaylistPanel = dynamic(() => import('@/components/shared/PlaylistPanel').then(mod => ({ default: mod.PlaylistPanel })), {
  ssr: false,
  loading: () => null,
})

const NewsletterPopup = dynamic(() => import('@/components/shared/NewsletterPopup').then(mod => ({ default: mod.NewsletterPopup })), {
  ssr: false,
  loading: () => null,
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calisound.music'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'CALI Sound - Global Afro House City Series | Afrobeat DJ Music',
    template: '%s | CALI Sound',
  },
  description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.',
  keywords: [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    'Afro House',
    'Melodic House',
    'Electronic Music',
    'DJ Sets',
    'Global Music',
    'House Music',
    'Club Music',
    'Electronic Dance Music',
    'EDM',
  ],
  authors: [{ name: 'CALI Sound' }],
  creator: 'CALI Sound',
  publisher: 'CALI Sound',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'CALI Sound',
    title: 'CALI Sound - Global Afro House City Series | Afrobeat DJ Music',
    description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.',
    images: [
      {
        url: `${baseUrl}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'CALI Sound - Global Afro House City Series',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CALI Sound - Global Afro House City Series',
    description: 'Experience the world through Afro House music. Listen to Afrobeat, Afro House, and DJ sets.',
    images: ['/og-default.jpg'],
    creator: '@calisound',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  category: 'Music',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if this is an admin route or cali-club route
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const isCaliClubRoute = pathname.startsWith('/cali-club')

  // General Structured Data for the website
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CALI Sound',
    description: 'Global Afro House City Series. Experience the world through Afro House music.',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/cities?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CALI Sound',
    url: baseUrl,
    logo: `${baseUrl}/og-default.jpg`,
    sameAs: [
      'https://www.youtube.com/@calisound',
      'https://open.spotify.com/artist/calisound',
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
              
              // Suppress YouTube player errors globally
              (function() {
                if (typeof window !== 'undefined') {
                  const originalError = window.onerror;
                  window.onerror = function(message, source, lineno, colno, error) {
                    const msg = String(message || '');
                    const src = String(source || '');
                    const errMsg = error?.message || '';
                    const errStack = error?.stack || '';
                    
                    if (
                      msg.includes('getDuration') ||
                      msg.includes('getCurrentTime') ||
                      msg.includes('www-widgetapi') ||
                      msg.includes('youtube.com') ||
                      msg.includes('googletagmanager.com') ||
                      msg.includes('gtag/js') ||
                      src.includes('www-widgetapi') ||
                      src.includes('youtube.com') ||
                      src.includes('googletagmanager.com') ||
                      src.includes('gtag/js') ||
                      errMsg.includes('getDuration') ||
                      errMsg.includes('getCurrentTime') ||
                      errStack.includes('www-widgetapi') ||
                      errStack.includes('youtube.com') ||
                      errStack.includes('googletagmanager.com')
                    ) {
                      console.debug('[Suppressed] YouTube player error:', msg);
                      return true; // Suppress error
                    }
                    if (originalError) {
                      return originalError.call(this, message, source, lineno, colno, error);
                    }
                    return false;
                  };
                  
                  // Also catch unhandled promise rejections
                  window.addEventListener('unhandledrejection', function(event) {
                    const reason = event.reason;
                    const msg = reason?.message || String(reason || '');
                    const stack = reason?.stack || '';
                    
                    if (
                      msg.includes('getDuration') ||
                      msg.includes('getCurrentTime') ||
                      msg.includes('www-widgetapi') ||
                      msg.includes('youtube.com') ||
                      msg.includes('googletagmanager.com') ||
                      stack.includes('www-widgetapi') ||
                      stack.includes('youtube.com') ||
                      stack.includes('googletagmanager.com')
                    ) {
                      console.debug('[Suppressed] YouTube player promise rejection:', msg);
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }, true);
                }
              })();
            `,
          }}
        />
        {/* Performance: Preconnect to external domains (only if needed) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://open.spotify.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="bg-white dark:bg-black">
        {!isAdminRoute && (
          <>
            <StructuredData data={websiteStructuredData} />
            <StructuredData data={organizationStructuredData} />
          </>
        )}
        <ThemeProvider>
          <ErrorBoundary>
            <PerformanceMonitor />
            {!isAdminRoute && !isCaliClubRoute && <Navigation />}
            <main className={isCaliClubRoute ? "h-full w-full" : "min-h-screen bg-white dark:bg-black transition-colors duration-300 relative z-0"}>
              {children}
            </main>
            {!isAdminRoute && !isCaliClubRoute && (
              <>
                <Footer />
                <CookieConsent />
                <PlaylistPanel />
                <NewsletterPopup />
              </>
            )}
          </ErrorBoundary>
        </ThemeProvider>
        {/* Google Analytics - manuel ID: G-99S4MG2Q73 (ga-config) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
