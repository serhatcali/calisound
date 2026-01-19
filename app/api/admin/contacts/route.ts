import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    // Check if contacts table exists, if not return empty array
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, email, subject, message, created_at') // Don't select all fields
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist yet
      return NextResponse.json({ success: true, contacts: [] })
    }

    return NextResponse.json({ success: true, contacts: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: true, contacts: [] })
  }
}
