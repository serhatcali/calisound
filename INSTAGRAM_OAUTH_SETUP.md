# Instagram OAuth Setup Guide

## Adım 1: Meta for Developers'da App Oluşturma

1. [Meta for Developers](https://developers.facebook.com/) sayfasına gidin
2. **My Apps** > **Create App** butonuna tıklayın
3. App türü seçin:
   - **Business** veya **Consumer** seçin (Instagram için Business önerilir)
   - App adı girin (örn: "Cali Sound Social")
   - Contact email girin
   - **Create App** butonuna tıklayın

## Adım 2: Instagram Product Ekleme

1. App Dashboard'da **Add Product** butonuna tıklayın
2. **Instagram** product'ını bulun ve **Set Up** butonuna tıklayın
3. İki seçenek var:
   - **Instagram Basic Display** (basit, sadece profil bilgileri)
   - **Instagram Graph API** (gelişmiş, post yayınlama için gerekli)

### Instagram Graph API için (Önerilen - Post yayınlama için):

1. **Instagram Graph API** > **Set Up** butonuna tıklayın
2. **Settings > Basic** sayfasına gidin
3. **App ID** ve **App Secret**'ı not edin
4. **Add Platform** > **Website** ekleyin
5. **Site URL**: `http://localhost:3000` (development için)

## Adım 3: OAuth Redirect URI Ayarlama

1. **Products > Instagram > Basic Display** (veya **Instagram Graph API**) > **Settings**'e gidin
2. **Valid OAuth Redirect URIs** bölümüne ekleyin:
   ```
   http://localhost:3000/api/admin/social/oauth/instagram/callback
   ```
3. Production için domain'inizi de ekleyin:
   ```
   https://yourdomain.com/api/admin/social/oauth/instagram/callback
   ```

## Adım 4: Permissions (Scopes) Ayarlama

Instagram Graph API için gerekli permissions:
- `instagram_basic` - Temel profil bilgileri
- `instagram_content_publish` - Post yayınlama (önemli!)
- `pages_show_list` - Bağlı Facebook sayfalarını listeleme
- `pages_read_engagement` - Engagement verilerini okuma

**Not:** `instagram_content_publish` permission'ı için:
- App'in **Live Mode**'da olması gerekir (Development mode'da sınırlı)
- Veya **App Review** sürecinden geçmeniz gerekebilir

## Adım 5: Facebook Page Bağlama (Instagram Graph API için)

Instagram Graph API kullanmak için bir Facebook Page'e bağlı Instagram Business Account gerekir:

1. Facebook'ta bir **Page** oluşturun (eğer yoksa)
2. Instagram Business Account'unuzu bu Page'e bağlayın
3. App'inize bu Page'i ekleyin:
   - **Settings > Basic** > **Add Platform** > **Facebook Login**
   - **Settings > Advanced** > **Require App Secret** kapalı olmalı

## Adım 6: Environment Variables

`.env.local` dosyanıza ekleyin:

```bash
INSTAGRAM_APP_ID=your-app-id-here
INSTAGRAM_APP_SECRET=your-app-secret-here
```

## Adım 7: Test Etme

1. Development server'ı yeniden başlatın:
   ```bash
   npm run dev
   ```

2. Admin panelinde **Social > Integrations** sayfasına gidin

3. Instagram kartında **Connect** butonuna tıklayın

4. OAuth flow'u tamamlayın:
   - Meta login sayfası açılacak
   - Permissions'ları onaylayın
   - Redirect edileceksiniz

## Sorun Giderme

### "Invalid OAuth Redirect URI" hatası
- Redirect URI'nin tam olarak eşleştiğinden emin olun
- `http://localhost:3000` ve `https://localhost:3000` farklıdır

### "App Not in Live Mode" hatası
- Development mode'da bazı permissions sınırlıdır
- Test için App Review'a başvurmanız gerekebilir

### "Instagram account not connected to Facebook Page" hatası
- Instagram Business Account'unuzun bir Facebook Page'e bağlı olduğundan emin olun
- Personal Instagram account'lar için Instagram Basic Display kullanın

### "Permission denied" hatası
- Gerekli scopes'ların App'te aktif olduğundan emin olun
- `instagram_content_publish` için App Review gerekebilir

## Development vs Production

**Development Mode:**
- Sadece test kullanıcıları bağlanabilir
- Bazı permissions sınırlıdır
- Test için yeterlidir

**Live Mode:**
- Herkes bağlanabilir
- Tüm permissions kullanılabilir
- App Review gerekir
