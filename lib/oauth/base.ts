/**
 * Base OAuth Flow
 * Common OAuth 2.0 flow implementation
 */

import { getOAuthConfig } from './config'
import { encryptToken, decryptToken } from './token-encryption'
import { supabaseAdmin } from '../supabase-admin'
import type { SocialPlatform } from '@/types/social-media'
import crypto from 'crypto'

/**
 * Generate OAuth authorization URL
 */
export async function getAuthorizationUrl(
  platform: SocialPlatform,
  state?: string
): Promise<{ url: string; state: string }> {
  const config = getOAuthConfig(platform)
  if (!config) {
    throw new Error(
      `OAuth not configured for platform: ${platform}. Please add ${platform.toUpperCase()}_CLIENT_ID and ${platform.toUpperCase()}_CLIENT_SECRET to your environment variables.`
    )
  }

  // Generate state if not provided
  const oauthState = state || crypto.randomBytes(32).toString('hex')

  // Store state in database for verification
  await supabaseAdmin.from('social_oauth_states').insert({
    state: oauthState,
    platform,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
  }).catch(() => {
    // Table might not exist yet, that's okay
  })

  // Instagram Basic Display uses different parameter format
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(','), // Instagram uses comma, not space
    state: oauthState,
  })

  // Add platform-specific parameters
  if (platform === 'youtube' || platform === 'youtube_shorts') {
    params.append('access_type', 'offline')
    params.append('prompt', 'consent')
  }

  return {
    url: `${config.authUrl}?${params.toString()}`,
    state: oauthState,
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  platform: SocialPlatform,
  code: string,
  state: string
): Promise<{
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
}> {
  const config = getOAuthConfig(platform)
  if (!config) {
    throw new Error(`OAuth not configured for platform: ${platform}`)
  }

  // Verify state
  const { data: stateData } = await supabaseAdmin
    .from('social_oauth_states')
    .select('*')
    .eq('state', state)
    .single()

  if (!stateData || new Date(stateData.expires_at) < new Date()) {
    throw new Error('Invalid or expired OAuth state')
  }

  // Delete used state
  await supabaseAdmin
    .from('social_oauth_states')
    .delete()
    .eq('state', state)

  // Exchange code for token
  const isInstagram = platform === 'instagram' || platform === 'instagram_story'
  
  // Instagram Basic Display API accepts URL-encoded form data
  const tokenParams = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  const tokenData = await response.json()

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    tokenType: tokenData.token_type,
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  platform: SocialPlatform,
  refreshToken: string
): Promise<{
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}> {
  const config = getOAuthConfig(platform)
  if (!config) {
    throw new Error(`OAuth not configured for platform: ${platform}`)
  }

  const tokenParams = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  const tokenData = await response.json()

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || refreshToken, // Some platforms don't return new refresh token
    expiresIn: tokenData.expires_in,
  }
}

/**
 * Save account with encrypted tokens
 */
export async function saveOAuthAccount(
  platform: SocialPlatform,
  accountData: {
    handle: string
    accountId?: string
    accessToken: string
    refreshToken?: string
    expiresIn?: number
    scopes?: string[]
  }
): Promise<void> {
  const encryptedAccessToken = encryptToken(accountData.accessToken)
  const encryptedRefreshToken = accountData.refreshToken
    ? encryptToken(accountData.refreshToken)
    : null

  const expiresAt = accountData.expiresIn
    ? new Date(Date.now() + accountData.expiresIn * 1000).toISOString()
    : null

  // Check if account exists
  const { data: existing } = await supabaseAdmin
    .from('social_accounts')
    .select('id')
    .eq('platform', platform)
    .eq('handle', accountData.handle)
    .single()

  if (existing) {
    // Update existing account
    await supabaseAdmin
      .from('social_accounts')
      .update({
        account_id: accountData.accountId,
        token_encrypted: encryptedAccessToken,
        refresh_encrypted: encryptedRefreshToken,
        expires_at: expiresAt,
        scopes: accountData.scopes || [],
        status: 'connected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    // Create new account
    await supabaseAdmin.from('social_accounts').insert({
      platform,
      handle: accountData.handle,
      account_id: accountData.accountId,
      token_encrypted: encryptedAccessToken,
      refresh_encrypted: encryptedRefreshToken,
      expires_at: expiresAt,
      scopes: accountData.scopes || [],
      status: 'connected',
      created_by: 'admin',
    })
  }
}

/**
 * Get decrypted access token for account
 */
export async function getDecryptedToken(accountId: string): Promise<{
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
}> {
  const { data: account } = await supabaseAdmin
    .from('social_accounts')
    .select('token_encrypted, refresh_encrypted, expires_at')
    .eq('id', accountId)
    .single()

  if (!account) {
    throw new Error('Account not found')
  }

  return {
    accessToken: decryptToken(account.token_encrypted || ''),
    refreshToken: account.refresh_encrypted
      ? decryptToken(account.refresh_encrypted)
      : undefined,
    expiresAt: account.expires_at ? new Date(account.expires_at) : undefined,
  }
}
