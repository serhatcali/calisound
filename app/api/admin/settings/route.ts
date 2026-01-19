import { NextRequest, NextResponse } from 'next/server'
import { validateSettingsData } from '@/lib/admin-validation'
import { withAdminAuth, withAdminAuthAndCSRF } from '@/lib/api-security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

async function handleGET() {
  try {
    // Only return public settings, never expose sensitive data
    return NextResponse.json({
      success: true,
      settings: {
        googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
        googleSearchConsoleId: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
        contactEmail: process.env.CONTACT_EMAIL || '',
        contactEmailSubject: process.env.CONTACT_EMAIL_SUBJECT || 'New Contact Form Submission',
        // NEVER expose ADMIN_PASSWORD or SESSION_SECRET
      },
    })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

async function handlePUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateSettingsData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    // In production, you'd save these to a database
    // For now, we'll just return success
    // You'll need to manually update .env.local file

    // NEVER allow changing ADMIN_PASSWORD or SESSION_SECRET via API
    const safeEnvVars: any = {
      NEXT_PUBLIC_GA_ID: validation.data!.googleAnalyticsId,
      NEXT_PUBLIC_GSC_VERIFICATION: validation.data!.googleSearchConsoleId,
      CONTACT_EMAIL: validation.data!.contactEmail,
      CONTACT_EMAIL_SUBJECT: validation.data!.contactEmailSubject,
    }

    return NextResponse.json({
      success: true,
      message: 'Settings saved. Please update your .env.local file with these values:',
      envVars: safeEnvVars,
      note: 'ADMIN_PASSWORD and SESSION_SECRET cannot be changed via API for security reasons.',
    })
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handleGET)
export const PUT = withAdminAuthAndCSRF(handlePUT)
