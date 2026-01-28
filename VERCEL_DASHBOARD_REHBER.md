# Vercel Dashboard - Environment Variables Ekleme Rehberi

## 📍 Adım Adım Görsel Rehber

### 1️⃣ Vercel Dashboard'a Giriş

1. **Tarayıcınızda Vercel'e gidin:**
   ```
   https://vercel.com/dashboard
   ```

2. **Giriş yapın:**
   - GitHub, GitLab veya email ile giriş yapın

3. **Projenizi seçin:**
   - Ana sayfada projeleriniz listelenir
   - **"calisound"** projesine tıklayın

---

### 2️⃣ Settings Sayfasına Gidin

1. **Proje sayfasında:**
   - Üst menüden **"Settings"** sekmesine tıklayın
   - Veya sol menüden **"Settings"** seçeneğine tıklayın

2. **Environment Variables sekmesi:**
   - Settings sayfasında sol menüden **"Environment Variables"** sekmesine tıklayın
   - Veya direkt URL: `https://vercel.com/[proje-adi]/settings/environment-variables`

---

### 3️⃣ Environment Variable Ekleme

#### A) "Add Environment Variable" Butonuna Tıklayın

- Sayfanın sağ üst köşesinde **"Add Environment Variable"** butonu var
- Bu butona tıklayın

#### B) Form Doldurma

Açılan form'da 3 alan var:

**1. Name (Variable Adı):**
```
Örnek: CRON_SECRET
```

**2. Value (Variable Değeri):**
```
Örnek: aB3xK9mP2qR7vT5wY8zA1bC4dE6fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z
```

**3. Environment (Hangi ortamlar için):**
- ☑️ **Production** - Production deployment'lar için
- ☑️ **Preview** - Preview deployment'lar için (PR'lar, branch'ler)
- ☑️ **Development** - Local development için

**Öneri:** Tüm variable'lar için **"All Environments"** seçin (3 checkbox'ı da işaretleyin)

#### C) Save Butonuna Tıklayın

- Form'u doldurduktan sonra **"Save"** butonuna tıklayın
- Variable listede görünecek

---

## 📝 Her Variable İçin Detaylı Adımlar

### Variable 1: CRON_SECRET

**1. Terminal'de secret oluşturun:**
```bash
openssl rand -base64 32
```

**2. Vercel Dashboard'da:**
- **Name:** `CRON_SECRET`
- **Value:** Terminal'den kopyaladığınız değer
- **Environment:** ☑️ Production ☑️ Preview ☑️ Development
- **Save**

**Örnek Value:**
```
aB3xK9mP2qR7vT5wY8zA1bC4dE6fG9hI0jK2lM3nO4pQ5rS6tU7vW8xY9z
```

---

### Variable 2: RESEND_API_KEY

**1. Resend Dashboard'a gidin:**
```
https://resend.com/dashboard
```

**2. API Keys sayfasına gidin:**
- Sol menüden **"API Keys"** seçin
- **"Create API Key"** butonuna tıklayın

**3. API Key oluşturun:**
- **Name:** `Cali Sound Production`
- **Permission:** `Sending access` seçin
- **"Add"** butonuna tıklayın
- **ÖNEMLİ:** API key'i hemen kopyalayın (sadece bir kez gösterilir!)
- Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**4. Vercel Dashboard'da:**
- **Name:** `RESEND_API_KEY`
- **Value:** Resend'den kopyaladığınız API key
- **Environment:** ☑️ Production ☑️ Preview ☑️ Development
- **Save**

---

### Variable 3: RESEND_FROM_EMAIL

**1. Resend Dashboard'da domain verify edin:**
- Sol menüden **"Domains"** seçin
- **"Add Domain"** butonuna tıklayın
- Domain'inizi girin (örn: `calisound.com`)
- DNS kayıtlarını ekleyin (Resend size verecek)
- Verify edin

