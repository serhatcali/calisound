# 🎵 YouTube Music API - Kurulum Rehberi

## ✅ Yapılanlar

1. **API Routes** oluşturuldu:
   - `/api/youtube-music/search` - YouTube Music'te arama yapar
   - `/api/youtube-music/video` - Video detaylarını getirir

2. **SongList Component** güncellendi:
   - YouTube Music arama özelliği eklendi
   - Şarkı ekleme özelliği eklendi
   - YouTube embed URL'leri eklendi

## 📋 Kurulum Adımları

### 1. Google Cloud Console'a Gidin

1. [Google Cloud Console](https://console.cloud.google.com/) → **Get started for free**
2. Google hesabınızla giriş yapın (ücretsiz)

### 2. Yeni Proje Oluşturun

1. Üst menüden **Select a project** → **New Project**
2. **Project name**: `CALI Sound` (veya istediğiniz isim)
3. **Create** butonuna tıklayın
4. Projeyi seçin

### 3. YouTube Data API v3'ü Aktifleştirin

1. Sol menüden **APIs & Services** → **Library**
2. Arama kutusuna "YouTube Data API v3" yazın
3. **YouTube Data API v3**'e tıklayın
4. **Enable** butonuna tıklayın

### 4. API Key Oluşturun

1. Sol menüden **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **API key**
3. API key oluşturulacak, kopyalayın
4. (Opsiyonel) API key'i kısıtlayın:
   - **API restrictions** → **Restrict key**
   - **YouTube Data API v3** seçin
   - **Save**

### 5. Environment Variables Ekleyin

`.env.local` dosyanıza ekleyin:

```env
# YouTube Data API v3 (YouTube Music için)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
```

**Not:** Zaten YouTube API key'iniz varsa (şehir videoları için), aynı key'i kullanabilirsiniz!

### 6. Test Edin

1. Server'ı yeniden başlatın: `npm run dev`
2. `http://localhost:3000/cali-club` sayfasına gidin
3. Sol sidebar'da "Şarkı Listesi" bölümüne gidin
4. Arama kutusuna bir şarkı adı yazın (örn: "Afro House")
5. "Ara" butonuna tıklayın
6. Sonuçlardan bir şarkı seçip "Ekle" butonuna tıklayın

## 🎯 Özellikler

- ✅ **Arama**: YouTube Music kataloğunda şarkı arama
- ✅ **Embed**: YouTube embed player ile çalma
- ✅ **Thumbnail**: Video thumbnail görselleri
- ✅ **Metadata**: Şarkı, sanatçı, süre bilgileri

## ⚠️ Limitler

- **Quota**: 10,000 units/day (ücretsiz)
- **Search**: 100 units per request
- **Video Details**: 1 unit per request
- **Günlük limit**: ~100 arama (yeterli)

## 🎵 Playback

YouTube Music videoları iframe embed ile çalınır:
- Full playback (tam şarkı)
- Video + Audio
- YouTube'un resmi player'ı

## 🐛 Sorun Giderme

### "YouTube API key not configured" hatası
- `.env.local` dosyasında `NEXT_PUBLIC_YOUTUBE_API_KEY` olduğundan emin olun
- Server'ı yeniden başlatın (`npm run dev`)

### "YouTube API request failed" hatası
- API key'in doğru olduğundan emin olun
- YouTube Data API v3'ün aktif olduğundan emin olun
- Quota limit'ine takılmış olabilir (10,000/day)

### Arama sonuçları gelmiyor
- Browser console'da hata var mı kontrol edin
- Network tab'de API isteklerini kontrol edin
- API key'in kısıtlanmamış olduğundan emin olun

## 📝 Notlar

- YouTube Data API **ücretsizdir** (10,000 units/day)
- Aynı API key'i şehir videoları için de kullanabilirsiniz
- YouTube Music'in direkt API'si yok, YouTube Data API kullanıyoruz
- "music" kelimesi otomatik olarak arama sorgusuna ekleniyor

## 🎬 Sonraki Adımlar

- [ ] YouTube iframe player entegrasyonu
- [ ] Şarkı çalarken karakterlerin üstünde gösterim
- [ ] Real-time şarkı senkronizasyonu
- [ ] Playlist özelliği
