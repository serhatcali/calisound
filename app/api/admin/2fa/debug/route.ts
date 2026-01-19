import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { get2FASecret } from '@/lib/2fa'
import { authenticator } from 'otplib'

export const dynamic = 'force-dynamic'

// Debug endpoint to check 2FA setup (only in development)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = await get2FASecret()
    
    if (!secret) {
      return NextResponse.json({ 
        success: false, 
        error: 'No 2FA secret found in database. Please set up 2FA first.' 
      })
    }

    // Get current time info
    const currentTime = Math.floor(Date.now() / 1000)
    const currentStep = Math.floor(currentTime / 30)
    
    // Generate a test token for current time
    const testToken = authenticator.generate(secret)
    
    // Verify the test token
    const isValid = authenticator.verify({ token: testToken, secret })

    return NextResponse.json({
      success: true,
      debug: {
        secretExists: !!secret,
        secretLength: secret.length,
        secretFormat: /^[A-Z2-7]+$/.test(secret),
        currentTime: new Date().toISOString(),
        currentTimeStep: currentStep,
        testToken: testToken,
        testTokenValid: isValid,
        window: [2, 2],
      }
    })
  } catch (error: any) {
    console.error('Error in 2FA debug:', error)
    return NextResponse.json(
      { error: 'Failed to debug 2FA', details: error.message },
      { status: 500 }
    )
  }
}
