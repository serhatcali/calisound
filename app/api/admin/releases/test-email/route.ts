import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getReleases, getDailyTasks, getPromotionDays, getPlatformPlans } from '@/lib/release-planning-service'
import { sendDailyTaskEmail, sendReminderEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

// POST: Test email sending for a specific release
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const releaseId = body.releaseId

    if (!releaseId) {
      return NextResponse.json({ error: 'releaseId is required' }, { status: 400 })
    }

    // Get release
    const { getRelease } = await import('@/lib/release-planning-service')
    const release = await getRelease(releaseId)

    if (release.status !== 'active') {
      return NextResponse.json(
        { error: 'Release must be active to send test emails' },
        { status: 400 }
      )
    }

    const results = {
      dailyTaskEmail: { sent: false, error: null as string | null },
      reminderEmail: { sent: false, error: null as string | null },
    }

    // Test Daily Task Email
    try {
      const promotionDays = await getPromotionDays(releaseId)
      const allTasks = await getDailyTasks(releaseId)
      
      // Get first promotion day and its tasks
      if (promotionDays.length > 0 && allTasks.length > 0) {
        const firstDay = promotionDays[0]
        const dayTasks = allTasks.filter(t => t.day_offset === firstDay.day_offset)
        
        if (dayTasks.length > 0) {
          try {
            const sent = await sendDailyTaskEmail(release, dayTasks, firstDay)
            results.dailyTaskEmail.sent = sent
            if (!sent) {
              results.dailyTaskEmail.error = 'sendDailyTaskEmail returned false'
            }
          } catch (emailError: any) {
            console.error('Error in sendDailyTaskEmail:', emailError)
            results.dailyTaskEmail.error = emailError.message || 'Failed to send daily task email'
          }
        } else {
          results.dailyTaskEmail.error = 'No tasks found for first promotion day'
        }
      } else {
        results.dailyTaskEmail.error = `No promotion days (${promotionDays.length}) or tasks (${allTasks.length}) found`
      }
    } catch (error: any) {
      console.error('Test daily task email error:', error)
      results.dailyTaskEmail.error = error.message || 'Error sending daily task email'
    }

    // Test Reminder Email
    try {
      const platformPlans = await getPlatformPlans(releaseId)
      
      if (platformPlans.length > 0) {
        const firstPlan = platformPlans[0]
        try {
          const sent = await sendReminderEmail(release, firstPlan)
          results.reminderEmail.sent = sent
          if (!sent) {
            results.reminderEmail.error = 'sendReminderEmail returned false'
          }
        } catch (emailError: any) {
          console.error('Error in sendReminderEmail:', emailError)
          results.reminderEmail.error = emailError.message || 'Failed to send reminder email'
        }
      } else {
        results.reminderEmail.error = `No platform plans found (${platformPlans.length})`
      }
    } catch (error: any) {
      console.error('Test reminder email error:', error)
      results.reminderEmail.error = error.message || 'Error sending reminder email'
    }

    return NextResponse.json({
      success: true,
      message: 'Test emails processed',
      results,
    })
  } catch (error: any) {
    console.error('[API] Error sending test emails:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send test emails' },
      { status: 500 }
    )
  }
}
