# Release Planning System - Setup Guide

## 1. Database Schema

Run the SQL schema in Supabase SQL Editor:

```sql
-- File: supabase/release-planning-schema.sql
-- Copy and paste the entire file content into Supabase SQL Editor
-- Then click "Run"
```

## 2. Environment Variables

Add to `.env.local`:

```bash
# OpenAI (for AI copy generation)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Resend (for emails)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Admin Email
ADMIN_EMAIL=djcalitr@gmail.com

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 3. Install Dependencies

```bash
npm install
```

Dependencies added:
- `openai` - For AI copy generation
- `resend` - For email automation

## 4. Test the System

1. Start development server:
   ```bash
   npm run dev
   ```

2. Go to Admin Panel:
   - Navigate to `http://localhost:3000/admin/releases`
   - You should see the Releases list page

3. Create a new release:
   - Click "+ New Release"
   - Fill in the form:
     - Song Title: "Test Release"
     - City: "Dubai"
     - Country: "UAE"
     - Language: Select a language
     - Release Date: Select a date (try both <7 days and >7 days to test fast mode)
     - Platforms: Select at least one platform
   - Click "Create Release"

4. View release:
   - After creation, you'll be redirected to the release detail page
   - Check the tabs: Overview, Timeline, Platforms, Copy, Emails

## 5. Next Steps (To Be Implemented)

- [ ] Timeline generation on release creation
- [ ] Platform plan generation with AI copy
- [ ] Asset upload functionality
- [ ] Full timeline view with tasks
- [ ] Platform plans view with copy
- [ ] Email automation (cron jobs)
- [ ] Copy pack export

## 6. Troubleshooting

### "Table does not exist" error
- Make sure you ran the SQL schema in Supabase
- Check that all tables were created

### "OpenAI API error"
- Check your `OPENAI_API_KEY` is set correctly
- Make sure you have credits in your OpenAI account

### "Resend API error"
- Check your `RESEND_API_KEY` is set correctly
- Verify the `RESEND_FROM_EMAIL` domain is verified in Resend

### "Unauthorized" error
- Make sure you're logged in as admin
- Check your session is valid