**2. Vercel Dashboard'da:**
- **Name:** `RESEND_FROM_EMAIL`
- **Value:** `noreply@calisound.com` (veya verified domain'iniz)
- **Environment:** ☑️ Production ☑️ Preview ☑️ Development
- **Save**

**Not:** Eğer domain verify etmediyseniz, test için `onboarding@resend.dev` kullanabilirsiniz.

---

### Variable 4: ADMIN_EMAIL

**1. Vercel Dashboard'da:**
- **Name:** `ADMIN_EMAIL`
- **Value:** `djcalitr@gmail.com` (veya kendi email'iniz)
- **Environment:** ☑️ Production ☑️ Preview ☑️ Development
- **Save**

---

### Variable 5: NEXT_PUBLIC_BASE_URL

**1. Vercel Dashboard'da domain bulun:**
- Proje sayfasında **"Settings"** > **"Domains"** sekmesine gidin
- Production domain'inizi kopyalayın
- Format: `https://calisound.vercel.app` veya `https://calisound.com`

**2. Environment Variable ekleyin:**
- **Name:** `NEXT_PUBLIC_BASE_URL`
- **Value:** Domain URL'iniz (örn: `https://calisound.vercel.app`)
- **Environment:** ☑️ Production ☑️ Preview ☑️ Development
- **Save**

---

## 🔍 Mevcut Variable'ları Kontrol Etme

### Variable Listesi

Vercel Dashboard'da şu variable'lar görünmeli:

**Mevcut (Zaten var):**
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SESSION_SECRET`
- ✅ `ADMIN_PASSWORD`
- ✅ `NEXT_PUBLIC_YOUTUBE_API_KEY`
- ✅ `CONTACT_EMAIL`
- ✅ `CONTACT_EMAIL_SUBJECT`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Eksik (Eklenmesi gereken):**
- ❌ `CRON_SECRET` ← **EKLE**
- ❌ `RESEND_API_KEY` ← **EKLE**
- ❌ `RESEND_FROM_EMAIL` ← **EKLE**
- ❌ `ADMIN_EMAIL` ← **EKLE**
- ❌ `NEXT_PUBLIC_BASE_URL` ← **EKLE**

---

## ✏️ Variable Düzenleme

### Mevcut Variable'ı Düzenleme

1. Variable listesinde sağ tarafta **"..."** (3 nokta) butonuna tıklayın
2. **"Edit"** seçeneğine tıklayın
3. Value'yu güncelleyin
4. **"Save"** butonuna tıklayın

### Variable Silme

1. Variable listesinde sağ tarafta **"..."** (3 nokta) butonuna tıklayın
2. **"Delete"** seçeneğine tıklayın
3. Onaylayın

---

## 👁️ Variable Değerini Görme

1. Variable listesinde **göz ikonu** 👁️'ye tıklayın
2. Value görünecek (maskelenmiş olarak: `...........`)
3. Tekrar tıklayınca gizlenir

**Not:** Bazı variable'lar güvenlik nedeniyle tam olarak gösterilmez.

---

## 🔄 Deploy Tetikleme

### Variable Eklendikten Sonra

1. **Otomatik Deploy:**
   - Variable ekledikten sonra Vercel otomatik olarak yeni bir deployment başlatır
   - Veya bir sonraki git push'da deploy olur

2. **Manuel Deploy:**
   - **"Deployments"** sekmesine gidin
   - **"Redeploy"** butonuna tıklayın
   - Veya terminal'de: `vercel --prod`

---

## ✅ Kontrol Listesi

Her variable'ı ekledikten sonra kontrol edin:

- [ ] Variable listede görünüyor mu?
- [ ] Environment'lar doğru mu? (All Environments seçili mi?)
- [ ] Value doğru mu? (Göz ikonuyla kontrol edin)
- [ ] Deploy tetiklendi mi?

---

## 🎯 Hızlı Ekleme Sırası

**Öncelik sırasına göre ekleyin:**

1. **CRON_SECRET** (Terminal'de oluştur)
2. **RESEND_API_KEY** (Resend Dashboard'dan al)
3. **RESEND_FROM_EMAIL** (Resend'de verify et)
4. **ADMIN_EMAIL** (Kendi email'iniz)
5. **NEXT_PUBLIC_BASE_URL** (Vercel domain'iniz)

---

## 🆘 Sorun Giderme

### Variable görünmüyor

- Sayfayı yenileyin (F5)
- Farklı environment'da mı kontrol ediyorsunuz? (Production/Preview/Development)

### Value yanlış

- Variable'ı düzenleyin (3 nokta > Edit)
- Doğru value'yu girin
- Save edin

### Deploy çalışmıyor

- Variable'ların doğru environment'da olduğundan emin olun
- Yeni bir deployment tetikleyin
- Vercel logs'u kontrol edin

---

## 📸 Görsel Referans

Vercel Dashboard'da şöyle görünmeli:

```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                   │
│ Store API keys, tokens, and config securely.           │
│                                                         │
│ [Project] [Shared]                                      │
│                                                         │
│ Search...  [All Environments ▼]  [Last Updated ▼]     │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ < > CRON_SECRET                                   │  │
│ │    All Environments                               │  │
│ │                          👁️ **********  ...      │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ < > RESEND_API_KEY                                │  │
│ │    All Environments                               │  │
│ │                          👁️ **********  ...      │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ [+ Add Environment Variable]                           │
└─────────────────────────────────────────────────────────┘
```

---

**Herhangi bir adımda takıldıysanız veya sorunuz varsa, lütfen paylaşın!**
