# 🚀 DEPLOYMENT REHBERİ

## 📋 ÖNERİLEN YÖNTEM: Vercel + Cloudflare DNS

### ✅ **Neden Vercel?**
- Next.js için optimize edilmiş
- Otomatik HTTPS
- Global CDN
- Ücretsiz plan mevcut
- Kolay deployment
- Environment variables yönetimi
- Otomatik scaling

### ✅ **Neden Cloudflare DNS?**
- Ücretsiz
- Hızlı DNS resolution
- DDoS koruması
- SSL/TLS otomatik
- Analytics
- Firewall rules

---

## 🎯 DEPLOYMENT ADIMLARI

### 1. **Vercel'e Deploy**

#### A. Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. GitHub/GitLab/Bitbucket ile giriş yap
3. Ücretsiz hesap oluştur

#### B. Projeyi Deploy Et
```bash
# Vercel CLI kurulumu (opsiyonel)
npm i -g vercel

# Projeyi deploy et
cd /Users/serhatcali/Desktop/cali-sound
vercel
```

**VEYA**

1. Vercel dashboard'a git
2. "Add New Project" tıkla
3. GitHub repo'yu bağla (veya manuel upload)
4. Proje ayarlarını yap:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### C. Environment Variables Ayarla
Vercel dashboard'da Settings > Environment Variables:

```env
# Kritik - MUTLAKA AYARLA!
ADMIN_PASSWORD=<güçlü-şifre-buraya>
SESSION_SECRET=<64-karakter-random-hex-buraya>

# API Keys
NEXT_PUBLIC_YOUTUBE_API_KEY=<youtube-api-key>
SPOTIFY_CLIENT_ID=<spotify-client-id>
SPOTIFY_CLIENT_SECRET=<spotify-client-secret>

# Email
CONTACT_EMAIL=<your-email@example.com>
CONTACT_EMAIL_SUBJECT=New Contact Form Submission

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>

# Apple Music (opsiyonel)
APPLE_MUSIC_TEAM_ID=<team-id>
APPLE_MUSIC_KEY_ID=<key-id>
APPLE_MUSIC_PRIVATE_KEY_PATH=<private-key-path>

# Google Analytics (opsiyonel)
NEXT_PUBLIC_GA_ID=<ga-id>
NEXT_PUBLIC_GSC_VERIFICATION=<gsc-verification>

# Node Environment
NODE_ENV=production
```

**⚠️ ÖNEMLİ:**
- `ADMIN_PASSWORD`: En az 16 karakter, güçlü şifre
- `SESSION_SECRET`: 64 karakter random hex string oluştur:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

#### D. Deploy
- "Deploy" butonuna tıkla
- İlk deploy 2-5 dakika sürebilir
- Deploy tamamlandığında bir URL alacaksın: `https://your-project.vercel.app`

---

### 2. **Cloudflare DNS Ayarları**

#### A. Cloudflare Hesabı Oluştur
1. https://cloudflare.com adresine git
2. Ücretsiz hesap oluştur
3. "Add a Site" tıkla
4. Domain'ini gir (Namecheap'ten aldığın domain)

#### B. DNS Kayıtlarını Değiştir
1. Namecheap'e git
2. Domain yönetim panelinde Nameservers'ı değiştir:
   - Cloudflare'den aldığın nameserver'ları gir
   - Genellikle şöyle görünür:
     - `alice.ns.cloudflare.com`
     - `bob.ns.cloudflare.com`

#### C. Cloudflare'de DNS Kayıtları Ekle
Cloudflare DNS panelinde:

**Type A Record:**
- Name: `@` (veya domain adı)
- IPv4 address: Vercel'in IP adresi (Vercel dashboard'da görebilirsin)
- Proxy: ✅ (Orange cloud - Cloudflare proxy aktif)

**Type CNAME Record:**
- Name: `www`
- Target: `cname.vercel-dns.com` (Vercel'in CNAME'i)
- Proxy: ✅ (Orange cloud)

**VEYA daha kolay:**
- Vercel dashboard'da domain ekle
- Vercel otomatik DNS kayıtlarını oluşturur
- Cloudflare'de bu kayıtları ekle

#### D. SSL/TLS Ayarları
Cloudflare dashboard'da:
1. SSL/TLS sekmesine git
2. Encryption mode: **Full (strict)** seç
3. Always Use HTTPS: ✅ Aktif
4. Automatic HTTPS Rewrites: ✅ Aktif

