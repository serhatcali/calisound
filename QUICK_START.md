# CALI Sound - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run `supabase/schema.sql`
4. Create storage bucket `city-assets` (public)
5. Copy your project URL and anon key

### 3. Configure Environment

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_SITE_URL=https://calisound.com
```

### 4. Add Sample Data (Optional)

Run `supabase/seed-data.sql` in Supabase SQL Editor (update image URLs first)

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
```

Upload `out/` folder contents to your hosting `public_html/`

## 📋 Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Storage bucket created
- [ ] Environment variables set
- [ ] Site runs locally
- [ ] Build completes successfully
- [ ] Files uploaded to hosting
- [ ] SSL certificate installed
- [ ] Domain configured

## 🆘 Common Issues

**Build fails?**
- Check Node.js version (18+)
- Clear `.next` folder
- Verify environment variables

**Images not loading?**
- Check Supabase storage is public
- Verify image URLs in database
- Check CORS settings

**404 errors?**
- Ensure `.htaccess` is configured
- Check file upload paths
- Verify Next.js routing

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed deployment instructions.
See `README.md` for complete project documentation.
