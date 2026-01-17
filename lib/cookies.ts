'use client'

export type CookieCategory = 'necessary' | 'analytics' | 'marketing'

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'cali-sound-cookie-consent'
const COOKIE_PREFERENCES_KEY = 'cali-sound-cookie-preferences'

// Necessary cookies are always true
const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

export function getCookieConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true'
}

export function setCookieConsent(consented: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COOKIE_CONSENT_KEY, String(consented))
}

export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES

  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (stored) {
      const prefs = JSON.parse(stored)
      return {
        ...DEFAULT_PREFERENCES,
        ...prefs,
        necessary: true, // Always true
      }
    }
  } catch (error) {
    console.error('Error reading cookie preferences:', error)
  }

  return DEFAULT_PREFERENCES
}

export function setCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return

  try {
    const prefs = {
      ...preferences,
      necessary: true, // Always true
    }
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    
    // Trigger event for other components
    window.dispatchEvent(new CustomEvent('cookie-preferences-changed', { detail: prefs }))
  } catch (error) {
    console.error('Error saving cookie preferences:', error)
  }
}

export function isCategoryEnabled(category: CookieCategory): boolean {
  const prefs = getCookiePreferences()
  return prefs[category] ?? false
}

// Set a cookie (only if category is enabled)
export function setCookie(
  name: string,
  value: string,
  category: CookieCategory,
  days: number = 365
): void {
  if (category !== 'necessary' && !isCategoryEnabled(category)) {
    return
  }

  if (typeof document === 'undefined') return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

// Get a cookie
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const nameEQ = name + '='
  const ca = document.cookie.split(';')

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }

  return null
}

// Delete a cookie
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}
