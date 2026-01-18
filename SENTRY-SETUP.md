# 🔧 Sentry Next.js Kurulum Rehberi

## 📋 Adım Adım Kurulum

### 1. Paketi Yükleyin
```bash
npm install @sentry/nextjs --save
```

### 2. Sentry Wizard'ı Çalıştırın
```bash
npx @sentry/wizard@latest -i nextjs
```

Bu komut otomatik olarak:
- Sentry config dosyalarını oluşturur
- `next.config.js` dosyasını günceller
- Gerekli dosyaları ekler

### 3. DSN'i Ekleyin
Wizard size DSN soracak veya `.env.local` dosyasına ekleyin:
```env
NEXT_PUBLIC_SENTRY_DSN=https://0bda1fb494b696e7b106ce731ddaf769@o4510727889879040.ingest.de.sentry.io/4510727893876816
```

### 4. Server'ı Yeniden Başlatın
```bash
npm run dev
```

---

## ⚠️ Önemli Notlar

1. **Wizard çalıştırıldıktan sonra** mevcut config dosyalarımız üzerine yazılabilir
2. **DSN'i tekrar eklemek** gerekebilir
3. **next.config.js** dosyası güncellenebilir

---

## 🔄 Alternatif: Manuel Kurulum

Eğer wizard kullanmak istemiyorsanız, mevcut config dosyalarımız zaten hazır. Sadece:

1. Paketi yükleyin: `npm install @sentry/nextjs --save`
2. Server'ı yeniden başlatın: `npm run dev`
3. Test edin!

---

## ✅ Hangi Yöntemi Tercih Edersiniz?

1. **Wizard ile otomatik kurulum** (Önerilen - daha kolay)
2. **Manuel kurulum** (mevcut dosyalarla devam)
