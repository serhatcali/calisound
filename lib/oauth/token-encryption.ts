/**
 * Token Encryption Utility
 * Encrypts/decrypts OAuth tokens before storing in database
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32
const ITERATIONS = 100000

// Get encryption key from environment variable
// In production, use a secure key management system
function getEncryptionKey(): Buffer {
  const key = process.env.OAUTH_ENCRYPTION_KEY
  if (!key) {
    throw new Error('OAUTH_ENCRYPTION_KEY environment variable is not set')
  }
  
  // If key is 64 hex characters (32 bytes), use it directly
  if (key.length === 64 && /^[0-9a-f]+$/i.test(key)) {
    return Buffer.from(key, 'hex')
  }
  
  // Otherwise, derive key from the string
  return crypto.pbkdf2Sync(key, 'oauth-salt', ITERATIONS, KEY_LENGTH, 'sha512')
}

/**
 * Encrypt a token string
 */
export function encryptToken(token: string): string {
  if (!token) return ''
  
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    // Combine iv + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ])
    
    return combined.toString('base64')
  } catch (error) {
    console.error('Error encrypting token:', error)
    throw new Error('Failed to encrypt token')
  }
}

/**
 * Decrypt a token string
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) return ''
  
  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedToken, 'base64')
    
    // Extract iv, authTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Error decrypting token:', error)
    throw new Error('Failed to decrypt token')
  }
}

/**
 * Generate a secure encryption key (for initial setup)
 * Run this once and save the output to OAUTH_ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
