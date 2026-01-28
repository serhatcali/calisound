# Resend Email Sorunu - Çözüm

## 🔴 Sorun

Resend test domain'i (`onboarding@resend.dev`) sadece hesabınıza kayıtlı email adresine gönderebilir:
- ✅ `serhatcali35@gmail.com` (Resend hesabınıza kayıtlı)
- ❌ `djcalitr@gmail.com` (Farklı email)

## ✅ Çözüm Seçenekleri

### Seçenek 1: Test için ADMIN_EMAIL'i değiştirin (Hızlı)

1. **Vercel Dashboard:**
   - Settings > Environment Variables
   - `ADMIN_EMAIL` variable'ını bulun
   - "..." > "Edit"
   - Value: `serhatcali35@gmail.com`
   - Save

2. **Test edin:**
   - Release detail sayfasında "Test Emails" butonuna tıklayın
   - Email `serhatcali35@gmail.com` adresine gönderilecek

### Seçenek 2: Domain Verify Edin (Production için)

1. **Resend Dashboard:**
   - https://resend.com/domains
   - "Add Domain" butonuna tıklayın
   - Domain: `calisound.com` (veya domain'iniz)
   - DNS kayıtlarını ekleyin (Resend size verecek)
   - Verify edin

2. **Vercel Dashboard:**
   - `RESEND_FROM_EMAIL` variable'ını güncelleyin
   - Value: `noreply@calisound.com` (verify edilmiş domain)

3. **ADMIN_EMAIL:**
   - `djcalitr@gmail.com` olarak kalabilir
   - Artık herhangi bir email adresine gönderebilirsiniz

## 📝 Hızlı Test

**Şimdi test için:**

1. Vercel Dashboard > Environment Variables
2. `ADMIN_EMAIL` → `serhatcali35@gmail.com` yapın
3. Save
4. Release detail sayfasında "Test Emails" butonuna tıklayın
5. Email `serhatcali35@gmail.com` adresine gönderilecek

**Production için:**

1. Resend'de domain verify edin
2. `RESEND_FROM_EMAIL` → `noreply@calisound.com` yapın
3. `ADMIN_EMAIL` → `djcalitr@gmail.com` olarak kalabilir

---

**Not:** Resend ücretsiz plan'da test domain sadece hesap sahibinin email'ine gönderebilir. Production için domain verify etmeniz gerekiyor.
