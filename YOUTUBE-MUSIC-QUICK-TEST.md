# 🎵 YouTube Music - Hızlı Test

## ✅ Mevcut API Key Kontrolü

Zaten YouTube API key'iniz var! Şimdi sadece test etmemiz gerekiyor.

## 🔍 Kontrol Listesi

### 1. `.env.local` Dosyasını Kontrol Edin

`.env.local` dosyanızda şu satır olmalı:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_existing_key_here
```

**Not:** Eğer sadece `YOUTUBE_API_KEY` varsa (script'ler için), aynı key'i `NEXT_PUBLIC_YOUTUBE_API_KEY` olarak da ekleyin:

```env
YOUTUBE_API_KEY=your_key_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key_here
```

### 2. Server'ı Yeniden Başlatın

```bash
npm run dev
```

### 3. Test Edin

1. `http://localhost:3000/cali-club` sayfasına gidin
2. Sol sidebar'da "Şarkı Listesi" bölümüne gidin
3. Arama kutusuna bir şarkı yazın (örn: "Afro House")
4. "Ara" butonuna tıklayın
5. Sonuçlar görünmeli!

## 🐛 Sorun Giderme

### "YouTube API key not configured" hatası
- `.env.local` dosyasında `NEXT_PUBLIC_YOUTUBE_API_KEY` olduğundan emin olun
- Server'ı yeniden başlatın

### Arama sonuçları gelmiyor
- Browser console'da hata var mı kontrol edin
- Network tab'de API isteğini kontrol edin
- API key'in doğru olduğundan emin olun

### API quota hatası
- Google Cloud Console'da quota'yı kontrol edin
- Günlük limit: 10,000 units (yeterli)

## ✅ Başarılı Olursa

- Arama sonuçları görünecek
- Şarkı ekleyebileceksiniz
- Şarkı listesinde görünecek

Test edip sonucu paylaşın!
