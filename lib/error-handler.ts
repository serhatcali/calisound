// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    }
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
  }
}

export function logError(error: unknown, context?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Client-side logging
    console.error('Error:', error, context)
    
    // Send to Sentry if available
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid issues if Sentry not loaded
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            contexts: {
              custom: context || {},
            },
          })
        }).catch(() => {
          // Sentry not available, just log
          console.error('Sentry not available')
        })
      } catch (e) {
        // Ignore Sentry errors
      }
    }
  } else {
    // Server-side logging
    console.error('Server Error:', error, context)
    
    // Server-side Sentry
    try {
      const Sentry = require('@sentry/nextjs')
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
      })
    } catch (e) {
      // Sentry not available
    }
  }
}
