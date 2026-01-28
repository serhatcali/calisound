# OAuth Integration Setup Guide

## 1. Veritabanı Şeması

Önce OAuth states tablosunu oluşturun:

```sql
-- Supabase SQL Editor'de çalıştırın
-- supabase/oauth-states-schema.sql dosyasını çalıştırın
```

## 2. Environment Variables

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```bash
# Base URL (production'da domain'inizi kullanın)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# OAuth Encryption Key (güvenli bir key oluşturun)
OAUTH_ENCRYPTION_KEY=your-64-character-hex-key-here

# YouTube/Google OAuth
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret

# Instagram/Facebook OAuth (Meta)
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Twitter/X OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# TikTok OAuth
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
```

### Encryption Key Oluşturma

Encryption key oluşturmak için:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Veya Node.js REPL'de:
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
```

## 3. Platform-Specific Setup

### YouTube (Google OAuth 2.0)

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services > Credentials**'a gidin
4. **Create Credentials > OAuth client ID** seçin
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/admin/social/oauth/youtube/callback` (production'da domain'inizi kullanın)
7. Scopes:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
8. Client ID ve Secret'ı `.env.local`'e ekleyin

### Instagram (Meta Graph API)

1. [Meta for Developers](https://developers.facebook.com/)'a gidin
2. Yeni bir App oluşturun
3. **Instagram Basic Display** veya **Instagram Graph API** product'ını ekleyin
4. **Settings > Basic**'te App ID ve App Secret'ı görün
5. **Products > Instagram > Basic Display > Settings**'e gidin
6. Valid OAuth Redirect URIs: `http://localhost:3000/api/admin/social/oauth/instagram/callback`
7. Required permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`

### Facebook (Meta Graph API)

1. Aynı Meta App'i kullanabilirsiniz
2. **Products > Facebook Login** ekleyin
3. **Settings > Basic**'te App ID ve Secret'ı kullanın
4. Valid OAuth Redirect URIs: `http://localhost:3000/api/admin/social/oauth/facebook/callback`
5. Required permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`

### Twitter/X OAuth 2.0

1. [Twitter Developer Portal](https://developer.twitter.com/)'a gidin
2. Yeni bir App oluşturun
3. **User authentication settings**'e gidin
4. OAuth 2.0'ı etkinleştirin
5. Callback URI: `http://localhost:3000/api/admin/social/oauth/twitter/callback`
6. Scopes:
   - `tweet.read`
   - `tweet.write`
   - `users.read`
   - `offline.access`
7. Client ID ve Secret'ı `.env.local`'e ekleyin

### TikTok OAuth

1. [TikTok for Developers](https://developers.tiktok.com/)'a gidin
2. Yeni bir App oluşturun
3. **Basic Information**'da Client Key ve Client Secret'ı görün
4. **Redirect URI**: `http://localhost:3000/api/admin/social/oauth/tiktok/callback`
5. Scopes:
   - `user.info.basic`
   - `video.upload`
   - `video.publish`

## 4. Test Etme

1. Development server'ı başlatın: `npm run dev`
2. Admin panelinde **Social > Integrations** sayfasına gidin
3. Bir platform için **Connect** butonuna tıklayın
4. OAuth flow'u tamamlayın
5. Hesabın "connected" olarak göründüğünü kontrol edin

## 5. Sorun Giderme

### "OAuth not configured" hatası
- Environment variables'ların doğru ayarlandığından emin olun
- Server'ı yeniden başlatın

### "Invalid state" hatası
- Cookie'lerin etkin olduğundan emin olun
- Aynı browser session'ında OAuth flow'unu tamamlayın

### Token encryption hatası
- `OAUTH_ENCRYPTION_KEY`'in 64 karakter hex string olduğundan emin olun
- Key'i değiştirdiyseniz, mevcut encrypted token'lar çalışmayacaktır

### Platform-specific hatalar
- Her platform için redirect URI'lerin doğru yapılandırıldığından emin olun
- Scopes'ların doğru olduğundan emin olun
- App'lerin production modunda olup olmadığını kontrol edin (bazı platformlar development modunda sınırlıdır)

## 6. Production Deployment

1. Tüm environment variables'ları production environment'a ekleyin
2. `NEXT_PUBLIC_BASE_URL`'i production domain'inize ayarlayın
3. Her platform için redirect URI'leri production domain'inize güncelleyin
4. Encryption key'i güvenli bir şekilde saklayın (environment variable veya secret management service)

## 7. Token Refresh

Token refresh mekanizması otomatik olarak çalışır. Expired token'lar refresh edilir. Eğer refresh token da expired olursa, kullanıcının yeniden bağlanması gerekir.
