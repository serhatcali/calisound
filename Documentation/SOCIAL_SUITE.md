# Social Media Suite - Documentation

## Overview

The Social Media Suite is a comprehensive module integrated into the CALI Sound admin panel for managing and scheduling posts across multiple social media platforms.

## Setup

### 1. Database Setup

Run the SQL migration file in Supabase SQL Editor:

```bash
supabase/social-media-schema.sql
```

This creates all necessary tables:
- `social_accounts` - Connected social media accounts
- `social_posts` - Base posts
- `social_post_variants` - Platform-specific versions
- `social_assets` - Images/videos
- `social_templates` - Content templates
- `social_jobs` - Publishing jobs
- `social_metrics_daily` - Analytics data
- `social_audit_log` - Activity logs
- `campaigns` - Campaign management

### 2. Access

Navigate to `/admin/social` in the admin panel. The "Social" menu item has been added to the sidebar.

## Features

### Assisted Mode (Default)

All platforms currently operate in **Assisted Mode**:
- Generate platform-ready captions, titles, descriptions, tags, and hashtags
- One-click copy buttons for each platform
- Export "asset + text pack" as ZIP
- Checklists for manual upload
- Validation and warnings

### Auto-Publish Mode (Future)

Optional connector service for automatic publishing:
- Requires external Node.js server or serverless function
- Handles OAuth flows
- Token encryption and refresh
- API calls to platforms
- **Note:** Not all platforms support auto-publish (Instagram, TikTok have limitations)

## Pages

### 1. Overview (`/admin/social`)

Dashboard showing:
- Drafts awaiting completion
- Today's scheduled posts
- This week's schedule
- Published posts
- Failed posts
- Quick action buttons

### 2. Composer (`/admin/social/compose`)

Create and edit posts:
- Base post information (title, text, city, campaign)
- Platform tabs (YouTube, Shorts, Instagram, Story, TikTok, X, Facebook)
- Real-time validation
- Character counters
- Hashtag management
- Copy/Export functionality

### 3. Library (`/admin/social/library`)

Content management:
- Asset manager (images/videos)
- Templates
- Saved hashtags
- Tag packs

### 4. Schedule (`/admin/social/schedule`)

Scheduling interface:
- Calendar view
- Queue management
- Timezone-aware (default: UTC+3 / Europe/Istanbul)
- Recurring posts
- Quiet hours
- Approval workflow

### 5. Publishing (`/admin/social/publishing`)

Job tracking:
- Status per platform
- Retry failed posts
- Error logs
- Re-run functionality

### 6. Analytics (`/admin/social/analytics`)

Performance metrics:
- Cross-platform analytics
- Post performance
- Click tracking
- CSV export
- Campaign views
- Best posting times
- Top cities/hashtags

### 7. Integrations (`/admin/social/integrations`)

Account management:
- Connect/disconnect accounts
- OAuth flows
- Token management
- Health checks
- Mode indicators (Assisted/Auto)

### 8. Settings (`/admin/social/settings`)

Configuration:
- Role permissions
- Approval requirements
- Posting rules
- Default settings

## Platform Rules

### YouTube / YouTube Shorts
- Max characters: 5000
- Max tags: 500 (comma-separated, 500 chars total)
- Aspect ratio: 16:9 (YouTube) / 9:16 (Shorts)
- Max file size: 128MB

### Instagram Feed
- Max characters: 2200
- Hashtags: 8-30 recommended
- Aspect ratios: 1:1, 4:5, 16:9
- Max file size: 100MB

### Instagram Story
- Max characters: 2200
- Hashtags: Up to 10
- Aspect ratio: 9:16
- Max file size: 100MB

### TikTok
- Max characters: 2200
- Hashtags: Up to 100
- Aspect ratio: 9:16
- Max file size: 287MB

### X (Twitter)
- Max characters: 280
- Hashtags: Up to 10
- Aspect ratios: 16:9, 1:1
- Max file size: 512KB (images)

### Facebook
- Max characters: 63,206
- Hashtags: Up to 30
- Aspect ratios: 16:9, 1:1, 4:5
- Max file size: 4GB

## CALI Workflow Support

### City Releases
- Link posts to cities
- Auto-generate city-specific content
- Use city assets (cover, banner, shorts)

### Bilingual Captions
- English block (required)
- Local language block (optional)
- Structure: `[EN text]\n\n[Local text]`

### Asset Sizes
- 1920x1080 (16:9) - YouTube, Instagram Feed
- 1080x1920 (9:16) - Shorts, Stories, TikTok
- 3000x3000 (1:1) - Instagram Square

### YouTube Tags
- Max 500 characters
- Comma-separated
- Real-time validation
- Character counter

### Hashtag Strategy
- Platform-specific limits
- Duplicate detection
- Recommended counts
- CALI-branded hashtags

### OUT NOW Templates
- Pre-built templates for releases
- City-specific variations
- Platform-optimized

### Countdown Support
- UTC+3 timezone (Europe/Istanbul)
- Countdown timer integration
- Scheduled release posts

## Validation

All platforms have real-time validation:
- Character limits
- Hashtag limits
- Required fields
- Aspect ratio warnings
- Duplicate detection

## Export & Copy

### Copy Pack
One-click copy for each platform:
- Title/Caption
- Description
- Hashtags
- Tags (YouTube)
- First comment (Instagram)

### Export Pack (ZIP)
Download package containing:
- All platform variants (text files)
- Selected assets
- Checklist for manual upload
- Metadata JSON

## Development Status

### ✅ Completed
- Database schema
- TypeScript types
- Overview page
- Composer page (basic)
- Validation utilities
- Services layer
- Route structure

### 🚧 In Progress
- Composer full functionality
- Save/Update posts
- Copy/Export features
- Asset management

### 📋 Planned
- Schedule calendar
- Publishing jobs
- Analytics dashboard
- Integrations UI
- Settings page
- Auto-publish connector

## Testing

1. **Local Setup:**
   ```bash
   npm run dev
   ```

2. **Access Admin:**
   - Navigate to `/admin/login`
   - Login with admin credentials

3. **Test Social Module:**
   - Click "Social" in sidebar
   - Try creating a post in Composer
   - Check validation rules

4. **Database:**
   - Run `supabase/social-media-schema.sql` in Supabase
   - Verify tables created
   - Check RLS policies

## Notes

- All routes are protected by `requireAdmin()`
- Uses existing admin layout and styling
- Follows project conventions
- No breaking changes to existing admin pages
- Ready for incremental feature additions

## Next Steps

1. Complete composer save functionality
2. Add asset upload/management
3. Implement copy/export features
4. Build schedule calendar
5. Add analytics data collection
6. Create integration UI
7. (Optional) Build connector service for auto-publish
