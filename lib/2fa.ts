'use server'

import { authenticator } from 'otplib'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Set authenticator options - more lenient for time sync
authenticator.options = {
  step: 30, // 30 seconds
  window: [5, 5], // Allow 5 steps before/after (very lenient for time sync issues)
  encoding: 'base32', // Explicit encoding
}

export async function generate2FASecret(email: string = 'admin@calisound.com') {
  const secret = authenticator.generateSecret()
  const serviceName = 'CALI Sound Admin'
  const otpAuthUrl = authenticator.keyuri(email, serviceName, secret)
  
  return {
    secret,
    otpAuthUrl,
  }
}

export async function verify2FAToken(token: string, secret?: string): Promise<boolean> {
  try {
    // Clean token - remove spaces and ensure it's 6 digits
    const cleanToken = token.replace(/\s/g, '').trim()
    
    if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
      console.error('[2FA Verify] Invalid token format:', cleanToken, 'Length:', cleanToken.length)
      return false
    }

    let secretToUse = secret

    // If secret not provided, get from database
    if (!secretToUse) {
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', '2fa_secret')
        .single()

      if (error) {
        console.error('[2FA Verify] Error fetching secret:', error)
        return false
      }

      if (!data?.value) {
        console.error('[2FA Verify] No secret found in database')
        return false
      }

      secretToUse = data.value
    }

    if (!secretToUse) {
      console.error('[2FA Verify] No secret available')
      return false
    }

    // Validate secret format
    if (!/^[A-Z2-7]+$/.test(secretToUse)) {
      console.error('[2FA Verify] Invalid secret format (must be base32)')
      return false
    }

    console.log('[2FA Verify] Verifying:', {
      token: cleanToken,
      secretLength: secretToUse.length,
      secretFormat: /^[A-Z2-7]+$/.test(secretToUse),
      currentTime: new Date().toISOString()
    })
    
    // Generate current token for comparison (debug)
    const currentToken = authenticator.generate(secretToUse)
    console.log('[2FA Verify] Current valid token:', currentToken)
    
    // Try multiple windows for better compatibility
    // First try with window [5, 5] (very lenient)
    let isValid = false
    try {
      isValid = authenticator.verify({ 
        token: cleanToken, 
        secret: secretToUse,
        window: [5, 5]
      })
      console.log('[2FA Verify] Window [5,5] result:', isValid)
    } catch (verifyError: any) {
      console.error('[2FA Verify] Error in verify with window [5,5]:', verifyError.message)
    }
    
    // If that fails, try with even wider window [10, 10] (extremely lenient)
    if (!isValid) {
      console.log('[2FA Verify] Trying wider window [10, 10]')
      try {
        isValid = authenticator.verify({ 
          token: cleanToken, 
          secret: secretToUse,
          window: [10, 10]
        })
        console.log('[2FA Verify] Window [10,10] result:', isValid)
      } catch (verifyError: any) {
        console.error('[2FA Verify] Error in verify with window [10,10]:', verifyError.message)
      }
    }
    
    // Last resort: manual check with current token
    if (!isValid) {
      console.log('[2FA Verify] Manual token comparison')
      if (currentToken === cleanToken) {
        console.log('[2FA Verify] Token matches current generated token')
        isValid = true
      } else {
        // Try generating tokens for adjacent time steps
        const currentTime = Math.floor(Date.now() / 1000)
        for (let offset = -5; offset <= 5; offset++) {
          const testTime = currentTime + (offset * 30)
          // Note: authenticator.generate doesn't accept time parameter directly
          // We'll rely on the window-based verification
        }
      }
    }
    
    console.log('[2FA Verify] Final result:', isValid)
    if (!isValid) {
      console.log('[2FA Verify] Token mismatch:', {
        entered: cleanToken,
        current: currentToken,
        time: new Date().toISOString()
      })
    }
    
    return isValid
  } catch (error: any) {
    console.error('[2FA Verify] Exception in verify2FAToken:', error)
    console.error('[2FA Verify] Error stack:', error.stack)
    return false
  }
}

export async function is2FAEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', '2fa_enabled')
      .single()

    if (error || !data?.value) {
      return false
    }

    return data.value === 'true'
  } catch (error) {
    console.error('Error checking 2FA status:', error)
    return false
  }
}

export async function enable2FA(secret: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Enabling 2FA with secret:', secret.substring(0, 10) + '...')
    
    // First, try to check if table exists and is accessible
    const { data: testData, error: testError } = await supabaseAdmin
      .from('admin_settings')
      .select('key')
      .limit(1)

    if (testError) {
      console.error('Error accessing admin_settings table:', testError)
      return { 
        success: false, 
        error: `Database error: ${testError.message}. Please make sure you've run the 2fa-setup.sql script in Supabase.` 
      }
    }

    // Update 2FA secret
    const { data: secretData, error: secretError } = await supabaseAdmin
      .from('admin_settings')
      .upsert({ key: '2fa_secret', value: secret }, { onConflict: 'key' })
      .select()

    if (secretError) {
      console.error('Error saving 2FA secret:', secretError)
      return { 
        success: false, 
        error: `Failed to save secret: ${secretError.message}. Code: ${secretError.code}` 
      }
    }

    console.log('2FA secret saved:', secretData)

    // Enable 2FA
    const { data: enableData, error: enableError } = await supabaseAdmin
      .from('admin_settings')
      .upsert({ key: '2fa_enabled', value: 'true' }, { onConflict: 'key' })
      .select()

    if (enableError) {
      console.error('Error enabling 2FA:', enableError)
      return { 
        success: false, 
        error: `Failed to enable 2FA: ${enableError.message}. Code: ${enableError.code}` 
      }
    }

    console.log('2FA enabled:', enableData)

    return { success: true }
  } catch (error: any) {
    console.error('Error enabling 2FA:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return { 
      success: false, 
      error: `Unexpected error: ${error.message || 'Unknown error'}` 
    }
  }
}

export async function disable2FA(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('admin_settings')
      .upsert({ key: '2fa_enabled', value: 'false' }, { onConflict: 'key' })

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return false
  }
}

export async function get2FASecret(): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', '2fa_secret')
      .single()

    if (error || !data?.value) {
      return null
    }

    return data.value
  } catch (error) {
    console.error('Error getting 2FA secret:', error)
    return null
  }
}
