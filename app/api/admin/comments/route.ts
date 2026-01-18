import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    // Validate status parameter
    const validStatuses = ['pending', 'approved', 'rejected']
    const sanitizedStatus = status && validStatuses.includes(status) ? status : null

    let query = supabase
      .from('comments')
      .select('id, author_name, content, rating, status, entity_type, entity_id, created_at, updated_at') // Don't select all fields (exclude IP, user_agent)
      .order('created_at', { ascending: false })
      .limit(100) // Limit results to prevent abuse

    if (sanitizedStatus) {
      query = query.eq('status', sanitizedStatus)
    }

    const { data, error } = await query

    if (error) throw error

    // Get entity names
    const commentsWithNames = await Promise.all(
      (data || []).map(async (comment) => {
        if (comment.entity_type === 'city') {
          const { data: city } = await supabase
            .from('cities')
            .select('name')
            .eq('id', comment.entity_id)
            .single()
          return { ...comment, entity_name: city?.name }
        } else if (comment.entity_type === 'set') {
          const { data: set } = await supabase
            .from('sets')
            .select('title')
            .eq('id', comment.entity_id)
            .single()
          return { ...comment, entity_name: set?.title }
        }
        return comment
      })
    )

    return NextResponse.json({ success: true, comments: commentsWithNames })
  } catch (error: any) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