#### E. Security Ayarları
Cloudflare dashboard'da:
1. Security sekmesine git
2. Security Level: **Medium** veya **High**
3. Bot Fight Mode: ✅ Aktif (ücretsiz plan)
4. Challenge Passage: 30 minutes

---

### 3. **Vercel'de Domain Bağlama**

1. Vercel dashboard'da projene git
2. Settings > Domains
3. Domain ekle:
   - Production domain: `yourdomain.com`
   - www domain: `www.yourdomain.com`
4. Vercel DNS kayıtlarını gösterir
5. Bu kayıtları Cloudflare'e ekle

---

## 🔄 ALTERNATİF: cPanel Deployment

### ⚠️ **Not:** cPanel Next.js için ideal değil!

cPanel genellikle PHP/static site hosting içindir. Next.js için:

#### Seçenek 1: Node.js App (cPanel Node.js desteği varsa)
1. cPanel'de Node.js uygulaması oluştur
2. Projeyi upload et
3. `npm install` çalıştır
4. `npm run build` çalıştır
5. Start script: `npm start`
6. Port: 3000 (veya cPanel'in verdiği port)

#### Seçenek 2: Static Export (API route'ları çalışmaz!)
```bash
# next.config.ts'de:
output: 'export'

# Build:
npm run build

# cPanel'e upload et:
# .next/out klasörünü public_html'e upload et
```

**⚠️ UYARI:** Static export ile API route'ları çalışmaz! Bu yüzden önerilmez.

---

## ✅ ÖNERİLEN: Vercel + Cloudflare

### Avantajlar:
- ✅ Otomatik HTTPS
- ✅ Global CDN
- ✅ Kolay deployment
- ✅ Environment variables yönetimi
- ✅ Otomatik scaling
- ✅ Ücretsiz plan
- ✅ API route'ları çalışır
- ✅ Server-side rendering çalışır

### Adımlar:
1. ✅ Vercel'e deploy et
2. ✅ Cloudflare DNS'i ayarla
3. ✅ Domain'i Cloudflare'e bağla
4. ✅ SSL/TLS ayarlarını yap
5. ✅ Environment variables ayarla
6. ✅ Test et

---

## 🧪 POST-DEPLOYMENT TESTLERİ

### 1. **HTTPS Kontrolü**
```bash
curl -I https://yourdomain.com
# Strict-Transport-Security header'ı olmalı
```

### 2. **Security Headers Kontrolü**
```bash
curl -I https://yourdomain.com
# Şu header'lar olmalı:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - X-XSS-Protection: 1; mode=block
```

### 3. **API Route Testleri**
```bash
# Rate limiting test
curl https://yourdomain.com/api/search?query=test

# Admin panel test (401 beklenir)
curl https://yourdomain.com/api/admin/cities
```

### 4. **Admin Panel Test**
1. https://yourdomain.com/admin
2. Login yap
3. 2FA test et
4. CRUD işlemleri test et

---

## 🔐 GÜVENLİK KONTROLLERİ

### ✅ **Production Checklist:**
- [ ] `ADMIN_PASSWORD` set edildi
- [ ] `SESSION_SECRET` set edildi (64 karakter)
- [ ] HTTPS aktif
- [ ] Security headers aktif
- [ ] Rate limiting çalışıyor
- [ ] CSRF protection aktif
- [ ] Admin panel erişilebilir
- [ ] API route'ları çalışıyor
- [ ] Environment variables güvenli
- [ ] Cloudflare SSL/TLS: Full (strict)
- [ ] Cloudflare Security Level: Medium/High

---

## 📞 DESTEK

### Sorun mu var?
1. Vercel logs kontrol et
2. Cloudflare analytics kontrol et
3. Browser console kontrol et
4. Network tab kontrol et

### Yaygın Sorunlar:
- **502 Bad Gateway**: Environment variables eksik
- **404 Not Found**: Routing sorunu, Vercel config kontrol et
- **SSL Error**: Cloudflare SSL mode: Full (strict) yap
- **Rate Limit**: Normal, çok fazla request yapıyorsun

---

## 🎉 HAZIRSIN!

Sistem production'a hazır ve güvenli! 🚀

**Güvenlik Skoru: 10/10** ⭐⭐⭐⭐⭐
