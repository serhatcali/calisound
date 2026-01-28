# Cron Jobs Detaylı Kurulum ve Kullanım Rehberi

## 📋 İçindekiler

1. [Cron Jobs Nedir?](#cron-jobs-nedir)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Kurulum Adımları](#kurulum-adımları)
4. [Nasıl Çalışır?](#nasıl-çalışır)
5. [Test Etme](#test-etme)
6. [Sorun Giderme](#sorun-giderme)

---

## 🎯 Cron Jobs Nedir?

Cron jobs, belirli zamanlarda otomatik olarak çalışan görevlerdir. Bu sistemde iki tür cron job var:

1. **Daily Task Emails** - Her gün 10:00'da günlük görevler için email gönderir
2. **Reminder Emails** - Her saat kontrol eder, post zamanından 2 saat önce hatırlatma email'i gönderir

---

## 🏗️ Sistem Mimarisi

### Dosya Yapısı

```
app/
  api/
    cron/
      daily-tasks/
        route.ts      # Günlük task email'leri
      reminders/
        route.ts      # Reminder email'leri
vercel.json           # Vercel cron job konfigürasyonu
```

### Veri Akışı

```
1. Vercel Cron Scheduler
   ↓
2. API Endpoint (/api/cron/daily-tasks veya /api/cron/reminders)
   ↓
3. Authentication Check (CRON_SECRET)
   ↓
4. Database Query (Active releases, tasks, platform plans)
   ↓
5. Email Service (Resend API)
   ↓
6. Email Log (Database'e kaydedilir)
   ↓
7. Response (Success/Error)
```

---

## 🔧 Kurulum Adımları

### Adım 1: Environment Variables

Vercel Dashboard'da şu environment variable'ları ekleyin:

#### Zorunlu Variables:

```bash
# Cron job güvenliği için
CRON_SECRET=rastgele-güvenli-string-buraya

# Email göndermek için
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email adresleri
ADMIN_EMAIL=djcalitr@gmail.com
RESEND_FROM_EMAIL=noreply@calisound.com

# Email linkleri için
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

#### CRON_SECRET Nasıl Oluşturulur?

Terminal'de:
```bash
# Rastgele güvenli string oluştur
openssl rand -base64 32

# Veya Node.js ile
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Örnek:**
```
CRON_SECRET=aB3xK9mP2qR7vT5wY8zA1bC4dE6fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z
```

### Adım 2: Vercel.json Kontrolü

`vercel.json` dosyası proje root'unda olmalı:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-tasks",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule Format Açıklaması:**

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Haftanın günü (0-7, 0 ve 7 = Pazar)
│ │ │ └───── Ay (1-12)
│ │ └─────── Ayın günü (1-31)
│ └───────── Saat (0-23)
└─────────── Dakika (0-59)
```

**Örnekler:**
- `0 7 * * *` = Her gün 07:00 UTC (10:00 Europe/Istanbul)
- `0 * * * *` = Her saat başı (00:00, 01:00, 02:00, ...)
- `*/15 * * * *` = Her 15 dakikada bir
- `0 9-17 * * 1-5` = Hafta içi 09:00-17:00 arası her saat

### Adım 3: Vercel'e Deploy

```bash
# Git'e commit edin
git add vercel.json app/api/cron/
git commit -m "Add cron jobs for email automation"
git push

# Vercel otomatik deploy edecek
# Veya manuel:
vercel --prod
```

### Adım 4: Vercel Dashboard'da Kontrol

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. **Settings** > **Cron Jobs** bölümüne gidin
4. İki cron job görünmeli:
   - `daily-tasks` - Her gün 07:00 UTC
   - `reminders` - Her saat başı

---

## ⚙️ Nasıl Çalışır?

### 1. Daily Task Emails (Günlük Görev Email'leri)

#### Ne Zaman Çalışır?
- **Her gün 07:00 UTC** (10:00 Europe/Istanbul)
- Vercel otomatik olarak `/api/cron/daily-tasks` endpoint'ini çağırır

#### Ne Yapar?

```typescript
1. Authentication kontrolü (CRON_SECRET)
   ↓
2. Tüm 'active' status'ündeki release'leri bulur
   ↓
3. Her release için:
   a. Bugünün promotion day'ini bulur
   b. Bugünün task'larını getirir (completed olmayanlar)
   c. Eğer task varsa:
      - Email oluşturur (HTML formatında)
      - Resend API ile gönderir
      - Email log'u database'e kaydeder
```

#### Email İçeriği:

- **Subject:** `📅 [Song Title] - Daily Tasks (T-X)`
- **Body:**
  - Release bilgileri (şarkı adı, şehir, ülke)
  - Bugünün focus'u (eğer varsa)
  - High Priority task'lar (kırmızı)
  - Medium Priority task'lar (sarı)
  - Low Priority task'lar (yeşil)
  - Release detail sayfasına link

#### Örnek Senaryo:

```
Release: "Istanbul Nights"
Release Date: 1 Şubat 2026
Bugün: 29 Ocak 2026 (T-3)

Promotion Day: T-3
Focus: "Final preparation and asset review"
Tasks:
  - High: "Verify release date and time"
  - Medium: "Review all assets"

→ Email gönderilir: djcalitr@gmail.com
→ Email log kaydedilir: email_logs tablosuna
```

### 2. Reminder Emails (Hatırlatma Email'leri)

#### Ne Zaman Çalışır?
- **Her saat başı** (00:00, 01:00, 02:00, ...)
- Vercel otomatik olarak `/api/cron/reminders` endpoint'ini çağırır

#### Ne Yapar?

```typescript
1. Authentication kontrolü (CRON_SECRET)
   ↓
2. Tüm 'active' status'ündeki release'leri bulur
   ↓
3. Her release için platform plan'larını getirir
   ↓
4. Her platform plan için:
   a. Status kontrolü (reminded/published/skipped ise atla)
   b. planned_at zamanını kontrol et
   c. Şu anki zaman + 2 saat = planned_at mi? (5 dakika tolerans)
   d. Bugün reminder gönderilmiş mi? (email_logs kontrolü)
   e. Eğer gönderilmemişse:
      - Reminder email oluşturur
      - Resend API ile gönderir
      - Email log'u database'e kaydeder
      - Platform plan status'unu 'reminded' yapar
```

#### Email İçeriği:

- **Subject:** `⏰ Reminder: Post [Song Title] on [Platform]`
- **Body:**
  - Post zamanı (tarih, saat, timezone)
  - Copy pack:
    - Title
    - Description
    - Hashtags
    - Tags (YouTube için)
  - Asset linkleri (eğer varsa)
  - Quick upload link (platform'a direkt link)
  - Release detail sayfasına link

#### Örnek Senaryo:

```
Platform Plan:
  Platform: Instagram Reels
  Planned At: 1 Şubat 2026, 14:00 (Europe/Istanbul)
  
Şu Anki Zaman: 1 Şubat 2026, 12:00
2 Saat Sonra: 1 Şubat 2026, 14:00 ✅

→ Reminder email gönderilir
→ Platform plan status: 'reminded' olur
→ Email log kaydedilir
```

---

## 🧪 Test Etme

### Yerel Test (Development)

#### 1. Manuel API Çağrısı

Terminal'de:

```bash
# Daily tasks test
curl -X GET "http://localhost:3000/api/cron/daily-tasks" \
  -H "Authorization: Bearer your-cron-secret-here"

# Reminders test
curl -X GET "http://localhost:3000/api/cron/reminders" \
  -H "Authorization: Bearer your-cron-secret-here"
```

#### 2. Postman/Insomnia ile Test

**Request:**
```
Method: GET
URL: http://localhost:3000/api/cron/daily-tasks
Headers:
  Authorization: Bearer your-cron-secret-here
```

**Response (Başarılı):**
```json
{
  "success": true,
  "message": "Daily task emails processed",
  "emailsSent": 2,
  "errors": 0,
  "timestamp": "2026-01-29T10:00:00.000Z"
}
```

#### 3. Browser'da Test (Sadece Development)

`.env.local` dosyasına:
```
CRON_SECRET=test-secret
```

Sonra browser'da:
```
http://localhost:3000/api/cron/daily-tasks?secret=test-secret
```

**Not:** Production'da bu yöntemi kullanmayın!

### Production Test

#### 1. Vercel Dashboard'dan

1. Vercel Dashboard > Projeniz > **Functions**
2. **Cron Jobs** sekmesine gidin
3. İlgili cron job'ı seçin
4. **"Trigger Now"** butonuna tıklayın
5. Logs'u kontrol edin

#### 2. Manuel API Çağrısı

```bash
# Production URL'inizi kullanın
curl -X GET "https://your-domain.com/api/cron/daily-tasks" \
  -H "Authorization: Bearer your-cron-secret-here"
```

### Test Senaryoları

#### Senaryo 1: Daily Task Email Test

1. Bir release oluşturun (status: 'active')
2. Timeline generate edin
3. Bugünün task'larını kontrol edin
4. Cron job'ı manuel tetikleyin
5. Email'in geldiğini kontrol edin
6. Email logs'da göründüğünü kontrol edin

#### Senaryo 2: Reminder Email Test

1. Bir release oluşturun (status: 'active')
2. Platform plans generate edin
3. Bir platform plan'ın `planned_at` değerini 2 saat sonrasına ayarlayın
4. Cron job'ı manuel tetikleyin
5. Email'in geldiğini kontrol edin
6. Platform plan status'unun 'reminded' olduğunu kontrol edin

---

## 🔍 Sorun Giderme

### Problem 1: Cron Jobs Çalışmıyor

**Kontrol Listesi:**
- [ ] `vercel.json` dosyası commit edildi mi?
- [ ] Vercel Dashboard'da cron jobs görünüyor mu?
- [ ] `CRON_SECRET` environment variable set edildi mi?
- [ ] Vercel'de deploy başarılı mı?

**Çözüm:**
```bash
# Vercel.json'u kontrol et
cat vercel.json

# Git'e commit et
git add vercel.json
git commit -m "Fix cron jobs"
git push

# Vercel'e yeniden deploy et
vercel --prod
```

### Problem 2: Email'ler Gönderilmiyor

**Kontrol Listesi:**
- [ ] `RESEND_API_KEY` doğru mu?
- [ ] `ADMIN_EMAIL` doğru mu?
- [ ] `RESEND_FROM_EMAIL` verified mi? (Resend Dashboard'da)
- [ ] Release status'ü 'active' mi?
- [ ] Timeline ve platform plans generate edildi mi?

**Çözüm:**
```bash
# Resend API key'i test et
curl -X GET "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_your_api_key"

# Vercel function logs'u kontrol et
# Vercel Dashboard > Functions > Logs
```

### Problem 3: Timezone Sorunları

**Problem:** Email'ler yanlış saatte gönderiliyor.

**Çözüm:**

Vercel cron jobs UTC kullanır. Europe/Istanbul (UTC+3) için:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-tasks",
      "schedule": "0 7 * * *"  // 07:00 UTC = 10:00 IST
    }
  ]
}
```

**Timezone Tablosu:**

| İstediğiniz Saat (IST) | UTC Schedule |
|------------------------|--------------|
| 10:00                  | `0 7 * * *`  |
| 09:00                  | `0 6 * * *`  |
| 11:00                  | `0 8 * * *`  |

### Problem 4: Duplicate Email'ler

**Problem:** Aynı email birden fazla kez gönderiliyor.

**Çözüm:**

Email logs'da unique constraint var. Kod zaten kontrol ediyor:
- Daily tasks: Her release için günde bir kez
- Reminders: Her platform plan için günde bir kez

Eğer hala duplicate varsa:
```sql
-- Database'de kontrol et
SELECT * FROM email_logs 
WHERE release_id = 'your-release-id' 
ORDER BY sent_at DESC;
```

### Problem 5: Authentication Hatası

**Hata:** `401 Unauthorized`

**Çözüm:**
```bash
# CRON_SECRET'i kontrol et
# Vercel Dashboard > Settings > Environment Variables

# Test et
curl -X GET "https://your-domain.com/api/cron/daily-tasks" \
  -H "Authorization: Bearer YOUR_ACTUAL_SECRET"
```

---

## 📊 Monitoring ve Logging

### Vercel Dashboard

1. **Functions** > **Cron Jobs**
   - Execution history
   - Success/failure rates
   - Execution time

2. **Functions** > **Logs**
   - Real-time logs
   - Error messages
   - Debug information

### Database Logs

```sql
-- Email logs'u görüntüle
SELECT 
  el.*,
  r.song_title,
  pp.platform
FROM email_logs el
LEFT JOIN releases r ON el.release_id = r.id
LEFT JOIN platform_plans pp ON el.platform_plan_id = pp.id
ORDER BY el.sent_at DESC
LIMIT 50;

-- Bugün gönderilen email'ler
SELECT COUNT(*) 
FROM email_logs 
WHERE sent_date = CURRENT_DATE;

-- Hata oranı
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE sent_at IS NOT NULL) as successful
FROM email_logs
GROUP BY type;
```

---

## 🎯 Best Practices

1. **CRON_SECRET Güvenliği:**
   - Her environment için farklı secret kullanın
   - Secret'ı asla commit etmeyin
   - Düzenli olarak rotate edin

2. **Error Handling:**
   - Tüm hatalar log'lanıyor
   - Email gönderilemese bile sistem çalışmaya devam ediyor
   - Her release için ayrı try-catch

3. **Performance:**
   - Batch processing (tüm release'ler tek seferde)
   - Database query optimization
   - Email gönderme async

4. **Monitoring:**
   - Vercel Dashboard'u düzenli kontrol edin
   - Email logs'u takip edin
   - Failed execution'ları inceleyin

---

## 📝 Özet

1. ✅ Environment variables ekleyin (CRON_SECRET, RESEND_API_KEY, vb.)
2. ✅ `vercel.json` commit edin ve deploy edin
3. ✅ Vercel Dashboard'da cron jobs'ları kontrol edin
4. ✅ Test edin (manuel trigger)
5. ✅ Email'lerin geldiğini doğrulayın
6. ✅ Email logs'u kontrol edin

**Sorularınız varsa veya bir sorunla karşılaşırsanız, lütfen paylaşın!**
