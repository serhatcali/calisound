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

    // Verify the token before enabling (don't log sensitive data)
    const { verify2FAToken } = await import('@/lib/2fa')
    const isValid = await verify2FAToken(token, secret)

    if (!isValid) {
      return NextResponse.json({ 
        error: 'Invalid verification code. Please make sure you entered the correct 6-digit code from your authenticator app.' 
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
