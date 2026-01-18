# 🎵 Apple Music - Basit Kurulum (Web için)

## ✅ İyi Haber: MusicKit Identifier GEREKMİYOR!

Web uygulaması için **sadece Developer Token** yeterli. Identifier sadece native iOS/macOS uygulamaları için gerekli.

## 📋 Adımlar

### 1. Private Key Oluşturun (Bu yeterli!)

1. [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list) → **Keys** bölümüne gidin
2. **+** (Create a key) butonuna tıklayın
3. **Key Name**: `CALI Sound MusicKit Key` (veya istediğiniz isim)
4. **MusicKit** servisini seçin (checkbox'ı işaretleyin)
5. **Continue** → **Register**
6. **Download** butonuna tıklayın (`.p8` dosyası indirilecek)
7. **Key ID**'yi kopyalayın (örnek: `ABC123DEF4`)
   - Key ID sayfanın üstünde görünür
   - VEYA indirdiğiniz dosya adında var: `AuthKey_ABC123DEF4.p8`

### 2. Team ID'yi Bulun

1. Sağ üst köşede **hesap adınıza** tıklayın
2. **Team ID**'yi kopyalayın (örnek: `XYZ987ABC6`)

### 3. .p8 Dosyasını Projeye Ekleyin

1. İndirdiğiniz `.p8` dosyasını proje klasörüne kopyalayın
2. Önerilen konum: `keys/` klasörü oluşturup oraya koyun
3. Örnek: `keys/AuthKey_ABC123DEF4.p8`

### 4. .gitignore'a Ekleyin (Güvenlik)

`.gitignore` dosyasına ekleyin:
```
keys/
*.p8
```

### 5. Environment Variables Ekleyin

`.env.local` dosyanıza ekleyin:

```env
# Apple Music API
APPLE_MUSIC_TEAM_ID=XYZ987ABC6
APPLE_MUSIC_KEY_ID=ABC123DEF4
APPLE_MUSIC_PRIVATE_KEY_PATH=keys/AuthKey_ABC123DEF4.p8
```

**Önemli:**
- `APPLE_MUSIC_TEAM_ID` = Team ID (hesap adınızın yanında)
- `APPLE_MUSIC_KEY_ID` = Key ID (dosya adında veya key sayfasında)
- `APPLE_MUSIC_PRIVATE_KEY_PATH` = Dosya yolu (proje klasöründen)

### 6. Test Edin

1. Server'ı yeniden başlatın: `npm run dev`
2. `http://localhost:3000/cali-club` sayfasına gidin
3. Sol sidebar'da "Şarkı Listesi" bölümüne gidin
4. Arama kutusuna bir şarkı yazın (örn: "Afro House")
5. "Ara" butonuna tıklayın

## 🎯 Hangi Bilgilere İhtiyacınız Var?

1. ✅ **Team ID** - Hesap adınızın yanında
2. ✅ **Key ID** - Key oluşturduktan sonra görünür
3. ✅ **.p8 Dosyası** - Key oluşturduktan sonra indirilir

## ⚠️ Önemli Notlar

- **Identifier oluşturmanıza gerek YOK** (sadece native uygulamalar için)
- **Services ID oluşturmanıza gerek YOK** (sadece OAuth için)
- Web için **sadece Developer Token** yeterli (JWT token)

## 🐛 Sorun Giderme

### "Apple Music credentials not configured" hatası
- `.env.local` dosyasını kontrol edin
- Server'ı yeniden başlatın (`npm run dev`)

### "Failed to read Apple Music private key" hatası
- `.p8` dosyasının yolunu kontrol edin
- Dosya adını doğru yazdığınızdan emin olun

### Key oluştururken "MusicKit" seçeneği görünmüyor
- Apple Developer hesabınızın aktif olduğundan emin olun
- Bazen sayfayı yenilemek gerekir
