import { NextResponse } from 'next/server'
import { getReleases, getDailyTasks, getPromotionDays } from '@/lib/release-planning-service'
import { sendDailyTaskEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// This endpoint runs daily at 10:00 AM (Europe/Istanbul time)
// Configure in vercel.json or Vercel Dashboard
export async function GET(request: Request) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim() // Remove leading/trailing whitespace
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Get all active releases
    const releases = await getReleases({ status: 'active' })
    
    let emailsSent = 0
    let errors = 0

    for (const release of releases) {
      try {
        // Get promotion days for today
        const promotionDays = await getPromotionDays(release.id)
        const todayPromotionDay = promotionDays.find(day => {
          const dayDate = new Date(day.date)
          const dayDateOnly = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
          return dayDateOnly.getTime() === today.getTime()
        })

        // Get today's tasks
        const allTasks = await getDailyTasks(release.id)
        const todayTasks = allTasks.filter(task => {
          // Find tasks for today's day_offset
          if (todayPromotionDay) {
            return task.day_offset === todayPromotionDay.day_offset
          }
          return false
        })

        if (todayTasks.length > 0) {
          const sent = await sendDailyTaskEmail(release, todayTasks, todayPromotionDay)
          if (sent) {
            emailsSent++
          }
        }
      } catch (error) {
        console.error(`Error processing release ${release.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Daily task emails processed',
      emailsSent,
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in daily tasks cron:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process daily tasks' },
      { status: 500 }
    )
  }
}
