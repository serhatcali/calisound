# 🔐 Environment Variables Kurulum Rehberi

Bu rehber, projeye eklenen yeni özellikler için gerekli environment variable'ları nasıl alacağınızı ve nereye ekleyeceğinizi açıklar.

---

## 📍 Dosya Konumu

Environment variable'ları **`.env.local`** dosyasına ekleyeceksiniz.

**Dosya yolu**: `/Users/serhatcali/Desktop/cali-sound/.env.local`

> ⚠️ **Not**: Bu dosya `.gitignore`'da olduğu için görünmeyebilir. Terminal'den oluşturabilir veya editörde "Show Hidden Files" seçeneğini açabilirsiniz.

---

## 🚀 Hızlı Başlangıç

### 1. Dosyayı Açın/Oluşturun

**Terminal ile:**
```bash
cd /Users/serhatcali/Desktop/cali-sound
nano .env.local
# veya
code .env.local
```

**Veya Cursor/VS Code'da:**
- Proje klasöründe `.env.local` dosyasını arayın
- Yoksa oluşturun (File > New File > `.env.local`)

---

## 📋 Gerekli Environment Variables

### ✅ Zorunlu (Mevcut)

```env
# Supabase (Zaten var olmalı)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 🆕 Yeni Eklenen (Opsiyonel ama Önerilen)

```env
# YouTube API (View Counts için)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# Google Analytics (Analytics Tracking için)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (Error Tracking için - Opsiyonel)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

---

## 🔑 1. YouTube API Key Nasıl Alınır?

### Adım 1: Google Cloud Console'a Gidin
1. https://console.cloud.google.com/ adresine gidin
2. Google hesabınızla giriş yapın

### Adım 2: Yeni Proje Oluşturun (veya mevcut projeyi seçin)
1. Üst menüden proje seçiciyi açın
2. "New Project" tıklayın
3. Proje adı: "CALI Sound" (veya istediğiniz bir isim)
4. "Create" tıklayın

### Adım 3: YouTube Data API v3'ü Etkinleştirin
1. Sol menüden **"APIs & Services" > "Library"** seçin
2. Arama kutusuna **"YouTube Data API v3"** yazın
3. "YouTube Data API v3" seçin
4. **"Enable"** butonuna tıklayın

### Adım 4: API Key Oluşturun
1. Sol menüden **"APIs & Services" > "Credentials"** seçin
2. Üstte **"+ CREATE CREDENTIALS"** tıklayın
3. **"API key"** seçin
4. API key oluşturulacak, kopyalayın

### Adım 5: API Key'i Kısıtlayın (Güvenlik için - Önerilen)
1. Oluşturulan API key'in yanındaki **"Edit"** (kalem ikonu) tıklayın
2. **"Application restrictions"** altında:
   - **"HTTP referrers (web sites)"** seçin
   - **"Website restrictions"** altına sitenizi ekleyin:
     - `http://localhost:3000/*`
     - `http://localhost:3002/*`
     - `https://calisound.com/*`
     - `https://*.calisound.com/*`
3. **"API restrictions"** altında:
   - **"Restrict key"** seçin
   - **"YouTube Data API v3"** seçin
4. **"Save"** tıklayın

### Adım 6: .env.local'e Ekleyin
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> 💡 **Not**: API key ücretsizdir ve günde 10,000 istek limiti vardır (genellikle yeterlidir).

---

## 📊 2. Google Analytics ID Nasıl Alınır?

### Adım 1: Google Analytics'e Gidin
1. https://analytics.google.com/ adresine gidin
2. Google hesabınızla giriş yapın

### Adım 2: Hesap Oluşturun (İlk kez kullanıyorsanız)
1. **"Start measuring"** veya **"Create Account"** tıklayın
2. Hesap adı: "CALI Sound" (veya istediğiniz bir isim)
3. **"Next"** tıklayın

### Adım 3: Property Oluşturun
1. Property adı: "CALI Sound Website"
2. Reporting time zone: Türkiye (veya istediğiniz)
3. Currency: TRY (veya istediğiniz)
4. **"Next"** tıklayın

### Adım 4: Business Bilgilerini Doldurun
1. Industry category: "Arts & Entertainment" (veya uygun olan)
2. Business size: Seçin
3. **"Create"** tıklayın

### Adım 5: Data Stream Oluşturun
1. **"Web"** seçin
2. Website URL: `https://calisound.com` (veya localhost için `http://localhost:3000`)
3. Stream name: "CALI Sound Web"
4. **"Create stream"** tıklayın

