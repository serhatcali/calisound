import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { generate2FASecret, enable2FA } from '@/lib/2fa'
import { validateString } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { secret, otpAuthUrl } = await generate2FASecret()

    return NextResponse.json({ success: true, secret, otpAuthUrl })
  } catch (error: any) {
    console.error('Error generating 2FA secret:', error)
    return NextResponse.json(
      { error: 'Failed to generate 2FA secret' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate secret
    const secretValidation = validateString(body.secret, {
      required: true,
      minLength: 16,
      maxLength: 100,
      pattern: /^[A-Z2-7]+$/, // Base32 format
    })

    // Validate token
    const tokenValidation = validateString(body.token, {
      required: true,
      minLength: 6,
      maxLength: 6,
      pattern: /^\d{6}$/, // 6 digits
    })

    if (!secretValidation.valid || !tokenValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid secret or token format' },
        { status: 400 }
      )
    }

    const { secret, token } = {
      secret: secretValidation.value!,
      token: tokenValidation.value!,
    }

    // Verify the token before enabling
    const { verify2FAToken } = await import('@/lib/2fa')
    
    console.log('[2FA Setup] Verifying token:', {
      secretLength: secret.length,
      secretFormat: /^[A-Z2-7]+$/.test(secret),
      tokenLength: token.length,
      tokenFormat: /^\d{6}$/.test(token)
    })
    
    const isValid = await verify2FAToken(token, secret)
    
    console.log('[2FA Setup] Verification result:', isValid)

    if (!isValid) {
      // Generate a test token for debugging (dev only)
      if (process.env.NODE_ENV !== 'production') {
        const { authenticator } = await import('otplib')
        const testToken = authenticator.generate(secret)
        console.log('[2FA Setup] Test token for this secret:', testToken)
        console.log('[2FA Setup] Current time:', new Date().toISOString())
      }
      
      return NextResponse.json({ 
        error: 'Invalid verification code. Please check:\n1. The code is from the correct authenticator app\n2. Your device time is synchronized\n3. You entered all 6 digits correctly\n4. The code hasn\'t expired (codes refresh every 30 seconds)\n5. Try waiting for a new code to generate\n6. Make sure you scanned the QR code correctly' 
      }, { status: 400 })
    }

    // Enable 2FA
    const result = await enable2FA(secret)

    if (result.success) {
      return NextResponse.json({ success: true, message: '2FA enabled successfully' })
    } else {
      return NextResponse.json({ 
        error: result.error || 'Failed to enable 2FA. Please check the server logs for details.' 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error enabling 2FA:', error)
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    )
  }
}
