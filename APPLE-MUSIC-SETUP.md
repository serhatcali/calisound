# 🎵 Apple Music Entegrasyonu - Kurulum Rehberi

## ✅ Yapılanlar

1. **API Routes** oluşturuldu:
   - `/api/apple-music/developer-token` - JWT token üretir
   - `/api/apple-music/search` - Apple Music'te arama yapar
   - `/api/cali-club/songs` - Şarkıları Supabase'de yönetir

2. **SongList Component** güncellendi:
   - Apple Music arama özelliği eklendi
   - Şarkı ekleme özelliği eklendi
   - Şarkı listesi Supabase'den çekiliyor

## 📋 Kurulum Adımları

### 1. Apple Developer Hesabı Oluşturun

1. [Apple Developer Portal](https://developer.apple.com/)'a gidin
2. Hesap oluşturun (ücretsiz hesap yeterli)
3. **Certificates, Identifiers & Profiles** bölümüne gidin

### 2. MusicKit Identifier Oluşturun

1. **Identifiers** > **+** butonuna tıklayın
2. **Services IDs** seçin
3. Identifier: `com.calisound.musickit` (veya istediğiniz bir isim)
4. **MusicKit** servisini aktifleştirin
5. **Continue** ve **Register**

### 3. Private Key Oluşturun

1. **Keys** bölümüne gidin
2. **+** butonuna tıklayın
3. Key Name: `CALI Sound MusicKit Key`
4. **MusicKit** servisini seçin
5. **Continue** ve **Register**
6. **Download** butonuna tıklayın (`.p8` dosyası)
7. **Key ID**'yi not edin (örnek: `ABC123DEF4`)

### 4. Team ID'yi Bulun

1. Sağ üst köşede hesap adınıza tıklayın
2. **Team ID**'yi not edin (örnek: `XYZ987ABC6`)

### 5. Environment Variables Ekleyin

`.env.local` dosyanıza ekleyin:

```env
# Apple Music API
APPLE_MUSIC_TEAM_ID=your_team_id_here
APPLE_MUSIC_KEY_ID=your_key_id_here
APPLE_MUSIC_PRIVATE_KEY_PATH=keys/AuthKey_XXXXXXXXXX.p8
```

**Önemli:**
- `.p8` dosyasını proje klasörüne koyun (örn: `keys/` klasörü)
- Dosya yolunu `APPLE_MUSIC_PRIVATE_KEY_PATH`'e yazın
- `.gitignore`'a `keys/` klasörünü ekleyin (güvenlik için)

### 6. Test Edin

1. Sayfayı yenileyin: `http://localhost:3000/cali-club`
2. Sol sidebar'da "Şarkı Listesi" bölümüne gidin
3. Arama kutusuna bir şarkı adı yazın (örn: "Afro House")
4. "Ara" butonuna tıklayın
5. Sonuçlardan bir şarkı seçip "Ekle" butonuna tıklayın

## 🎯 Sonraki Adımlar

- [ ] MusicKit JS ile şarkı çalma özelliği
- [ ] Şarkı çalarken karakterlerin üstünde gösterim
- [ ] Real-time şarkı senkronizasyonu
- [ ] Playlist özelliği

## ⚠️ Notlar

- Apple Music API ücretsizdir (Apple Developer hesabı gerekir)
- JWT token 6 ay geçerlidir (otomatik yenilenir)
- Arama sonuçları sadece Apple Music kataloğundan gelir
- Şarkı çalmak için kullanıcıların Apple Music hesabı gerekir (MusicKit JS ile)

## 🐛 Sorun Giderme

### "Apple Music credentials not configured" hatası
- `.env.local` dosyasında değişkenlerin doğru olduğundan emin olun
- `.p8` dosyasının yolunun doğru olduğundan emin olun

### "Failed to read Apple Music private key" hatası
- `.p8` dosyasının proje klasöründe olduğundan emin olun
- Dosya yolunun doğru olduğundan emin olun

### Arama sonuçları gelmiyor
- Apple Developer hesabınızın aktif olduğundan emin olun
- MusicKit servisinin aktif olduğundan emin olun
- Browser console'da hata var mı kontrol edin
