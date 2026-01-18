# 🔐 ENVIRONMENT VARIABLES TEMPLATE

## 📋 Vercel Dashboard'da Ayarlanacak Environment Variables

Vercel Dashboard → Your Project → Settings → Environment Variables

---

## ✅ KRİTİK (MUTLAKA AYARLA!)

### 1. `ADMIN_PASSWORD`
**Açıklama:** Admin paneli şifresi  
**Değer:** Güçlü bir şifre (en az 16 karakter)  
**Örnek:** `MySecurePassword123!@#`  
**⚠️ ÖNEMLİ:** Production'da mutlaka güçlü bir şifre kullan!

### 2. `SESSION_SECRET`
**Açıklama:** Session token encryption için secret key  
**Değer:** 64 karakter random hex string  
**Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Örnek:** `44793e946f2bb3d4b628e2d8eba9e28365efde1c071930c74343932c3444ceac`  
**⚠️ ÖNEMLİ:** Her deployment için farklı olmalı!

---

## 🔑 API KEYS (Gerekli)

### 3. `NEXT_PUBLIC_YOUTUBE_API_KEY`
**Açıklama:** YouTube Data API v3 key  
**Nasıl Alınır:**
1. https://console.cloud.google.com → API & Services → Credentials
2. "Create Credentials" → "API Key"
3. YouTube Data API v3'ü enable et
4. API key'i kopyala

### 4. `SPOTIFY_CLIENT_ID`
**Açıklama:** Spotify API Client ID  
**Nasıl Alınır:**
1. https://developer.spotify.com/dashboard
2. "Create App"
3. Client ID'yi kopyala

### 5. `SPOTIFY_CLIENT_SECRET`
**Açıklama:** Spotify API Client Secret  
**Nasıl Alınır:**
1. Spotify Developer Dashboard → Your App
2. "Show Client Secret"
3. Secret'ı kopyala

---

## 📧 EMAIL (Gerekli)

### 6. `CONTACT_EMAIL`
**Açıklama:** Contact form'dan gelen email'lerin gönderileceği adres  
**Değer:** Email adresi  
**Örnek:** `contact@yourdomain.com` veya `info@yourdomain.com`

### 7. `CONTACT_EMAIL_SUBJECT`
**Açıklama:** Contact form email subject  
**Değer:** String  
**Örnek:** `New Contact Form Submission` (varsayılan)

---

## 🗄️ SUPABASE (Gerekli)

### 8. `NEXT_PUBLIC_SUPABASE_URL`
**Açıklama:** Supabase project URL  
**Nasıl Alınır:**
1. Supabase Dashboard → Project Settings → API
2. "Project URL" değerini kopyala
3. Format: `https://xxxxx.supabase.co`

### 9. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Açıklama:** Supabase anonymous/public key  
**Nasıl Alınır:**
1. Supabase Dashboard → Project Settings → API
2. "anon public" key'i kopyala

### 10. `SUPABASE_SERVICE_ROLE_KEY`
**Açıklama:** Supabase service role key (admin işlemleri için)  
**Nasıl Alınır:**
1. Supabase Dashboard → Project Settings → API
2. "service_role" key'i kopyala
3. **⚠️ ÖNEMLİ:** Bu key'i asla client-side'da kullanma!

---

## 🍎 APPLE MUSIC (Opsiyonel)

### 11. `APPLE_MUSIC_TEAM_ID`
**Açıklama:** Apple Developer Team ID  
**Nasıl Alınır:**
1. https://developer.apple.com/account
2. Membership → Team ID

### 12. `APPLE_MUSIC_KEY_ID`
**Açıklama:** Apple Music API Key ID  
**Nasıl Alınır:**
1. Apple Developer → Certificates, Identifiers & Profiles
2. Keys → Create a new key
3. Apple Music API'yi enable et
4. Key ID'yi kopyala

### 13. `APPLE_MUSIC_PRIVATE_KEY_PATH`
**Açıklama:** Apple Music private key file path  
**Not:** Vercel'de file upload için farklı bir yöntem gerekebilir

---

## 📊 ANALYTICS (Opsiyonel)

### 14. `NEXT_PUBLIC_GA_ID`
**Açıklama:** Google Analytics Tracking ID  
**Format:** `G-XXXXXXXXXX`  
**Nasıl Alınır:**
1. Google Analytics → Admin → Property Settings
2. Tracking ID'yi kopyala

### 15. `NEXT_PUBLIC_GSC_VERIFICATION`
**Açıklama:** Google Search Console verification code  
**Nasıl Alınır:**
1. Google Search Console → Property Settings
2. Verification code'u kopyala

---

## 🌍 ENVIRONMENT

### 16. `NODE_ENV`
**Açıklama:** Node.js environment  
**Değer:** `production`  
**Not:** Vercel otomatik ayarlar, manuel ayarlamaya gerek yok

---

## 📝 VERCEL'DE AYARLAMA ADIMLARI

### 1. Vercel Dashboard'a Git
1. https://vercel.com → Login
2. Projeni seç
3. Settings → Environment Variables

### 2. Her Variable'ı Ekle
1. "Add New" butonuna tıkla
2. Key: Variable adı (yukarıdaki listeden)
3. Value: Değer (kendi bilgilerin)
4. Environment: **Production** seç (veya All)
5. "Save" tıkla

### 3. Deploy Et
1. Deployments → Redeploy
2. Yeni environment variables ile deploy olacak

---

## 🔒 GÜVENLİK NOTLARI

### ⚠️ ÖNEMLİ:
1. **Asla** environment variables'ı commit etme (.gitignore'da olmalı)
2. **ADMIN_PASSWORD** ve **SESSION_SECRET** mutlaka güçlü olmalı
3. **SUPABASE_SERVICE_ROLE_KEY** asla client-side'da kullanma
4. Production'da tüm kritik variables'ları ayarla
5. Her variable için doğru environment'ı seç (Production/Preview/Development)

---

## ✅ KONTROL LİSTESİ

Deployment öncesi kontrol et:

- [ ] `ADMIN_PASSWORD` ayarlandı (güçlü şifre)
- [ ] `SESSION_SECRET` ayarlandı (64 karakter hex)
- [ ] `NEXT_PUBLIC_YOUTUBE_API_KEY` ayarlandı
- [ ] `SPOTIFY_CLIENT_ID` ayarlandı
- [ ] `SPOTIFY_CLIENT_SECRET` ayarlandı
- [ ] `CONTACT_EMAIL` ayarlandı
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ayarlandı
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ayarlandı
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ayarlandı
- [ ] Tüm variables Production environment'ında

---

## 🚀 HAZIR!

Tüm environment variables ayarlandıktan sonra:
1. Deployments → Redeploy
2. Test et
3. Production'da çalıştığını doğrula

**Güvenlik Skoru: 10/10** ✅
