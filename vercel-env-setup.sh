#!/bin/bash

# 🚀 Vercel Environment Variables Setup Script
# Bu script Vercel CLI ile environment variables ayarlar
# Kullanım: ./vercel-env-setup.sh

echo "🔐 Vercel Environment Variables Setup"
echo "======================================"
echo ""

# SESSION_SECRET oluştur
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "✅ SESSION_SECRET oluşturuldu: $SESSION_SECRET"
echo ""

# Vercel CLI kontrolü
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI bulunamadı!"
    echo "Kurulum: npm i -g vercel"
    exit 1
fi

echo "📋 Aşağıdaki environment variables'ları ayarlayın:"
echo ""
echo "KRİTİK (MUTLAKA AYARLA):"
echo "------------------------"
echo "1. ADMIN_PASSWORD=<güçlü-şifre>"
echo "2. SESSION_SECRET=$SESSION_SECRET"
echo ""
echo "API KEYS:"
echo "---------"
echo "3. NEXT_PUBLIC_YOUTUBE_API_KEY=<youtube-api-key>"
echo "4. SPOTIFY_CLIENT_ID=<spotify-client-id>"
echo "5. SPOTIFY_CLIENT_SECRET=<spotify-client-secret>"
echo ""
echo "EMAIL:"
echo "------"
echo "6. CONTACT_EMAIL=<your-email@example.com>"
echo "7. CONTACT_EMAIL_SUBJECT=New Contact Form Submission"
echo ""
echo "SUPABASE:"
echo "---------"
echo "8. NEXT_PUBLIC_SUPABASE_URL=<supabase-url>"
echo "9. NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>"
echo "10. SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>"
echo ""
echo "OPSİYONEL:"
echo "---------"
echo "11. APPLE_MUSIC_TEAM_ID=<team-id>"
echo "12. APPLE_MUSIC_KEY_ID=<key-id>"
echo "13. APPLE_MUSIC_PRIVATE_KEY_PATH=<private-key-path>"
echo "14. NEXT_PUBLIC_GA_ID=<ga-id>"
echo "15. NEXT_PUBLIC_GSC_VERIFICATION=<gsc-verification>"
echo ""
echo "🌍 ENVIRONMENT:"
echo "---------------"
echo "16. NODE_ENV=production (Vercel otomatik ayarlar)"
echo ""
echo "======================================"
echo ""
echo "💡 İPUCU: Vercel Dashboard'dan ayarlamak için:"
echo "1. https://vercel.com → Projen → Settings → Environment Variables"
echo "2. Her variable'ı tek tek ekle"
echo ""
echo "VEYA Vercel CLI ile:"
echo "vercel env add ADMIN_PASSWORD production"
echo "vercel env add SESSION_SECRET production"
echo "..."
echo ""
echo "✅ Hazır! Environment variables'ları ayarladıktan sonra deploy et!"
