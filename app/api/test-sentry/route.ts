import { NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test Sentry on server side
    const Sentry = await import('@sentry/nextjs')
    
    // Create a test error
    const testError = new Error('API Test Error - Sentry Test için')
    Sentry.captureException(testError)
    
    return NextResponse.json({
      success: true,
      message: 'Test error sent to Sentry! Check your Sentry dashboard.',
    })
  } catch (error: any) {
    console.error('Sentry test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send error to Sentry',
    }, { status: 500 })
  }
}
