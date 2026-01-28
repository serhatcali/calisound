# Cron Jobs Setup Guide

## Overview

Release planning system uses Vercel cron jobs to send automated emails:
- **Daily Task Emails**: Sent at 10:00 AM (Europe/Istanbul time)
- **Reminder Emails**: Sent 2 hours before each planned post

## Setup Instructions

### 1. Environment Variables

Add to your Vercel project environment variables:

```
CRON_SECRET=your-secret-key-here
```

Generate a secure random string for `CRON_SECRET`. This prevents unauthorized access to cron endpoints.

### 2. Vercel Cron Jobs Configuration

The `vercel.json` file is already configured with:
- Daily tasks: Runs at 07:00 UTC (10:00 Europe/Istanbul, UTC+3)
- Reminders: Runs every hour

### 3. Manual Testing

You can manually trigger cron jobs for testing:

```bash
# Test daily tasks
curl -X GET "https://your-domain.com/api/cron/daily-tasks" \
  -H "Authorization: Bearer your-cron-secret"

# Test reminders
curl -X GET "https://your-domain.com/api/cron/reminders" \
  -H "Authorization: Bearer your-cron-secret"
```

### 4. Local Development

For local testing, you can create a simple script or use a tool like `node-cron`:

```bash
# Install node-cron
npm install node-cron

# Or use a cron job simulator
```

### 5. Monitoring

Check Vercel Dashboard > Functions > Cron Jobs to see:
- Execution history
- Success/failure rates
- Logs

### 6. Email Configuration

Ensure these environment variables are set:
- `RESEND_API_KEY` - Your Resend API key
- `ADMIN_EMAIL` - Email address to receive notifications (default: djcalitr@gmail.com)
- `RESEND_FROM_EMAIL` - Sender email (default: noreply@calisound.com)
- `NEXT_PUBLIC_BASE_URL` - Base URL for email links

## How It Works

### Daily Task Emails

1. Runs daily at 10:00 AM (Europe/Istanbul)
2. Finds all active releases
3. Gets today's promotion day and tasks
4. Sends email with:
   - Today's focus
   - High/Medium/Low priority tasks
   - Link to release detail page

### Reminder Emails

1. Runs every hour
2. Checks all scheduled platform plans
3. Finds plans that are 2 hours away (within 5-minute window)
4. Checks if reminder already sent today
5. Sends reminder email with:
   - Post time and platform
   - Copy (title, description, hashtags, tags)
   - Asset links
   - Quick upload link
6. Updates platform plan status to 'reminded'

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is valid
2. Verify email addresses are correct
3. Check Vercel function logs
4. Ensure releases have status 'active'
5. Verify timeline and platform plans are generated

### Cron Jobs Not Running

1. Verify `vercel.json` is committed
2. Check Vercel Dashboard > Settings > Cron Jobs
3. Ensure CRON_SECRET is set
4. Check function logs for errors

### Timezone Issues

Vercel cron jobs run in UTC. The schedule is adjusted for Europe/Istanbul (UTC+3):
- 10:00 IST = 07:00 UTC

To change timezone, update the schedule in `vercel.json`:
- For UTC: `"0 10 * * *"`
- For IST (UTC+3): `"0 7 * * *"`