### Adım 6: Measurement ID'yi Kopyalayın
1. Oluşturulan stream'in altında **"Measurement ID"** görünecek
2. Format: `G-XXXXXXXXXX` (G- ile başlar)
3. Bu ID'yi kopyalayın

### Adım 7: .env.local'e Ekleyin
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

> 💡 **Not**: Google Analytics ücretsizdir ve sınırsız kullanım sunar.

---

## 🐛 3. Sentry DSN Nasıl Alınır? (Opsiyonel)

Sentry, production'da hataları takip etmek için kullanılır. Geliştirme aşamasında zorunlu değildir.

### Adım 1: Sentry Hesabı Oluşturun
1. https://sentry.io/signup/ adresine gidin
2. Ücretsiz hesap oluşturun (GitHub/Google ile giriş yapabilirsiniz)

### Adım 2: Yeni Proje Oluşturun
1. Dashboard'da **"Create Project"** tıklayın
2. Platform: **"Next.js"** seçin
3. Project name: "CALI Sound"
4. **"Create Project"** tıklayın

### Adım 3: DSN'i Kopyalayın
1. Proje oluşturulduktan sonra **"DSN"** görünecek
2. Format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
3. Bu DSN'i kopyalayın

### Adım 4: .env.local'e Ekleyin
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

> 💡 **Not**: Sentry ücretsiz planında ayda 5,000 event limiti vardır (genellikle yeterlidir).

---

## 📝 Örnek .env.local Dosyası

Tam bir örnek:

```env
# Supabase (Zorunlu)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# YouTube API (View Counts için - Önerilen)
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Google Analytics (Analytics için - Önerilen)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (Error Tracking için - Opsiyonel)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Site URL (SEO için)
NEXT_PUBLIC_SITE_URL=https://calisound.com
```

---

## ✅ Kontrol Listesi

- [ ] `.env.local` dosyası oluşturuldu
- [ ] Supabase credentials eklendi (zaten var olmalı)
- [ ] YouTube API key alındı ve eklendi
- [ ] Google Analytics ID alındı ve eklendi
- [ ] Sentry DSN alındı ve eklendi (opsiyonel)
- [ ] Development server yeniden başlatıldı (`npm run dev`)

---

## 🔄 Server'ı Yeniden Başlatın

Environment variable'ları ekledikten sonra:

```bash
# Mevcut server'ı durdurun (Ctrl+C)
# Sonra tekrar başlatın:
npm run dev
```

---

## 🧪 Test Edin

### YouTube API Test
1. Bir city sayfasına gidin
2. View count görünüyor mu kontrol edin
3. Browser console'da hata var mı kontrol edin

### Google Analytics Test
1. Browser console'u açın (F12)
2. Network tab'ında `gtag` istekleri görünüyor mu kontrol edin
3. Google Analytics dashboard'da real-time visitors görünüyor mu kontrol edin

### Sentry Test (Opsiyonel)
1. Bir hata oluşturun (örneğin: olmayan bir sayfaya gidin)
2. Sentry dashboard'da error görünüyor mu kontrol edin

---

## ❓ Sorun Giderme

### "YouTube API key not found" uyarısı
→ `.env.local` dosyasında `NEXT_PUBLIC_YOUTUBE_API_KEY` olduğundan emin olun
→ Server'ı yeniden başlattınız mı?

### "Google Analytics not loading"
→ `.env.local` dosyasında `NEXT_PUBLIC_GA_ID` olduğundan emin olun
→ Measurement ID formatı `G-XXXXXXXXXX` şeklinde olmalı

### "Sentry not initialized"
→ `.env.local` dosyasında `NEXT_PUBLIC_SENTRY_DSN` olduğundan emin olun
→ DSN formatı `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx` şeklinde olmalı

### View counts görünmüyor
→ YouTube API key doğru mu?
→ Browser console'da hata var mı?
→ API quota limiti aşılmış olabilir (günde 10,000 istek)

---

## 🔒 Güvenlik Notları

1. **`.env.local` dosyasını ASLA git'e commit etmeyin** (zaten .gitignore'da)
2. **API key'leri paylaşmayın**
3. **Production'da environment variable'ları hosting provider'ınızda ayarlayın** (Vercel, Netlify, vb.)
4. **YouTube API key'i kısıtlayın** (sadece kendi domain'inizden çalışsın)

---

## 📚 Ek Kaynaklar

- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [Google Analytics Documentation](https://developers.google.com/analytics)
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

**Son Güncelleme**: 2026-01-17
