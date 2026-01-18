# 🧪 Sentry Test Rehberi

## Test Yöntemleri

### 1. Test Sayfası (En Kolay)
1. Browser'da şu URL'ye gidin:
   ```
   http://localhost:3000/test-sentry
   ```
2. Butonlara tıklayın:
   - "Test Error Oluştur" → Hata oluşturur
   - "Test Mesajı Gönder" → Mesaj gönderir
   - "Console Error Oluştur" → Console error oluşturur

### 2. Browser Console (Hızlı Test)
1. F12 tuşuna basın (Developer Tools)
2. Console tab'ına gidin
3. Şu kodu yazıp Enter'a basın:
   ```javascript
   throw new Error("Test hatası - Sentry test")
   ```

### 3. Olmayan Sayfa (404 Test)
1. Browser'da şu URL'ye gidin:
   ```
   http://localhost:3000/olmayan-sayfa-12345
   ```
2. 404 sayfası görünecek (bu normal)
3. Sentry'de bu hatayı görebilirsiniz

### 4. Manuel Test (Kod ile)
Herhangi bir sayfada browser console'da:
```javascript
// Sentry'yi test et
import('@sentry/nextjs').then(Sentry => {
  Sentry.captureException(new Error('Test error'))
  console.log('✅ Sentry test mesajı gönderildi!')
})
```

---

## Sentry Dashboard'da Kontrol

1. https://sentry.io/ adresine gidin
2. Projenize girin
3. Sol menüden **"Issues"** seçin
4. Oluşturduğunuz hataları görebilirsiniz

---

## Sorun Giderme

### Sayfa açılmıyor
- Server çalışıyor mu? (`npm run dev`)
- Port doğru mu? (3000 veya 3002)
- Browser console'da hata var mı?

### Sentry'ye gönderilmiyor
- `.env.local` dosyasında `NEXT_PUBLIC_SENTRY_DSN` var mı?
- Server'ı yeniden başlattınız mı?
- `npm install` çalıştırdınız mı?

### Hatalar görünmüyor
- Sentry dashboard'da doğru projeyi seçtiniz mi?
- DSN doğru mu?
- Development mode'da gönderim kapalı olabilir (config'de kontrol edin)

---

## Başarılı Test İşaretleri

✅ Browser console'da hata yok
✅ Test sayfası açılıyor
✅ Butonlara tıklanabiliyor
✅ Sentry dashboard'da hatalar görünüyor

---

**Not**: Development mode'da Sentry hataları console'a yazdırılabilir ama gönderilmeyebilir. Production'da otomatik gönderilir.
