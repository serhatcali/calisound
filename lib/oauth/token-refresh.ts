/**
 * Token Refresh Utility
 * Automatically refreshes expired OAuth tokens
 */

import { supabaseAdmin } from '../supabase-admin'
import { refreshAccessToken, saveOAuthAccount, getDecryptedToken } from './base'
import { decryptToken } from './token-encryption'
import type { SocialPlatform } from '@/types/social-media'

/**
 * Check and refresh token if needed
 */
export async function refreshTokenIfNeeded(accountId: string): Promise<string> {
  const { data: account } = await supabaseAdmin
    .from('social_accounts')
    .select('platform, token_encrypted, refresh_encrypted, expires_at')
    .eq('id', accountId)
    .single()

  if (!account) {
    throw new Error('Account not found')
  }

  // Check if token is expired or will expire in the next 5 minutes
  const expiresAt = account.expires_at ? new Date(account.expires_at) : null
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  if (!expiresAt || expiresAt > fiveMinutesFromNow) {
    // Token is still valid, return decrypted token
    return decryptToken(account.token_encrypted || '')
  }

  // Token is expired or about to expire, refresh it
  if (!account.refresh_encrypted) {
    throw new Error('No refresh token available')
  }

  const refreshToken = decryptToken(account.refresh_encrypted)
  const platform = account.platform as SocialPlatform

  try {
    const tokenData = await refreshAccessToken(platform, refreshToken)

    // Update account with new token
    const { data: updatedAccount } = await supabaseAdmin
      .from('social_accounts')
      .select('handle, account_id')
      .eq('id', accountId)
      .single()

    if (updatedAccount) {
      await saveOAuthAccount(platform, {
        handle: updatedAccount.handle,
        accountId: updatedAccount.account_id,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: tokenData.expiresIn,
      })
    }

    return tokenData.accessToken
  } catch (error: any) {
    // Mark account as expired if refresh fails
    await supabaseAdmin
      .from('social_accounts')
      .update({ status: 'expired' })
      .eq('id', accountId)

    throw new Error(`Token refresh failed: ${error.message}`)
  }
}

/**
 * Get valid access token for account (refreshes if needed)
 */
export async function getValidAccessToken(accountId: string): Promise<string> {
  return await refreshTokenIfNeeded(accountId)
}

/**
 * Batch refresh all expired tokens
 */
export async function refreshAllExpiredTokens(): Promise<{
  refreshed: number
  failed: number
}> {
  const { data: accounts } = await supabaseAdmin
    .from('social_accounts')
    .select('id, platform, refresh_encrypted, expires_at')
    .eq('status', 'connected')
    .not('refresh_encrypted', 'is', null)

  if (!accounts || accounts.length === 0) {
    return { refreshed: 0, failed: 0 }
  }

  let refreshed = 0
  let failed = 0

  for (const account of accounts) {
    const expiresAt = account.expires_at ? new Date(account.expires_at) : null
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    // Only refresh if expired or about to expire
    if (expiresAt && expiresAt <= fiveMinutesFromNow) {
      try {
        await refreshTokenIfNeeded(account.id)
        refreshed++
      } catch (error) {
        console.error(`Failed to refresh token for account ${account.id}:`, error)
        failed++
      }
    }
  }

  return { refreshed, failed }
}
