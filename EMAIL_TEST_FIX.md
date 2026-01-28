# Email Test - Hızlı Çözüm

## 🔴 Sorun

`RESEND_FROM_EMAIL` = `noreply@calisound.com` 
- Bu domain Resend'de verify edilmemiş
- Resend test domain'i (`onboarding@resend.dev`) sadece hesap sahibinin email'ine gönderebilir

## ✅ Hızlı Çözüm (Test için)

### Seçenek 1: RESEND_FROM_EMAIL'i değiştirin (Önerilen)

1. **Vercel Dashboard:**
   - Settings > Environment Variables
   - `RESEND_FROM_EMAIL` variable'ını bulun
   - "..." > "Edit"
   - Value: `onboarding@resend.dev` (Resend test domain)
   - Save

2. **ADMIN_EMAIL'i güncelleyin:**
   - `ADMIN_EMAIL` variable'ını bulun
   - "..." > "Edit"
   - Value: `serhatcali35@gmail.com` (Resend hesabınıza kayıtlı email)
   - Save

3. **Test edin:**
   - Release detail sayfasında "Test Emails" butonuna tıklayın
   - Email gönderilecek!

### Seçenek 2: Sadece ADMIN_EMAIL'i değiştirin

1. `ADMIN_EMAIL` → `serhatcali35@gmail.com`
2. `RESEND_FROM_EMAIL` → `onboarding@resend.dev` (zaten test domain kullanılıyor olabilir)

## 📝 Kontrol Listesi

Vercel Dashboard'da şu variable'lar olmalı:

- ✅ `RESEND_API_KEY` = `re_hFe3rfPA_2ricj8G8bRVA2z8qHPHdCu8K`
- ✅ `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (test için)
- ✅ `ADMIN_EMAIL` = `serhatcali35@gmail.com` (test için)

## 🚀 Production için (Sonra)

1. Resend Dashboard'da domain verify edin:
   - https://resend.com/domains
   - `calisound.com` domain'ini ekleyin
   - DNS kayıtlarını ekleyin
   - Verify edin

2. Vercel'de güncelleyin:
   - `RESEND_FROM_EMAIL` → `noreply@calisound.com`
   - `ADMIN_EMAIL` → `djcalitr@gmail.com` (istediğiniz email)

---

**Şimdi yapın:**
1. `RESEND_FROM_EMAIL` → `onboarding@resend.dev`
2. `ADMIN_EMAIL` → `serhatcali35@gmail.com`
3. Test edin!
