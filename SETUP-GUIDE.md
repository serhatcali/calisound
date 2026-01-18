# 🚀 Environment Variables Kurulum Rehberi - Adım Adım

Bu rehberi birlikte takip ederek tüm environment variable'ları ekleyeceğiz.

---

## 📋 Kurulum Sırası

1. ✅ YouTube API Key (View Counts için)
2. ✅ Google Analytics ID (Analytics için)
3. ✅ Sentry DSN (Error Tracking için - Opsiyonel)

---

## 🎬 ADIM 1: YouTube API Key

### 1.1 Google Cloud Console'a Gidin
👉 **https://console.cloud.google.com/**

### 1.2 Proje Oluşturun veya Seçin
- Üst menüde proje seçiciyi açın
- "New Project" tıklayın
- Proje adı: **"CALI Sound"**
- "Create" tıklayın

### 1.3 YouTube Data API v3'ü Etkinleştirin
- Sol menüden **"APIs & Services" > "Library"**
- Arama: **"YouTube Data API v3"**
- "Enable" tıklayın

### 1.4 API Key Oluşturun
- Sol menüden **"APIs & Services" > "Credentials"**
- **"+ CREATE CREDENTIALS" > "API key"**
- API key oluşturulacak, **KOPYALAYIN**

### 1.5 API Key'i Kısıtlayın (Güvenlik)
- Oluşturulan key'in yanında **"Edit"** (kalem ikonu)
- **"Application restrictions"**: "HTTP referrers (web sites)"
- **"Website restrictions"** altına ekleyin:
  ```
  http://localhost:3000/*
  http://localhost:3002/*
  https://calisound.com/*
  https://*.calisound.com/*
  ```
- **"API restrictions"**: "Restrict key"
- Sadece **"YouTube Data API v3"** seçin
- **"Save"** tıklayın

### 1.6 .env.local'e Ekleyin
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=buraya_kopyaladiginiz_key
```

---

## 📊 ADIM 2: Google Analytics ID

### 2.1 Google Analytics'e Gidin
👉 **https://analytics.google.com/**

### 2.2 Hesap Oluşturun (İlk kez)
- **"Start measuring"** veya **"Create Account"**
- Hesap adı: **"CALI Sound"**
- **"Next"**

### 2.3 Property Oluşturun
- Property adı: **"CALI Sound Website"**
- Time zone: **Türkiye**
- Currency: **TRY**
- **"Next"**

### 2.4 Business Bilgileri
- Industry: **"Arts & Entertainment"**
- Business size: Seçin
- **"Create"**

### 2.5 Data Stream Oluşturun
- **"Web"** seçin
- Website URL: **`https://calisound.com`**
- Stream name: **"CALI Sound Web"**
- **"Create stream"**

### 2.6 Measurement ID'yi Kopyalayın
- **"Measurement ID"** görünecek
- Format: **`G-XXXXXXXXXX`**
- **KOPYALAYIN**

### 2.7 .env.local'e Ekleyin
```env
NEXT_PUBLIC_GA_ID=G-buraya_kopyaladiginiz_id
```

---

## 🐛 ADIM 3: Sentry DSN (Opsiyonel)

### 3.1 Sentry'ye Gidin
👉 **https://sentry.io/signup/**

### 3.2 Hesap Oluşturun
- GitHub/Google ile giriş yapabilirsiniz
- Ücretsiz plan seçin

### 3.3 Proje Oluşturun
- **"Create Project"**
- Platform: **"Next.js"**
- Project name: **"CALI Sound"**
- **"Create Project"**

### 3.4 DSN'i Kopyalayın
- **"DSN"** görünecek
- Format: **`https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`**
- **KOPYALAYIN**

### 3.5 .env.local'e Ekleyin
```env
NEXT_PUBLIC_SENTRY_DSN=https://buraya_kopyaladiginiz_dsn
```

---

## ✅ Son Kontrol

Tüm değişkenler eklendikten sonra `.env.local` dosyanız şöyle görünmeli:

```env
# Supabase (Zaten var)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSy...

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (Opsiyonel)
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🔄 Server'ı Yeniden Başlatın

```bash
npm run dev
```

---

Hazır mısınız? İlk adımdan başlayalım! 🚀
