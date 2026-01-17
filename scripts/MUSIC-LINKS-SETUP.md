# Music Links Auto-Fetch Setup

Bu script, şehirler için Spotify ve Apple Music linklerini otomatik olarak bulur ve Supabase'e kaydeder.

## Kurulum

### 1. Spotify API Key'leri

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) adresine gidin
2. "Create App" butonuna tıklayın
3. App bilgilerini doldurun:
   - **App name**: CALI Sound (veya istediğiniz isim)
   - **App description**: Music links fetcher
   - **Website**: https://yourwebsite.com (opsiyonel)
   - **Redirect URI**: http://localhost:3000 (opsiyonel)
4. "Create" butonuna tıklayın
5. App sayfasında:
   - **Client ID**'yi kopyalayın
   - **Client Secret**'ı göster ve kopyalayın (gizli tutun!)

### 2. Apple Music API Key'leri

1. [Apple Developer](https://developer.apple.com) hesabınıza giriş yapın
2. "Certificates, Identifiers & Profiles" bölümüne gidin
3. "Keys" sekmesine tıklayın
4. "+" butonuna tıklayarak yeni bir key oluşturun:
   - **Key Name**: CALI Sound Music API
   - **Services**: "MusicKit" seçeneğini işaretleyin
5. "Continue" ve "Register" butonlarına tıklayın
6. Key oluşturulduktan sonra:
   - **Key ID**'yi kopyalayın (sadece bir kez gösterilir!)
   - **Team ID**'yi kopyalayın (sağ üstte)
   - **Download** butonuna tıklayarak `.p8` dosyasını indirin

### 3. .env.local Dosyasına Ekleme

`.env.local` dosyanıza şu değişkenleri ekleyin:

```env
# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Apple Music
APPLE_MUSIC_TEAM_ID=your_apple_team_id_here
APPLE_MUSIC_KEY_ID=your_apple_key_id_here
APPLE_MUSIC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----"
```

**Önemli Notlar:**
- Apple Music private key'i `.p8` dosyasından alın. Dosyayı açın ve içeriğini kopyalayın.
- Private key'deki `\n` karakterlerini koruyun (veya gerçek satır sonları kullanın)
- Private key'i tırnak içine alın

### 4. Private Key Formatı

`.p8` dosyasının içeriği şöyle görünür:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
...
-----END PRIVATE KEY-----
```

`.env.local` dosyasında şu şekilde kullanın:
```env
APPLE_MUSIC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----"
```

## Kullanım

```bash
npm run fetch-music-links
```

Script şunları yapar:
1. Tüm şehirleri Supabase'den çeker
2. Her şehir için Spotify'da arama yapar
3. Her şehir için Apple Music'te arama yapar
4. En uygun sonuçları bulur ve linkleri Supabase'e kaydeder
5. Zaten link olan şehirleri atlar

## Nasıl Çalışır?

Script, şehir adı ile farklı arama sorguları dener:
- "CALI Sound [City Name]"
- "CALI [City Name] Afro House"
- "[City Name] CALI Sound"
- "CALI [City Name]"

Her sonuç için bir skor hesaplar:
- Şehir adı eşleşmesi: +10 puan
- "CALI" kelimesi: +5 puan
- "Afro House" kelimesi: +5 puan
- "Afrobeat" kelimesi: +3 puan
- Playlist (albüm yerine): +2 puan

En yüksek skorlu sonuç seçilir (minimum 5 puan gerekir).

## Sorun Giderme

### Spotify Token Hatası
- Client ID ve Secret'ın doğru olduğundan emin olun
- Spotify Developer Dashboard'da app'in aktif olduğundan emin olun

### Apple Music Token Hatası
- Team ID, Key ID ve Private Key'in doğru olduğundan emin olun
- Private Key formatının doğru olduğundan emin olun (`\n` karakterleri önemli)
- Key'in MusicKit servisi için aktif olduğundan emin olun

### Link Bulunamıyor
- Spotify/Apple Music'te ilgili şehir için playlist/albüm olup olmadığını kontrol edin
- Arama sorgularını manuel olarak test edin
- Script log'larını kontrol edin

## Notlar

- Script rate limiting'e dikkat eder (her istek arasında 500ms bekler)
- Zaten link olan şehirler atlanır
- Sadece eksik linkler güncellenir
- Apple Music token 180 gün geçerlidir
