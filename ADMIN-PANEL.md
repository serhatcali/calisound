# Admin Panel Documentation

## Overview

The CALI Sound admin panel provides a comprehensive interface for managing all aspects of the website.

## Access

1. Navigate to `/admin/login`
2. Enter the admin password (set in `.env.local` as `ADMIN_PASSWORD`)
3. Default password: `admin123` (change this in production!)

## Features

### 1. Dashboard (`/admin`)
- Overview statistics (Total Cities, Sets, Published, Coming Soon)
- Recent cities and sets
- Quick navigation to all sections

### 2. Cities Management (`/admin/cities`)
- **List View**: View all cities with search and filter options
- **Create/Edit**: Full CRUD operations for cities
- **Fields**:
  - Basic info (name, slug, country, region, status)
  - Media URLs (cover, banner, shorts)
  - Links (YouTube, Instagram, TikTok, Spotify, Apple Music)
  - Descriptions (English & Local)
  - YouTube metadata (title, description, tags)
  - ISRC code
  - Release date/time

### 3. Sets Management (`/admin/sets`)
- **List View**: View all DJ sets with search
- **Create/Edit**: Full CRUD operations for sets
- **Fields**:
  - Title
  - YouTube embed URL
  - Duration
  - Description
  - Chapters (timestamps)
  - Thumbnail URL

### 4. Global Links (`/admin/links`)
- Manage global links that appear site-wide
- Updates automatically across:
  - Homepage "Listen Everywhere" section
  - Footer
  - All city pages (if not overridden)
- Supported platforms:
  - YouTube
  - Instagram
  - TikTok
  - Spotify
  - Apple Music
  - SoundCloud
  - X (Twitter)
  - Facebook

### 5. Settings (`/admin/settings`)
- **Google Analytics**: Add your GA4 Measurement ID
- **Google Search Console**: Add verification code
- **Contact Form**: Configure email settings
  - Contact email address
  - Email subject template
- **Admin Settings**: Change admin password

### 6. Contacts (`/admin/contacts`)
- View all contact form submissions
- Delete messages
- Email addresses are clickable (mailto links)

## API Endpoints

All admin endpoints require authentication:

- `POST /api/admin/login` - Login
- `POST /api/admin/logout` - Logout
- `GET /api/admin/cities` - List cities
- `POST /api/admin/cities` - Create city
- `PUT /api/admin/cities/[id]` - Update city
- `DELETE /api/admin/cities/[id]` - Delete city
- `GET /api/admin/sets` - List sets
- `POST /api/admin/sets` - Create set
- `PUT /api/admin/sets/[id]` - Update set
- `DELETE /api/admin/sets/[id]` - Delete set
- `PUT /api/admin/links` - Update global links
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/contacts` - List contacts
- `DELETE /api/admin/contacts/[id]` - Delete contact

## Environment Variables

Add these to your `.env.local`:

```env
# Admin
ADMIN_PASSWORD=your_secure_password_here

# Contact Form
CONTACT_EMAIL=contact@calisound.com
CONTACT_EMAIL_SUBJECT=New Contact Form Submission

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Search Console
NEXT_PUBLIC_GSC_VERIFICATION=your_verification_code
```

## Database Tables

The admin panel uses these Supabase tables:

- `cities` - City entries
- `sets` - DJ sets
- `global_links` - Global links (single row)
- `contacts` - Contact form submissions (optional, will be created if needed)

## Security Notes

1. **Change the default password** in production
2. Admin authentication uses HTTP-only cookies
3. All admin routes are protected server-side
4. Consider adding rate limiting for production
5. For production, consider implementing:
   - Multi-factor authentication
   - Role-based access control
   - Activity logging
   - IP whitelisting

## Future Enhancements

- Email notifications for contact form submissions
- Bulk operations (delete multiple items)
- Image upload functionality
- Analytics dashboard
- Activity logs
- User management (multiple admins)
