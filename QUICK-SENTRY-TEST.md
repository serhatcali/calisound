# 🧪 Sentry Hızlı Test

## ✅ Test 1: Console Error (Yaptınız)
```javascript
throw new Error("Test hatası - Sentry test")
```
**Sonuç**: ✅ Hata oluşturuldu

---

## 🔍 Sentry Çalışıyor mu Kontrol

### Browser Console'da Kontrol
Console'da şu mesajı görmelisiniz:
```
🔔 Sentry Event (dev mode): { ... }
```

Eğer bu mesajı görüyorsanız, Sentry çalışıyor demektir!

---

## 📊 Sentry Dashboard Kontrol

1. **https://sentry.io/** → Projenize girin
2. Sol menüden **"Issues"** seçin
3. **"Test hatası - Sentry test"** başlıklı hata var mı?

---

## 🧪 Daha Fazla Test

### Test 2: API Route
Browser'da şu URL'ye gidin:
```
http://localhost:3000/api/test-sentry
```

### Test 3: Test Sayfası
```
http://localhost:3000/test-sentry
```
Butonlara tıklayın.

---

## ❓ Sorun Giderme

### Sentry Event görünmüyor
- Console'da `🔔 Sentry Event` mesajı var mı?
- `.env.local` dosyasında `NEXT_PUBLIC_SENTRY_DSN` var mı?
- Server'ı yeniden başlattınız mı?

### Sentry Dashboard'da hata görünmüyor
- Birkaç dakika bekleyin (Sentry bazen gecikmeli gönderir)
- Development mode'da gönderim kapalı olabilir (şimdi açık)
- DSN doğru mu kontrol edin

---

**Şimdi yapın**: Console'da `🔔 Sentry Event` mesajını görüyor musunuz?
