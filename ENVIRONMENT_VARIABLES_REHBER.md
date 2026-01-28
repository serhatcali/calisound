# Environment Variables Detaylı Rehber

## 📋 İçindekiler

1. [Zorunlu Variables](#zorunlu-variables)
2. [Email Variables](#email-variables)
3. [Database Variables](#database-variables)
4. [Cron Jobs Variables](#cron-jobs-variables)
5. [OAuth Variables (Opsiyonel)](#oauth-variables-opsiyonel)
6. [Diğer Variables](#diğer-variables)
7. [Nasıl Eklenir?](#nasıl-eklenir)
8. [Güvenlik Notları](#güvenlik-notları)

---

## 🔴 Zorunlu Variables

### 1. ADMIN_PASSWORD

**Açıklama:** Admin paneli için şifre

**Nasıl Oluşturulur:**
```bash
# Terminal'de güçlü bir şifre oluşturun
openssl rand -base64 16

# Veya kendi şifrenizi belirleyin (en az 8 karakter, büyük/küçük harf, sayı, özel karakter)
```

**Örnek Değer:**
```
cachi5O9#0+7heD0!vlm
```

**Nerede Kullanılır:**
- Admin paneli girişi
- `/admin/login` sayfası

**Vercel'de Eklenir:**
- Name: `ADMIN_PASSWORD`
- Value: Oluşturduğunuz şifre
- Environment: **All Environments**

---

### 2. SESSION_SECRET

**Açıklama:** Session şifreleme için kullanılan secret key

**Nasıl Oluşturulur:**
```bash
# Terminal'de 32 byte random string oluşturun
openssl rand -hex 32

# Veya Node.js ile
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Örnek Değer:**
```
19eb89a336402b5a4097ef135b566c2322c2b5fd355c88b9410a1cd4d1153022
```

**Nerede Kullanılır:**
- Session cookie şifreleme
- Admin authentication

**Vercel'de Eklenir:**
- Name: `SESSION_SECRET`
- Value: Oluşturduğunuz hex string
- Environment: **All Environments**

---

## 📧 Email Variables

### 3. RESEND_API_KEY

**Açıklama:** Resend email servisi API key'i

**Nasıl Alınır:**

1. **Resend hesabı oluşturun:**
   - https://resend.com adresine gidin
   - "Sign Up" butonuna tıklayın
   - Email ve şifre ile kayıt olun

2. **API Key oluşturun:**
   - Resend Dashboard'a giriş yapın: https://resend.com/dashboard
   - Sol menüden **"API Keys"** seçeneğine tıklayın
   - **"Create API Key"** butonuna tıklayın
   - Name: `Cali Sound Production` (veya istediğiniz isim)
   - Permission: `Sending access` seçin
   - **"Add"** butonuna tıklayın
   - **ÖNEMLİ:** API key'i kopyalayın (sadece bir kez gösterilir!)
   - Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Örnek Değer:**
```
re_AbCdEfGhIjKlMnOpQrStUvWxYz123456789
```

**Nerede Kullanılır:**
- Daily task email'leri göndermek
- Reminder email'leri göndermek
- `lib/email-service.ts` dosyasında

**Vercel'de Eklenir:**
- Name: `RESEND_API_KEY`
- Value: Resend'den aldığınız API key
- Environment: **All Environments**

**Not:** Resend ücretsiz plan'da ayda 3,000 email gönderebilirsiniz.

---

### 4. RESEND_FROM_EMAIL

**Açıklama:** Email'lerin gönderileceği adres

**Nasıl Ayarlanır:**

1. **Domain Verify Etme (Önerilen):**
   - Resend Dashboard > **"Domains"** > **"Add Domain"**
   - Domain'inizi ekleyin (örn: `calisound.com`)
   - DNS kayıtlarını ekleyin (Resend size verecek)
   - Verify edin
   - Email: `noreply@calisound.com` kullanabilirsiniz

2. **Veya Resend'in Test Domain'ini Kullanın:**
   - Resend ücretsiz plan'da test domain kullanabilirsiniz
   - Format: `onboarding@resend.dev` (sadece test için)

**Örnek Değer:**
```
noreply@calisound.com
# veya test için
onboarding@resend.dev
```

**Nerede Kullanılır:**
- Email gönderirken "From" adresi
- `lib/email-service.ts` dosyasında

**Vercel'de Eklenir:**
- Name: `RESEND_FROM_EMAIL`
- Value: Verified email adresiniz
- Environment: **All Environments**

---

### 5. ADMIN_EMAIL

**Açıklama:** Email'lerin gönderileceği alıcı adres

**Nasıl Ayarlanır:**
- Kendi email adresinizi kullanın
- Gmail, Outlook, veya herhangi bir email servisi olabilir

**Örnek Değer:**
```
djcalitr@gmail.com
```

**Nerede Kullanılır:**
- Daily task email'leri bu adrese gönderilir
- Reminder email'leri bu adrese gönderilir
- `lib/email-service.ts` dosyasında

**Vercel'de Eklenir:**
- Name: `ADMIN_EMAIL`
- Value: Email adresiniz
- Environment: **All Environments**

---

### 6. CONTACT_EMAIL

**Açıklama:** Contact form'dan gelen mesajların gönderileceği adres

**Nasıl Ayarlanır:**
- Genellikle `ADMIN_EMAIL` ile aynı olabilir
- Veya ayrı bir support email'i kullanabilirsiniz

**Örnek Değer:**
```
djcalitr@gmail.com
```

**Vercel'de Eklenir:**
- Name: `CONTACT_EMAIL`
- Value: Email adresiniz
- Environment: **All Environments**

---

### 7. CONTACT_EMAIL_SUBJECT

**Açıklama:** Contact form email'lerinin subject'i

**Örnek Değer:**
```
New Contact Form Submission
```

**Vercel'de Eklenir:**
- Name: `CONTACT_EMAIL_SUBJECT`
- Value: İstediğiniz subject
- Environment: **All Environments**

---

## 🗄️ Database Variables

### 8. NEXT_PUBLIC_SUPABASE_URL

**Açıklama:** Supabase project URL'i

**Nasıl Alınır:**

1. **Supabase hesabı oluşturun:**
   - https://supabase.com adresine gidin
   - "Start your project" butonuna tıklayın
   - GitHub ile giriş yapın

2. **Yeni project oluşturun:**
   - "New Project" butonuna tıklayın
   - Project name: `cali-sound` (veya istediğiniz isim)
   - Database password: Güçlü bir şifre oluşturun
   - Region: En yakın region'ı seçin
   - "Create new project" butonuna tıklayın

3. **URL'i bulun:**
   - Project oluşturulduktan sonra
   - Sol menüden **"Settings"** > **"API"** seçeneğine gidin
   - **"Project URL"** bölümünden URL'i kopyalayın
   - Format: `https://xxxxxxxxxxxxx.supabase.co`

**Örnek Değer:**
```
https://uwwqidqtoxwrsgxgapnb.supabase.co
```

**Nerede Kullanılır:**
- Supabase client bağlantısı
- Tüm database işlemleri

**Vercel'de Eklenir:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: Supabase project URL'iniz
- Environment: **All Environments**

**Not:** `NEXT_PUBLIC_` prefix'i önemli - client-side'da kullanılabilir.

---

### 9. NEXT_PUBLIC_SUPABASE_ANON_KEY

**Açıklama:** Supabase anonymous (public) key

**Nasıl Alınır:**

1. Supabase Dashboard'a gidin
2. **"Settings"** > **"API"** seçeneğine gidin
3. **"Project API keys"** bölümünde
4. **"anon"** veya **"public"** key'i kopyalayın
5. Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Örnek Değer:**
```
sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7
```

**Nerede Kullanılır:**
- Client-side Supabase işlemleri
- Public API erişimi

**Vercel'de Eklenir:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Supabase anon key'iniz
- Environment: **All Environments**

---

### 10. SUPABASE_SERVICE_ROLE_KEY

**Açıklama:** Supabase service role key (admin yetkileri)

**Nasıl Alınır:**

1. Supabase Dashboard'a gidin
2. **"Settings"** > **"API"** seçeneğine gidin
3. **"Project API keys"** bölümünde
4. **"service_role"** veya **"secret"** key'i kopyalayın
5. **ÖNEMLİ:** Bu key çok güçlü - asla client-side'da kullanmayın!

**Örnek Değer:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3d3FpZHF0b3h3cnNneGdhcG5iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ3OTA2OSwiZXhwIjoyMDg0MDU1MDY5fQ.YMU7Z5qxMYiAyvQrSXrfemiklHnLcGnHEQKmwzzLEvM
```

**Nerede Kullanılır:**
- Server-side Supabase işlemleri
- Admin işlemleri
- RLS (Row Level Security) bypass

**Vercel'de Eklenir:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Supabase service role key'iniz
- Environment: **All Environments**

**Güvenlik Uyarısı:** Bu key'i asla public repository'ye commit etmeyin!

---

## ⏰ Cron Jobs Variables

### 11. CRON_SECRET

**Açıklama:** Cron job endpoint'lerini korumak için secret key

**Nasıl Oluşturulur:**

**Yöntem 1: OpenSSL (Terminal)**
```bash
openssl rand -base64 32
```

**Yöntem 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Yöntem 3: Online Generator**
- https://randomkeygen.com/ adresine gidin
- "CodeIgniter Encryption Keys" seçin
- Bir key kopyalayın

**Örnek Değer:**
```
aB3xK9mP2qR7vT5wY8zA1bC4dE6fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z
```

**Nerede Kullanılır:**
- `/api/cron/daily-tasks` endpoint'i
- `/api/cron/reminders` endpoint'i
- Authentication header'da: `Authorization: Bearer {CRON_SECRET}`

**Vercel'de Eklenir:**
- Name: `CRON_SECRET`
- Value: Oluşturduğunuz secret
- Environment: **All Environments**

**Güvenlik:** Bu secret'ı kimseyle paylaşmayın!

---

## 🌐 URL Variables

### 12. NEXT_PUBLIC_BASE_URL

**Açıklama:** Production domain URL'i (email linkleri için)

**Nasıl Bulunur:**

**Vercel'de:**
1. Vercel Dashboard > Projeniz
2. **"Settings"** > **"Domains"** bölümüne gidin
3. Production domain'inizi kopyalayın
4. Format: `https://your-project.vercel.app` veya `https://yourdomain.com`

**Örnek Değer:**
```
https://calisound.vercel.app
# veya
https://calisound.com
```

**Nerede Kullanılır:**
- Email'lerdeki linkler
- Release detail sayfası linkleri
- Platform upload linkleri

**Vercel'de Eklenir:**
- Name: `NEXT_PUBLIC_BASE_URL`
- Value: Production domain URL'iniz
- Environment: **All Environments**

---

## 🎵 YouTube Variables

### 13. NEXT_PUBLIC_YOUTUBE_API_KEY

**Açıklama:** YouTube Data API key (video istatistikleri için)

**Nasıl Alınır:**

1. **Google Cloud Console'a gidin:**
   - https://console.cloud.google.com/ adresine gidin
   - Google hesabınızla giriş yapın

2. **Yeni project oluşturun:**
   - Üst menüden project seçiciye tıklayın
   - "New Project" butonuna tıklayın
   - Project name: `cali-sound` (veya istediğiniz isim)
   - "Create" butonuna tıklayın

3. **YouTube Data API v3'ü etkinleştirin:**
   - Sol menüden **"APIs & Services"** > **"Library"** seçin
   - "YouTube Data API v3" arayın
   - "Enable" butonuna tıklayın

4. **API Key oluşturun:**
   - **"APIs & Services"** > **"Credentials"** seçin
   - **"Create Credentials"** > **"API Key"** seçin
   - API key oluşturulacak
   - **"Restrict Key"** butonuna tıklayın (güvenlik için)
   - Application restrictions: **"HTTP referrers"** seçin
   - Website restrictions: Domain'inizi ekleyin
   - API restrictions: **"Restrict key"** > **"YouTube Data API v3"** seçin
   - "Save" butonuna tıklayın

**Örnek Değer:**
```
AIzaSyAtnSv1KEiqcXF7cBqiRpSLqoboa5Dk1aU
```

**Nerede Kullanılır:**
- YouTube video istatistikleri
- View count'ları

**Vercel'de Eklenir:**
- Name: `NEXT_PUBLIC_YOUTUBE_API_KEY`
- Value: YouTube API key'iniz
- Environment: **All Environments**

**Not:** YouTube API ücretsiz plan'da günde 10,000 request limit'i var.

---

## 🔐 OAuth Variables (Opsiyonel - Şu an kullanılmıyor)

### 14. YOUTUBE_CLIENT_ID
### 15. YOUTUBE_CLIENT_SECRET
### 16. INSTAGRAM_APP_ID
### 17. INSTAGRAM_APP_SECRET
### 18. FACEBOOK_APP_ID
### 19. FACEBOOK_APP_SECRET
### 20. TWITTER_CLIENT_ID
### 21. TWITTER_CLIENT_SECRET
### 22. TIKTOK_CLIENT_KEY
### 23. TIKTOK_CLIENT_SECRET
### 24. OAUTH_ENCRYPTION_KEY

**Not:** Bu variable'lar şu an release planning sisteminde kullanılmıyor. Gelecekte OAuth entegrasyonu için gerekebilir.

---

## 📝 Nasıl Eklenir?

### Vercel Dashboard'dan:

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin

2. **Settings'e gidin:**
   - Sol menüden **"Settings"** seçin
   - **"Environment Variables"** sekmesine tıklayın

3. **Variable ekleyin:**
   - **"Add Environment Variable"** butonuna tıklayın
   - **Name:** Variable adını girin (örn: `CRON_SECRET`)
   - **Value:** Variable değerini girin
   - **Environment:** **"All Environments"** seçin (veya sadece Production)
   - **"Save"** butonuna tıklayın

4. **Deploy tetikleyin:**
   - Variable ekledikten sonra yeni bir deployment gerekebilir
   - Veya bir sonraki git push'da otomatik deploy olur

### Terminal'den (Vercel CLI):

```bash
# Variable ekle
vercel env add CRON_SECRET

# Tüm environment'lar için
vercel env add CRON_SECRET production preview development
```

---

## 🔒 Güvenlik Notları

### ✅ Yapılması Gerekenler:

1. **Secret'ları asla commit etmeyin:**
   - `.env.local` dosyasını `.gitignore`'a ekleyin
   - Secret'ları sadece Vercel Dashboard'da saklayın

2. **Güçlü şifreler kullanın:**
   - En az 16 karakter
   - Büyük/küçük harf, sayı, özel karakter karışımı

3. **API key'leri restrict edin:**
   - YouTube API key'i domain'inize restrict edin
   - Resend API key'i sadece gerekli permission'larla oluşturun

4. **Service role key'i gizli tutun:**
   - `SUPABASE_SERVICE_ROLE_KEY` asla client-side'da kullanmayın
   - Sadece server-side'da kullanın

5. **Düzenli olarak rotate edin:**
   - Secret'ları düzenli olarak değiştirin (3-6 ayda bir)
   - Eski key'leri disable edin

### ❌ Yapılmaması Gerekenler:

1. **Public repository'ye secret commit etmeyin**
2. **Secret'ları screenshot'larda göstermeyin**
3. **Secret'ları email'de paylaşmayın**
4. **Production key'lerini development'ta kullanmayın**

---

## 📊 Özet Tablo

| Variable | Zorunlu | Nasıl Alınır | Örnek |
|----------|---------|--------------|-------|
| `ADMIN_PASSWORD` | ✅ | Terminal'de oluştur | `cachi5O9#0+7heD0!vlm` |
| `SESSION_SECRET` | ✅ | `openssl rand -hex 32` | `19eb89a3...` |
| `RESEND_API_KEY` | ✅ | Resend Dashboard | `re_AbCdEf...` |
| `RESEND_FROM_EMAIL` | ✅ | Resend'de verify et | `noreply@calisound.com` |
| `ADMIN_EMAIL` | ✅ | Kendi email'iniz | `djcalitr@gmail.com` |
| `CONTACT_EMAIL` | ✅ | Kendi email'iniz | `djcalitr@gmail.com` |
| `CONTACT_EMAIL_SUBJECT` | ✅ | İstediğiniz text | `New Contact Form` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard | `eyJhbGciOiJ...` |
| `CRON_SECRET` | ✅ | `openssl rand -base64 32` | `aB3xK9mP...` |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Vercel domain | `https://xxx.vercel.app` |
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | ⚠️ | Google Cloud Console | `AIzaSy...` |

---

## 🎯 Hızlı Kurulum Checklist

- [ ] `ADMIN_PASSWORD` oluşturuldu ve eklendi
- [ ] `SESSION_SECRET` oluşturuldu ve eklendi
- [ ] Resend hesabı oluşturuldu
- [ ] `RESEND_API_KEY` alındı ve eklendi
- [ ] `RESEND_FROM_EMAIL` verify edildi ve eklendi
- [ ] `ADMIN_EMAIL` eklendi
- [ ] `CONTACT_EMAIL` eklendi
- [ ] `CONTACT_EMAIL_SUBJECT` eklendi
- [ ] Supabase project oluşturuldu
- [ ] `NEXT_PUBLIC_SUPABASE_URL` eklendi
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklendi
- [ ] `SUPABASE_SERVICE_ROLE_KEY` eklendi
- [ ] `CRON_SECRET` oluşturuldu ve eklendi
- [ ] `NEXT_PUBLIC_BASE_URL` eklendi
- [ ] `NEXT_PUBLIC_YOUTUBE_API_KEY` (opsiyonel) eklendi
- [ ] Tüm variable'lar "All Environments" için ayarlandı
- [ ] Yeni deployment tetiklendi

---

**Sorularınız varsa veya bir adımda takıldıysanız, lütfen paylaşın!**
