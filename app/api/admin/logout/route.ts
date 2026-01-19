import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/session-manager'
import { cookies } from 'next/headers'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST() {
  // Destroy secure session
  await destroySession()
  
  // Also delete any legacy cookies
  const cookieStore = await cookies()
  cookieStore.delete('admin-auth')
  cookieStore.delete('admin-auth-temp')
  cookieStore.delete('admin-2fa-verified')
  
  return NextResponse.json({ success: true })
}
