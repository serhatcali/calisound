import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { updateDailyTask } from '@/lib/release-planning-service'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { completed } = await request.json()
    
    const task = await updateDailyTask(params.taskId, { completed })
    
    return NextResponse.json(task)
  } catch (error: any) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    )
  }
}
