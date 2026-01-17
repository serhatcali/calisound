# YouTube Video Fetcher - Kullanım Rehberi

## 📋 Genel Bakış

Bu script, YouTube'dan şehirlerle ilgili videoları otomatik olarak bulup Supabase veritabanına kaydeder.

## 🔑 YouTube API Key Alma

1. [Google Cloud Console](https://console.cloud.google.com/) → Proje oluşturun veya seçin
2. **APIs & Services** → **Library**
3. **YouTube Data API v3** → **Enable**
4. **Credentials** → **Create Credentials** → **API Key**
5. API Key'i kopyalayın

## ⚙️ Kurulum

### 1. .env.local Dosyasına API Key Ekleyin

```bash
cd /Users/serhatcali/Desktop/cali-sound
echo "YOUTUBE_API_KEY=your-api-key-here" >> .env.local
```

### 2. Gerekli Paketleri Yükleyin (Zaten var)

```bash
npm install
```

## 🚀 Kullanım

### Tek Bir Şehir İçin

```bash
node scripts/youtube-fetcher.js rio
```

### Tüm Şehirler İçin

```bash
node scripts/youtube-fetcher.js
```

## 📊 Ne Yapar?

1. **Video Arama**: Şehir adı + ülke + "afro house" ile YouTube'da arama yapar
2. **En İyi Videoyu Seçer**: Bulduğu videolar arasından en uygun olanı seçer
3. **Video Detaylarını Çeker**: Thumbnail, başlık, açıklama gibi bilgileri alır
4. **Veritabanını Günceller**:
   - `youtube_full`: Video URL'i
   - `banner_16x9_url`: Thumbnail URL'i
   - `cover_square_url`: Thumbnail URL'i (aynı)
   - `yt_title`: Video başlığı
   - `yt_description`: Video açıklaması

## ⚠️ Önemli Notlar

- **Rate Limiting**: YouTube API günlük 10,000 istek limiti var
- **API Key Güvenliği**: API key'i `.env.local` dosyasında saklayın, commit etmeyin
- **Manuel Kontrol**: Script otomatik çalışsa da, sonuçları manuel kontrol edin
- **Thumbnail Kalitesi**: YouTube thumbnails 16:9 formatında, square için ayrı işlem gerekebilir

## 🔧 Gelişmiş Kullanım

### Sadece Belirli Şehirler İçin

Script'i düzenleyerek sadece belirli şehirleri işleyebilirsiniz:

```javascript
// scripts/youtube-fetcher.js içinde
const targetCities = ['rio', 'dubai', 'istanbul']
```

### Özel Arama Sorguları

Script'te `queries` array'ini düzenleyerek arama sorgularını özelleştirebilirsiniz.

## 📝 Örnek Çıktı

```
🔍 Searching: "Rio de Janeiro Brazil afro house"
📝 Updating city: rio
   Video: CALI Sound: Rio de Janeiro | Afro House
   Thumbnail: Yes
✅ City updated successfully!
```

## 🐛 Sorun Giderme

### "YOUTUBE_API_KEY not found" Hatası
- `.env.local` dosyasında API key'in olduğundan emin olun
- Server'ı yeniden başlatın

### "Quota exceeded" Hatası
- Günlük limit aşıldı, 24 saat bekleyin
- Veya farklı bir API key kullanın

### "No videos found" Uyarısı
- Arama sorgularını değiştirmeyi deneyin
- Şehir adını kontrol edin
