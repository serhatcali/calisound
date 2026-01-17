# CALI Sound - Global Afro House City Series

A production-grade, professional website for the CALI Sound global Afro House music project.

## 🎵 About

CALI Sound is a global Afro House music project that takes listeners on a journey through cities around the world. Each release captures the essence of a different city through melodic club music.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) with Static Export
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Namecheap Stellar (Static Files)
- **Language**: TypeScript

## 📋 Features

- ✅ City listing with filtering (mood, region, status)
- ✅ City detail pages with multiple image formats
- ✅ Release countdown timers
- ✅ Copy-to-clipboard tools for YouTube metadata
- ✅ DJ Set listings and embeds
- ✅ Link-in-bio page with click tracking
- ✅ Press kit with downloadable assets
- ✅ Contact form
- ✅ SEO optimized (metadata, sitemap, robots.txt)
- ✅ Fully responsive, mobile-first design
- ✅ Smooth animations and transitions

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Supabase account
- Namecheap hosting (or similar static hosting)

### Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://calisound.com
```

5. Set up Supabase database (see `supabase/schema.sql`)

6. Run development server:
```bash
npm run dev
```

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

This creates a static export in the `out/` directory.

### Deploy to Namecheap

1. Upload all files from `out/` to `public_html/` via cPanel or FTP
2. Configure SSL certificate
3. Set up domain redirects if needed

See `DEPLOYMENT.md` for detailed instructions.

## 📁 Project Structure

```
cali-sound/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── cities/            # Cities listing
│   ├── city/[slug]/      # City detail pages
│   ├── sets/              # DJ Sets pages
│   ├── links/             # Link-in-bio page
│   ├── presskit/          # Press kit page
│   └── contact/           # Contact page
├── components/            # React components
│   ├── home/              # Home page components
│   ├── cities/            # Cities page components
│   ├── city/              # City detail components
│   └── sets/              # Sets components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── db.ts             # Database queries
├── types/                 # TypeScript types
├── supabase/             # Database schema and seed data
└── public/               # Static assets
```

## 🗄️ Database Schema

### Tables

- **cities**: City information, media URLs, descriptions
- **sets**: DJ set information and YouTube embeds
- **global_links**: Social media and streaming platform links
- **click_tracking**: Analytics for link clicks

See `supabase/schema.sql` for full schema.

## 🎨 Design System

- **Colors**: Bright, premium palette with primary and accent colors
- **Typography**: Inter font family
- **Spacing**: Large, breathable layout
- **Shadows**: Soft, subtle shadows
- **Border Radius**: 2xl (1.5rem) for modern look
- **No People**: City/architecture/abstract visuals only

## 📱 Pages

1. **Home** (`/`): Hero, latest release, city grid, featured set
2. **Cities** (`/cities`): Filterable city listing
3. **City Detail** (`/city/[slug]`): Full city page with all features
4. **Sets** (`/sets`): DJ set listings
5. **Links** (`/links`): Mobile-first link-in-bio
6. **Press Kit** (`/presskit`): Downloadable assets
7. **Contact** (`/contact`): Contact form

## 🔧 Configuration

### Next.js Config

Static export is configured in `next.config.js`:
- `output: 'export'` - Generates static files
- `images.unoptimized: true` - Required for static export
- `trailingSlash: true` - Better compatibility

### Supabase

- Public read access for cities, sets, global_links
- Public insert for click_tracking
- Admin operations require authentication (future enhancement)

## 📊 Analytics

Click tracking is implemented for:
- All outbound links
- Social media buttons
- Streaming platform links

Data is stored in `click_tracking` table in Supabase.

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Public read policies for content
- Environment variables for sensitive data
- No backend code on hosting (static only)

## 📈 SEO

- Dynamic metadata per page
- OpenGraph images
- Twitter Cards
- Sitemap generation
- Robots.txt
- Semantic HTML

## 🚧 Future Enhancements

- Admin panel for content management
- User authentication
- Newsletter signup
- Advanced analytics dashboard
- PWA support
- Multi-language support (beyond EN + Local)

## 📝 License

Proprietary - CALI Sound

## 🤝 Support

For deployment issues, see `DEPLOYMENT.md`.
For database setup, see `supabase/schema.sql`.

---

**Built with ❤️ for CALI Sound**
