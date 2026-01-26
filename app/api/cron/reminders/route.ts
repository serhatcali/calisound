import { NextResponse } from 'next/server'
import { getReleases, getPlatformPlans, getEmailLogs, updatePlatformPlan } from '@/lib/release-planning-service'
import { sendReminderEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// This endpoint runs daily at 08:00 UTC (11:00 Europe/Istanbul)
// Checks for platform plans that need reminder emails
// Note: Hobby plan limits to daily cron jobs, so we check once per day
// Sends reminders for posts scheduled today or tomorrow (within 2-24 hours)
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
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    
    // Get all active releases
    const releases = await getReleases({ status: 'active' })
    
    let remindersSent = 0
    let errors = 0

    for (const release of releases) {
      try {
        // Get all scheduled platform plans
        const platformPlans = await getPlatformPlans(release.id)
        
        for (const plan of platformPlans) {
          // Skip if already reminded or published
          if (plan.status === 'reminded' || plan.status === 'published' || plan.status === 'skipped') {
            continue
          }

          const plannedAt = new Date(plan.planned_at)
          
          // Check if planned_at is today or tomorrow (within next 24 hours)
          // Since we can only run once per day on Hobby plan, we send reminders
          // for all posts scheduled in the next 24 hours
          const timeDiff = plannedAt.getTime() - now.getTime()
          const twoHoursInMs = 2 * 60 * 60 * 1000
          const twentyFourHoursInMs = 24 * 60 * 60 * 1000
          
          // Send reminder if post is scheduled between 2 hours and 24 hours from now
          // This ensures reminders are sent early enough but not too early
          if (timeDiff > 0 && timeDiff <= twentyFourHoursInMs && timeDiff >= twoHoursInMs) {
            // Check if reminder already sent today
            const today = new Date().toISOString().split('T')[0]
            const existingLogs = await getEmailLogs({
              release_id: release.id,
              platform_plan_id: plan.id,
              type: 'reminder',
              date: today,
            })

            if (existingLogs.length === 0) {
              // Send reminder email
              const sent = await sendReminderEmail(release, plan)
              
              if (sent) {
                // Update platform plan status to 'reminded'
                await updatePlatformPlan(plan.id, { status: 'reminded' })
                remindersSent++
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing release ${release.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder emails processed',
      remindersSent,
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in reminders cron:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process reminders' },
      { status: 500 }
    )
  }
}
