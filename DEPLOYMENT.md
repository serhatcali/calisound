# CALI Sound - Deployment Guide

This guide covers deploying the CALI Sound website to Namecheap Stellar hosting with static export.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Namecheap Stellar hosting account
- Domain configured and verified

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key from Settings > API

### 1.2 Set Up Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the SQL script
4. Verify tables are created: `cities`, `sets`, `global_links`, `click_tracking`

### 1.3 Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `city-assets`
3. Set it to public
4. Create folders: `covers/`, `banners/`, `shorts/`
5. Upload your city assets to respective folders

### 1.4 Insert Seed Data (Optional)

1. Go to SQL Editor
2. Copy and paste `supabase/seed-data.sql`
3. Update image URLs to match your Supabase storage URLs
4. Run the script

### 1.5 Configure Row Level Security

The schema includes RLS policies for public read access. For admin operations:

1. Go to Authentication > Policies
2. Create policies for authenticated users to INSERT/UPDATE/DELETE
3. Set up authentication if you need an admin panel (future enhancement)

## Step 2: Local Development Setup

### 2.1 Install Dependencies

```bash
cd cali-sound
npm install
```

### 2.2 Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://calisound.com
```

### 2.3 Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to verify everything works.

## Step 3: Build Static Export

### 3.1 Build the Site

```bash
npm run build
```

This will:
- Generate static HTML files
- Optimize assets
- Create the `out/` directory with all static files

### 3.2 Verify Build

Check the `out/` directory contains:
- `index.html`
- All page directories
- Static assets (CSS, JS, images)
- `sitemap.xml`
- `robots.txt`

## Step 4: Deploy to Namecheap

### 4.1 Access cPanel

1. Log into Namecheap account
2. Go to Hosting List
3. Click "Manage" on your Stellar plan
4. Access cPanel

### 4.2 Upload Files

**Option A: Using cPanel File Manager**

1. Navigate to `public_html` folder
2. Delete default files (if any)
3. Upload all contents from `out/` directory
4. Ensure `index.html` is in the root of `public_html`

**Option B: Using FTP**

1. Get FTP credentials from cPanel
2. Connect using FileZilla or similar
3. Upload all files from `out/` to `public_html/`

### 4.3 Set Up SSL

1. In cPanel, go to SSL/TLS Status
2. Install Let's Encrypt SSL certificate
3. Force HTTPS redirect (in cPanel or via `.htaccess`)

### 4.4 Configure .htaccess (Optional)

Create `.htaccess` in `public_html/` for better routing:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

## Step 5: Domain Configuration

### 5.1 DNS Settings

Ensure your domain DNS points to Namecheap:
- A Record: `@` → Your server IP
- CNAME: `www` → Your domain

### 5.2 Verify Domain

1. Wait for DNS propagation (up to 48 hours)
2. Test your site: `https://calisound.com`
3. Verify SSL certificate is active

## Step 6: Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] Images load from Supabase storage
- [ ] Links work correctly
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Sitemap accessible: `https://calisound.com/sitemap.xml`
- [ ] Robots.txt accessible: `https://calisound.com/robots.txt`

## Step 7: Updating the Site

When you need to update content:

1. **Update Supabase data** (cities, sets, links)
2. **Rebuild locally**:
   ```bash
   npm run build
   ```
3. **Upload new `out/` contents** to `public_html/`
4. **Clear browser cache** if needed

## Troubleshooting

### Images Not Loading

- Verify Supabase storage bucket is public
- Check image URLs in database match storage paths
- Ensure CORS is configured in Supabase

### 404 Errors on Routes

- Ensure `.htaccess` is configured correctly
- Verify all files uploaded to `public_html/`
- Check Next.js routing in `next.config.js`

### Supabase Connection Issues

- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies allow public read access

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

## Performance Optimization

1. **Image Optimization**: Use Supabase storage with proper image sizing
2. **Caching**: Configure browser caching via `.htaccess`
3. **CDN**: Consider Cloudflare for better global performance
4. **Lighthouse**: Run Lighthouse audit and optimize based on recommendations

## Security Notes

- Never commit `.env.local` to git
- Supabase anon key is safe for public use (RLS protects data)
- Use Supabase Auth for admin operations
- Regularly update dependencies: `npm audit fix`

## Support

For issues:
1. Check Supabase logs
2. Check browser console for errors
3. Verify all environment variables
4. Review Next.js build output

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
