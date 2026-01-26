'use server'

import { Resend } from 'resend'
import type { Release, PlatformPlan, DailyTask, PromotionDay } from '@/types/release-planning'
import { PLATFORM_LABELS, PLATFORM_UPLOAD_LINKS } from '@/types/release-planning'
import { createEmailLog } from './release-planning-service'
// Safe date formatting - using native JavaScript only
function formatDate(date: Date, formatStr: string): string {
  if (formatStr === 'EEEE, MMMM d, yyyy') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  if (formatStr === 'HH:mm') {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  }
  return date.toLocaleString('en-US')
}

// Lazy initialization - only create Resend client when needed
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set. Please add it to Vercel environment variables.')
  }
  if (!apiKey.startsWith('re_')) {
    throw new Error('RESEND_API_KEY appears to be invalid. It should start with "re_".')
  }
  return new Resend(apiKey)
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'djcalitr@gmail.com'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@calisound.com'

/**
 * Send daily task email
 */
export async function sendDailyTaskEmail(
  release: Release,
  tasks: DailyTask[],
  promotionDay?: PromotionDay
): Promise<boolean> {
  const today = new Date()
  const todayTasks = tasks.filter(t => !t.completed)
  const highPriorityTasks = todayTasks.filter(t => t.priority === 1)
  const mediumPriorityTasks = todayTasks.filter(t => t.priority === 2)
  const lowPriorityTasks = todayTasks.filter(t => t.priority === 3)

  if (todayTasks.length === 0) {
    return false // No tasks to send
  }

  const releaseDate = new Date(release.release_at)
  const daysUntilRelease = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const dayLabel = daysUntilRelease === 0 
    ? 'Release Day' 
    : daysUntilRelease > 0 
    ? `T-${daysUntilRelease}` 
    : `T+${Math.abs(daysUntilRelease)}`

  const subject = `📅 ${release.song_title} - Daily Tasks (${dayLabel})`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .task { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f97316; }
        .task.priority-1 { border-left-color: #ef4444; }
        .task.priority-2 { border-left-color: #f59e0b; }
        .task.priority-3 { border-left-color: #10b981; }
        .task-title { font-weight: bold; margin-bottom: 5px; }
        .task-details { color: #6b7280; font-size: 14px; }
        .focus-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${release.song_title}</h1>
          <p>Daily Tasks - ${dayLabel}</p>
          ${release.city ? `<p>${release.city}, ${release.country}</p>` : ''}
        </div>
        <div class="content">
          ${promotionDay?.focus ? `
            <div class="focus-box">
              <strong>Today's Focus:</strong> ${promotionDay.focus}
            </div>
          ` : ''}
          
          ${highPriorityTasks.length > 0 ? `
            <h2>🔴 High Priority</h2>
            ${highPriorityTasks.map(task => `
              <div class="task priority-1">
                <div class="task-title">${task.title}</div>
                ${task.details ? `<div class="task-details">${task.details}</div>` : ''}
                ${task.platform ? `<div class="task-details">Platform: ${PLATFORM_LABELS[task.platform]}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${mediumPriorityTasks.length > 0 ? `
            <h2>🟡 Medium Priority</h2>
            ${mediumPriorityTasks.map(task => `
              <div class="task priority-2">
                <div class="task-title">${task.title}</div>
                ${task.details ? `<div class="task-details">${task.details}</div>` : ''}
                ${task.platform ? `<div class="task-details">Platform: ${PLATFORM_LABELS[task.platform]}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${lowPriorityTasks.length > 0 ? `
            <h2>🟢 Low Priority</h2>
            ${lowPriorityTasks.map(task => `
              <div class="task priority-3">
                <div class="task-title">${task.title}</div>
                ${task.details ? `<div class="task-details">${task.details}</div>` : ''}
                ${task.platform ? `<div class="task-details">Platform: ${PLATFORM_LABELS[task.platform]}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/releases/${release.id}" class="button">
            View Release Details
          </a>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const resend = getResendClient()
    console.log('[Email] Sending daily task email:', {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5),
    })
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    })

    if (error) {
      console.error('[Email] Resend API error:', error)
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`)
    }

    console.log('[Email] Daily task email sent successfully:', data)

    // Log email
    await createEmailLog({
      release_id: release.id,
      type: 'daily_task',
      subject,
      content_preview: `Daily tasks for ${release.song_title}`,
    })

    return true
  } catch (error: any) {
    console.error('[Email] Error sending daily task email:', error)
    console.error('[Email] Error details:', {
      message: error.message,
      stack: error.stack,
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
    })
    throw error // Re-throw to get better error messages
  }
}

/**
 * Send reminder email for platform plan
 */
export async function sendReminderEmail(
  release: Release,
  platformPlan: PlatformPlan
): Promise<boolean> {
  const plannedAt = new Date(platformPlan.planned_at)
  const platformLabel = PLATFORM_LABELS[platformPlan.platform]
  const uploadLink = platformPlan.quick_upload_link || PLATFORM_UPLOAD_LINKS[platformPlan.platform]

  const subject = `⏰ Reminder: Post ${release.song_title} on ${platformLabel}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .copy-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #f97316; }
        .copy-title { font-weight: bold; margin-bottom: 10px; font-size: 18px; }
        .copy-description { margin: 15px 0; white-space: pre-wrap; }
        .hashtags { margin: 15px 0; color: #3b82f6; }
        .tags { margin: 15px 0; color: #8b5cf6; font-size: 14px; }
        .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .time-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${release.song_title}</h1>
          <p>Post Reminder - ${platformLabel}</p>
        </div>
        <div class="content">
          <div class="time-box">
            <strong>Post Time:</strong><br>
            ${formatDate(plannedAt, 'EEEE, MMMM d, yyyy')}<br>
            ${formatDate(plannedAt, 'HH:mm')} (${release.timezone})
          </div>
          
          <div class="copy-box">
            <div class="copy-title">${platformPlan.title || release.song_title}</div>
            <div class="copy-description">${platformPlan.description || 'No description'}</div>
            ${platformPlan.hashtags && platformPlan.hashtags.length > 0 ? `
              <div class="hashtags">${platformPlan.hashtags.join(' ')}</div>
            ` : ''}
            ${platformPlan.tags ? `
              <div class="tags"><strong>Tags:</strong> ${platformPlan.tags}</div>
            ` : ''}
          </div>
          
          ${platformPlan.asset_urls && platformPlan.asset_urls.length > 0 ? `
            <div>
              <strong>Assets:</strong>
              <ul>
                ${platformPlan.asset_urls.map(url => `<li><a href="${url}">${url}</a></li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${uploadLink}" class="button" target="_blank">
              Upload to ${platformLabel}
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/releases/${release.id}" class="button">
              View Release
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const resend = getResendClient()
    console.log('[Email] Sending reminder email:', {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      platform: platformLabel,
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5),
    })
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html,
    })

    if (error) {
      console.error('[Email] Resend API error:', error)
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`)
    }

    console.log('[Email] Reminder email sent successfully:', data)

    // Log email and update platform plan status
    await createEmailLog({
      release_id: release.id,
      platform_plan_id: platformPlan.id,
      type: 'reminder',
      subject,
      content_preview: `Reminder for ${platformLabel} post`,
    })

    return true
  } catch (error: any) {
    console.error('[Email] Error sending reminder email:', error)
    console.error('[Email] Error details:', {
      message: error.message,
      stack: error.stack,
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
    })
    throw error // Re-throw to get better error messages
  }
}
