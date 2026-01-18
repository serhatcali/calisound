# 🎵 Spotify Web API - Kurulum Rehberi

## ✅ Yapılanlar

1. **API Routes** oluşturuldu:
   - `/api/spotify/auth` - Access token alır
   - `/api/spotify/search` - Spotify'da arama yapar
   - `/api/spotify/track` - Track detaylarını getirir

2. **SongList Component** güncellendi:
   - Spotify arama özelliği eklendi
   - Şarkı ekleme özelliği eklendi
   - Preview URL gösterimi eklendi

## 📋 Kurulum Adımları

### 1. Spotify Developer Dashboard'a Gidin

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Log In**
2. Spotify hesabınızla giriş yapın (ücretsiz)

### 2. Yeni App Oluşturun

1. **Create app** butonuna tıklayın
2. **App name**: `CALI Club` (veya istediğiniz isim)
3. **App description**: `Virtual Concert Experience`
4. **Website**: `https://calisound.com` (veya sitenizin URL'i)
5. **Redirect URI**: `http://localhost:3000` (development için)
6. **What API/SDKs are you planning to use?**: 
   - ✅ **Web API** seçin
7. **I understand and agree...** checkbox'ını işaretleyin
8. **Save** butonuna tıklayın

### 3. Client ID ve Secret Alın

1. Oluşturduğunuz app'e tıklayın
2. **Client ID**'yi kopyalayın
3. **Show client secret** butonuna tıklayın
4. **Client Secret**'ı kopyalayın

### 4. Environment Variables Ekleyin

`.env.local` dosyanıza ekleyin:

```env
# Spotify Web API
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### 5. Test Edin

1. Server'ı yeniden başlatın: `npm run dev`
2. `http://localhost:3000/cali-club` sayfasına gidin
3. Sol sidebar'da "Şarkı Listesi" bölümüne gidin
4. Arama kutusuna bir şarkı adı yazın (örn: "Afro House")
5. "Ara" butonuna tıklayın
6. Sonuçlardan bir şarkı seçip "Ekle" butonuna tıklayın

## 🎯 Özellikler

- ✅ **Arama**: Spotify kataloğunda şarkı arama
- ✅ **Preview**: 30 saniyelik preview dinleme
- ✅ **Artwork**: Albüm kapak resimleri
- ✅ **Metadata**: Şarkı, sanatçı, albüm bilgileri

## ⚠️ Limitler

- **Preview**: Sadece 30 saniyelik preview (full playback için Spotify Premium gerekir)
- **Rate Limit**: 10,000 requests/day (yeterli)
- **Client Credentials**: Sadece arama için (kullanıcı authentication gerekmez)

## 🎵 Full Playback İçin (İsteğe Bağlı)

Full şarkı çalmak için:
1. Spotify Web Playback SDK kullanın
2. OAuth flow implementasyonu gerekir
3. Kullanıcıların Spotify Premium hesabı gerekir

## 🐛 Sorun Giderme

### "Spotify credentials not configured" hatası
- `.env.local` dosyasında değişkenlerin doğru olduğundan emin olun
- Server'ı yeniden başlatın (`npm run dev`)

### "Failed to get Spotify access token" hatası
- Client ID ve Secret'ın doğru olduğundan emin olun
- Spotify Developer Dashboard'da app'in aktif olduğundan emin olun

### Arama sonuçları gelmiyor
- Browser console'da hata var mı kontrol edin
- Network tab'de API isteklerini kontrol edin
- Spotify API rate limit'e takılmış olabilir (10,000/day)

## 📝 Notlar

- Spotify Web API **ücretsizdir**
- Client Credentials Flow kullanıyoruz (kullanıcı login gerekmez)
- Preview URL'ler 30 saniyelik önizleme sağlar
- Full playback için Spotify Web Playback SDK gerekir (daha sonra eklenebilir)
