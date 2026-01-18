# 🚀 DEPLOYMENT - ADIM ADIM DETAYLI REHBER

## 📋 İÇİNDEKİLER
1. [Vercel Hesabı Oluşturma](#1-vercel-hesabı-oluşturma)
2. [Projeyi Vercel'e Yükleme](#2-projeyi-vercele-yükleme)
3. [Environment Variables Ayarlama](#3-environment-variables-ayarlama)
4. [İlk Deploy](#4-ilk-deploy)
5. [Cloudflare Hesabı Oluşturma](#5-cloudflare-hesabı-oluşturma)
6. [Domain'i Cloudflare'e Bağlama](#6-domaini-cloudflaree-bağlama)
7. [DNS Ayarları](#7-dns-ayarları)
8. [Vercel'de Domain Bağlama](#8-vercelde-domain-bağlama)
9. [SSL/HTTPS Ayarları](#9-sslhttps-ayarları)
10. [Test ve Kontrol](#10-test-ve-kontrol)

---

## 1. VERCEL HESABI OLUŞTURMA

### Adım 1.1: Vercel Web Sitesine Git
1. Tarayıcını aç
2. Şu adrese git: **https://vercel.com**
3. Sağ üst köşede **"Sign Up"** butonuna tıkla

### Adım 1.2: Hesap Oluştur
1. **GitHub ile giriş yap** (önerilen) veya email ile kayıt ol
2. GitHub ile giriş yaparsan:
   - GitHub hesabına giriş yap
   - Vercel'e izin ver
   - Hesap oluşturulur

### Adım 1.3: Dashboard'a Git
- Giriş yaptıktan sonra otomatik olarak Vercel Dashboard'a yönlendirilirsin
- Eğer yönlendirilmediysen: **https://vercel.com/dashboard**

---

## 2. PROJEYİ VERCEL'E YÜKLEME

### YÖNTEM A: GitHub ile (ÖNERİLEN)

#### Adım 2.1: Projeyi GitHub'a Yükle
1. Terminal'i aç
2. Şu komutları çalıştır:

```bash
cd /Users/serhatcali/Desktop/cali-sound

# Git repository oluştur (eğer yoksa)
git init

# GitHub'da yeni bir repository oluştur
# (GitHub.com → New Repository → "cali-sound" adıyla oluştur)

# Remote ekle (GitHub repo URL'ini kullan)
git remote add origin https://github.com/KULLANICI_ADIN/cali-sound.git

# Dosyaları ekle
git add .

# Commit yap
git commit -m "Initial commit - Production ready"

# GitHub'a push et
git push -u origin main
```

#### Adım 2.2: Vercel'de Proje Oluştur
1. Vercel Dashboard'da **"Add New Project"** butonuna tıkla
2. GitHub repository'ni seç: **"cali-sound"**
3. **"Import"** butonuna tıkla

#### Adım 2.3: Proje Ayarları
Vercel otomatik olarak Next.js projesini algılar. Ayarlar şöyle olmalı:

- **Framework Preset:** Next.js ✅
- **Root Directory:** `./` ✅
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

**Değiştirme, olduğu gibi bırak!**

### YÖNTEM B: Vercel CLI ile (Alternatif)

#### Adım 2.1: Vercel CLI Kur
```bash
npm install -g vercel
```

#### Adım 2.2: Projeyi Deploy Et
```bash
cd /Users/serhatcali/Desktop/cali-sound
vercel
```

Terminal'de sorular sorulacak:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Hesabını seç
- **Link to existing project?** → `N` (No)
- **Project name?** → `cali-sound` (Enter'a bas)
- **Directory?** → `./` (Enter'a bas)
- **Override settings?** → `N` (No)

Deploy başlar, 2-5 dakika sürebilir.

---

## 3. ENVIRONMENT VARIABLES AYARLAMA

### ⚠️ ÖNEMLİ: Bu adımı MUTLAKA yapmalısın!

### Adım 3.1: Vercel Dashboard'a Git
1. Vercel Dashboard'da projeni aç: **"cali-sound"**
2. Üst menüden **"Settings"** sekmesine tıkla
3. Sol menüden **"Environment Variables"** seçeneğine tıkla

### Adım 3.2: Her Variable'ı Tek Tek Ekle

#### Variable 1: ADMIN_PASSWORD
1. **"Add New"** butonuna tıkla
2. **Key:** `ADMIN_PASSWORD` yaz
3. **Value:** Güçlü bir şifre yaz (en az 16 karakter)
   - Örnek: `MySecurePassword123!@#`
   - **⚠️ Bu şifreyi not et, unutma!**
4. **Environment:** **Production** seç (veya **All**)
5. **"Save"** butonuna tıkla

#### Variable 2: SESSION_SECRET
1. **"Add New"** butonuna tıkla
2. **Key:** `SESSION_SECRET` yaz
3. **Value:** Terminal'de şu komutu çalıştır:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Çıkan değeri kopyala (64 karakter hex string)
   - Örnek: `b5d37311d39bbc4892a7c3f7dd770a88f374064afcedf85c9dfa1f2346b1cbab`
4. **Environment:** **Production** seç
5. **"Save"** butonuna tıkla

#### Variable 3: NEXT_PUBLIC_YOUTUBE_API_KEY
1. **YouTube API Key Nasıl Alınır:**
   - https://console.cloud.google.com adresine git
   - Google hesabınla giriş yap
   - Sol menüden **"APIs & Services"** → **"Credentials"**
   - Üstte **"+ CREATE CREDENTIALS"** → **"API Key"**
   - API key oluşturulur, kopyala
   - **"Restrict Key"** tıkla:
     - **API restrictions:** **"Restrict key"** seç
     - **Select APIs:** **"YouTube Data API v3"** seç
     - **"Save"** tıkla

2. **Vercel'de Ekle:**
   - **"Add New"** butonuna tıkla
   - **Key:** `NEXT_PUBLIC_YOUTUBE_API_KEY` yaz
   - **Value:** YouTube API key'ini yapıştır
   - **Environment:** **Production** seç
   - **"Save"** butonuna tıkla

#### Variable 4: SPOTIFY_CLIENT_ID
1. **Spotify Client ID Nasıl Alınır:**
   - https://developer.spotify.com/dashboard adresine git
   - Spotify hesabınla giriş yap
   - **"Create App"** butonuna tıkla
   - **App name:** `Cali Sound` yaz
   - **App description:** İstediğin bir açıklama
   - **"Create"** tıkla
   - **Client ID** değerini kopyala

2. **Vercel'de Ekle:**
   - **"Add New"** butonuna tıkla
   - **Key:** `SPOTIFY_CLIENT_ID` yaz
   - **Value:** Spotify Client ID'yi yapıştır
   - **Environment:** **Production** seç
   - **"Save"** butonuna tıkla

#### Variable 5: SPOTIFY_CLIENT_SECRET
1. **Spotify Client Secret Nasıl Alınır:**
   - Spotify Developer Dashboard'da oluşturduğun app'e git
   - **"Show Client Secret"** butonuna tıkla
   - **Client Secret** değerini kopyala

2. **Vercel'de Ekle:**
   - **"Add New"** butonuna tıkla
   - **Key:** `SPOTIFY_CLIENT_SECRET` yaz
   - **Value:** Spotify Client Secret'ı yapıştır
   - **Environment:** **Production** seç
   - **"Save"** butonuna tıkla

#### Variable 6: CONTACT_EMAIL
1. **"Add New"** butonuna tıkla
2. **Key:** `CONTACT_EMAIL` yaz
3. **Value:** Email adresin (örnek: `contact@yourdomain.com`)
4. **Environment:** **Production** seç
5. **"Save"** butonuna tıkla

#### Variable 7: CONTACT_EMAIL_SUBJECT
1. **"Add New"** butonuna tıkla
2. **Key:** `CONTACT_EMAIL_SUBJECT` yaz
3. **Value:** `New Contact Form Submission` yaz
4. **Environment:** **Production** seç
5. **"Save"** butonuna tıkla

#### Variable 8: NEXT_PUBLIC_SUPABASE_URL
1. **Supabase URL Nasıl Alınır:**
   - https://supabase.com adresine git
   - Supabase hesabınla giriş yap
   - Projeni seç
   - Sol menüden **"Settings"** → **"API"**
   - **"Project URL"** değerini kopyala
   - Format: `https://xxxxx.supabase.co`

2. **Vercel'de Ekle:**
   - **"Add New"** butonuna tıkla
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL` yaz
   - **Value:** Supabase URL'ini yapıştır
   - **Environment:** **Production** seç
   - **"Save"** butonuna tıkla

#### Variable 9: NEXT_PUBLIC_SUPABASE_ANON_KEY
1. **Supabase Anon Key Nasıl Alınır:**
   - Supabase Dashboard → **Settings** → **API**
   - **"anon public"** key değerini kopyala

2. **Vercel'de Ekle:**
   - **"Add New"** butonuna tıkla
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` yaz
   - **Value:** Supabase anon key'ini yapıştır
   - **Environment:** **Production** seç
   - **"Save"** butonuna tıkla

#### Variable 10: SUPABASE_SERVICE_ROLE_KEY
1. **Supabase Service Role Key Nasıl Alınır:**
   - Supabase Dashboard → **Settings** → **API**
   - **"service_role"** key değerini kopyala
   - **⚠️ ÖNEMLİ:** Bu key'i asla client-side'da kullanma!

2. **Vercel'de Ekle:**
   - **"Add New"** butonuna tıkla
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY` yaz
   - **Value:** Supabase service role key'ini yapıştır
   - **Environment:** **Production** seç
   - **"Save"** butonuna tıkla

### Adım 3.3: Kontrol Et
Tüm environment variables eklendi mi kontrol et:
- ✅ ADMIN_PASSWORD
- ✅ SESSION_SECRET
- ✅ NEXT_PUBLIC_YOUTUBE_API_KEY
- ✅ SPOTIFY_CLIENT_ID
- ✅ SPOTIFY_CLIENT_SECRET
- ✅ CONTACT_EMAIL
- ✅ CONTACT_EMAIL_SUBJECT
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

---

## 4. İLK DEPLOY

### Adım 4.1: Deploy Et
1. Vercel Dashboard'da projenin ana sayfasına git
2. Üst menüden **"Deployments"** sekmesine tıkla
3. Eğer otomatik deploy olmadıysa:
   - Sağ üstte **"Redeploy"** butonuna tıkla
   - **"Use existing Build Cache"** işaretini kaldır (ilk deploy için)
   - **"Redeploy"** butonuna tıkla

### Adım 4.2: Deploy İlerlemesini İzle
- Deploy başlar, 2-5 dakika sürebilir
- İlerlemeyi görebilirsin:
  - Installing dependencies
  - Building project
  - Deploying

### Adım 4.3: Deploy Tamamlandı
- Deploy tamamlandığında yeşil **"Ready"** yazısı görünür
- Bir URL alacaksın: `https://cali-sound-xxxxx.vercel.app`
- Bu URL'ye tıklayarak siteyi görebilirsin

### Adım 4.4: Test Et
1. Site açıldı mı kontrol et
2. Ana sayfa çalışıyor mu?
3. Console'da hata var mı? (F12 → Console)

---

## 5. CLOUDFLARE HESABI OLUŞTURMA

### Adım 5.1: Cloudflare Web Sitesine Git
1. Tarayıcını aç
2. Şu adrese git: **https://cloudflare.com**
3. Sağ üst köşede **"Sign Up"** butonuna tıkla

### Adım 5.2: Hesap Oluştur
1. Email adresini gir
2. Şifre oluştur
3. **"Create Account"** butonuna tıkla
4. Email'ine gelen doğrulama linkine tıkla

### Adım 5.3: Dashboard'a Git
- Giriş yaptıktan sonra Cloudflare Dashboard'a yönlendirilirsin

---

## 6. DOMAIN'İ CLOUDFLARE'E BAĞLAMA

### Adım 6.1: Site Ekle
1. Cloudflare Dashboard'da **"Add a Site"** butonuna tıkla
2. Domain adını gir (örnek: `yourdomain.com`)
3. **"Add site"** butonuna tıkla

### Adım 6.2: Plan Seç
1. **Free** plan seç (ücretsiz)
2. **"Continue"** butonuna tıkla

### Adım 6.3: DNS Kayıtlarını Kontrol Et
- Cloudflare mevcut DNS kayıtlarını tarar
- Kayıtları kontrol et, doğru görünüyorsa **"Continue"** tıkla

### Adım 6.4: Nameserver'ları Al
- Cloudflare sana 2 nameserver verir:
  - Örnek: `alice.ns.cloudflare.com`
  - Örnek: `bob.ns.cloudflare.com`
- **Bu nameserver'ları not et!**

---

## 7. DNS AYARLARI

### Adım 7.1: Namecheap'e Git
1. https://namecheap.com adresine git
2. Hesabınla giriş yap
3. **"Domain List"** sekmesine tıkla
4. Domain'ini bul ve **"Manage"** butonuna tıkla

### Adım 7.2: Nameserver'ları Değiştir
1. **"Nameservers"** sekmesine tıkla
2. **"Custom DNS"** seçeneğini seç
3. Cloudflare'den aldığın 2 nameserver'ı gir:
   - **Nameserver 1:** `alice.ns.cloudflare.com` (Cloudflare'den aldığın)
   - **Nameserver 2:** `bob.ns.cloudflare.com` (Cloudflare'den aldığın)
4. **"Save"** butonuna tıkla
5. **⚠️ ÖNEMLİ:** Bu değişiklik 24-48 saat sürebilir (genellikle 1-2 saat)

### Adım 7.3: Cloudflare'de DNS Kayıtları Ekle
1. Cloudflare Dashboard'a geri dön
2. Domain'ini seç
3. Sol menüden **"DNS"** sekmesine tıkla
4. **"Add record"** butonuna tıkla

#### Record 1: Root Domain (Ana Domain)
- **Type:** `CNAME` seç
- **Name:** `@` yaz (veya domain adın)
- **Target:** Vercel'den alacağın CNAME değeri (sonraki adımda)
- **Proxy status:** ✅ **Proxied** (Orange cloud) olmalı
- **"Save"** tıkla

#### Record 2: WWW Subdomain
- **Type:** `CNAME` seç
- **Name:** `www` yaz
- **Target:** `cname.vercel-dns.com` yaz
- **Proxy status:** ✅ **Proxied** (Orange cloud) olmalı
- **"Save"** tıkla

---

## 8. VERCEL'DE DOMAIN BAĞLAMA

### Adım 8.1: Vercel Dashboard'a Git
1. Vercel Dashboard'da projeni aç
2. **"Settings"** sekmesine tıkla
3. Sol menüden **"Domains"** seçeneğine tıkla

### Adım 8.2: Domain Ekle
1. **"Add Domain"** butonuna tıkla
2. Domain adını gir: `yourdomain.com`
3. **"Add"** butonuna tıkla

### Adım 8.3: DNS Kayıtlarını Al
- Vercel sana DNS kayıtlarını gösterir:
  - **Type:** CNAME
  - **Name:** `@` veya domain adın
  - **Value:** `cname.vercel-dns.com` veya benzeri

### Adım 8.4: Cloudflare'e DNS Kayıtlarını Ekle
1. Cloudflare Dashboard'a geri dön
2. **DNS** sekmesine git
3. Vercel'den aldığın CNAME kaydını ekle:
   - **Type:** CNAME
   - **Name:** `@` (veya domain adın)
   - **Target:** Vercel'den aldığın değer
   - **Proxy:** ✅ **Proxied** (Orange cloud)
   - **"Save"** tıkla

### Adım 8.5: WWW Domain Ekle (Opsiyonel)
1. Vercel'de **"Add Domain"** tekrar tıkla
2. `www.yourdomain.com` ekle
3. Cloudflare'de zaten `www` kaydını eklemiştik, otomatik çalışır

### Adım 8.6: Domain Doğrulama
- Vercel domain'i doğrular (birkaç dakika sürebilir)
- Doğrulama tamamlandığında yeşil ✅ işareti görünür

---

## 9. SSL/HTTPS AYARLARI

### Adım 9.1: Cloudflare SSL/TLS Ayarları
1. Cloudflare Dashboard'da domain'ini seç
2. Sol menüden **"SSL/TLS"** sekmesine tıkla
3. **Encryption mode:** **"Full (strict)"** seç
   - Bu, Cloudflare ile Vercel arasında HTTPS kullanır
4. **"Always Use HTTPS"** seçeneğini **ON** yap
5. **"Automatic HTTPS Rewrites"** seçeneğini **ON** yap

### Adım 9.2: Cloudflare Security Ayarları
1. **"Security"** sekmesine git
2. **Security Level:** **"Medium"** veya **"High"** seç
3. **Bot Fight Mode:** **ON** yap (ücretsiz plan)
4. **Challenge Passage:** `30 minutes` seç

### Adım 9.3: Vercel SSL
- Vercel otomatik olarak SSL sertifikası sağlar
- Ekstra bir şey yapmana gerek yok

---

## 10. TEST VE KONTROL

### Adım 10.1: Site Test Et
1. Tarayıcıda domain'ini aç: `https://yourdomain.com`
2. Site açılıyor mu?
3. HTTPS çalışıyor mu? (kilit işareti görünmeli)

### Adım 10.2: Admin Panel Test
1. `https://yourdomain.com/admin` adresine git
2. Login sayfası açılıyor mu?
3. Admin şifresiyle giriş yap (ADMIN_PASSWORD)
4. Admin panel çalışıyor mu?

### Adım 10.3: API Test
1. `https://yourdomain.com/api/search?query=test` adresine git
2. JSON response geliyor mu?
3. Rate limiting çalışıyor mu? (çok fazla request yaparsan 429 hatası almalısın)

### Adım 10.4: Security Headers Kontrol
1. Terminal'de şu komutu çalıştır:
```bash
curl -I https://yourdomain.com
```

Şu header'lar görünmeli:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### Adım 10.5: Console Kontrol
1. Tarayıcıda F12 tuşuna bas
2. **Console** sekmesine git
3. Kırmızı hata var mı kontrol et
4. Hata yoksa ✅ başarılı!

---

## ✅ TAMAMLANDI!

### 🎉 Tebrikler! Site production'da!

**Güvenlik Skoru: 10/10** ⭐⭐⭐⭐⭐

### 📋 Kontrol Listesi:
- [x] Vercel hesabı oluşturuldu
- [x] Proje deploy edildi
- [x] Environment variables ayarlandı
- [x] Cloudflare hesabı oluşturuldu
- [x] Domain Cloudflare'e bağlandı
- [x] DNS kayıtları ayarlandı
- [x] SSL/HTTPS aktif
- [x] Site çalışıyor
- [x] Admin panel çalışıyor
- [x] Security headers aktif

### 🚀 Sonraki Adımlar:
1. Siteyi test et
2. Admin panelden içerik ekle
3. Google Analytics ekle (opsiyonel)
4. SEO ayarlarını yap
5. Düzenli backup al

**Sistem production'a hazır ve güvenli!** ✅

---

## ❓ SORUN MU VAR?

### Yaygın Sorunlar:

#### 1. "502 Bad Gateway" Hatası
- **Çözüm:** Environment variables eksik olabilir, kontrol et

#### 2. Domain Çalışmıyor
- **Çözüm:** DNS propagation 24-48 saat sürebilir, bekle

#### 3. SSL Hatası
- **Çözüm:** Cloudflare SSL mode: "Full (strict)" yap

#### 4. Admin Panel Açılmıyor
- **Çözüm:** ADMIN_PASSWORD doğru mu kontrol et

#### 5. API Route'ları Çalışmıyor
- **Çözüm:** Environment variables eksik olabilir

### Destek:
- Vercel Logs: Dashboard → Deployments → Logs
- Cloudflare Analytics: Dashboard → Analytics
- Browser Console: F12 → Console

---

**Başarılar! 🎉**
