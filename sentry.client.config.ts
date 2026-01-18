// Sentry Client Configuration
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://0bda1fb494b696e7b106ce731ddaf769@o4510727889879040.ingest.de.sentry.io/4510727893876816',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  debug: false,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    // Console logging integration (only if available in this Sentry version)
    // Note: consoleLoggingIntegration is available in Sentry 8.0+, we have 7.91.0
    // ...(Sentry.consoleLoggingIntegration
    //   ? [Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] })]
    //   : []),
  ],
  beforeSend(event, hint) {
    // Ignore YouTube player internal errors
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error) {
        // Ignore YouTube player getDuration/getCurrentTime errors
        if (
          error.value?.includes('getDuration is not a function') ||
          error.value?.includes('getCurrentTime is not a function') ||
          error.stacktrace?.frames?.some((frame: any) =>
            frame.filename?.includes('www-widgetapi') ||
            frame.filename?.includes('youtube.com') ||
            frame.filename?.includes('googletagmanager.com')
          )
        ) {
          console.debug('[Sentry] Ignoring YouTube player internal error:', error.value)
          return null // Don't send to Sentry
        }
      }
    }
    
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 Sentry Event (dev mode):', event)
    }
    // Send to Sentry (even in development for testing)
    return event
  },
  ignoreErrors: [
    // Ignore YouTube player internal errors
    'getDuration is not a function',
    'getCurrentTime is not a function',
    'a.getDuration is not a function',
    'a.getCurrentTime is not a function',
  ],
})
