# Email Debug - Sorun Giderme

## 🔍 Kontrol Listesi

### 1. Vercel Environment Variables

Vercel Dashboard'da kontrol edin:

- ✅ `RESEND_API_KEY` = `re_hFe3rfPA_2ricj8G8bRVA2z8qHPHdCu8K`
- ✅ `RESEND_FROM_EMAIL` = `noreply@calisound.music` (verify edilmiş domain)
- ✅ `ADMIN_EMAIL` = `djcalitr@gmail.com` (veya istediğiniz email)

### 2. Resend Domain Kontrolü

Resend Dashboard'da kontrol edin:
- https://resend.com/domains
- `calisound.music` domain'i "Verified" durumunda mı?
- "Enable Sending" aktif mi?

### 3. Vercel Logs Kontrolü

1. Vercel Dashboard > Projeniz > **Functions**
2. Son deployment'ı seçin
3. **Logs** sekmesine gidin
4. Test email butonuna tıkladığınızda oluşan log'ları kontrol edin
5. `[Email]` ile başlayan log'ları arayın

### 4. Manuel Test

Terminal'de direkt Resend API'yi test edin:

```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_hFe3rfPA_2ricj8G8bRVA2z8qHPHdCu8K" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@calisound.music",
    "to": "djcalitr@gmail.com",
    "subject": "Test Email",
    "html": "<p>Test email from Cali Sound</p>"
  }'
```

## 🐛 Olası Sorunlar

### Sorun 1: Domain Verify Edilmemiş
**Çözüm:** Resend Dashboard'da domain'in "Verified" olduğundan emin olun

### Sorun 2: FROM_EMAIL Yanlış
**Çözüm:** `RESEND_FROM_EMAIL` = `noreply@calisound.music` (verify edilmiş domain)

### Sorun 3: API Key Yanlış
**Çözüm:** `RESEND_API_KEY` doğru mu kontrol edin

### Sorun 4: Environment Variable Deploy Edilmemiş
**Çözüm:** Vercel'de yeni bir deployment tetikleyin

## 📝 Yapılacaklar

1. Vercel Dashboard'da environment variables'ı kontrol edin
2. Resend Dashboard'da domain'in verify edildiğini kontrol edin
3. Test email butonuna tekrar tıklayın
4. Daha detaylı hata mesajını paylaşın
5. Vercel logs'u kontrol edin

---

**Şimdi test edin ve hata mesajını paylaşın!**
