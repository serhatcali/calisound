# Instagram Basic Display API Setup

Instagram Graph API'ye erişim yoksa, **Instagram Basic Display API** kullanabilirsiniz. Bu daha kolay erişilebilir ve business verification gerektirmez.

## Adım 1: Meta for Developers'da App Oluşturma

1. [Meta for Developers](https://developers.facebook.com/) → Giriş yapın
2. **My Apps** → **Create App**
3. App türü: **Consumer** veya **Business** (her ikisi de çalışır)
4. App adı: "Cali Sound Social"
5. Contact email: Email adresiniz
6. **Create App**

## Adım 2: Instagram Basic Display Product Ekleme

1. App Dashboard'da **Add Product**
2. **Instagram Basic Display** → **Set Up**
3. **Create New App** veya mevcut app'i seçin

## Adım 3: OAuth Redirect URI Ayarlama

1. **Products > Instagram Basic Display > Settings** sayfasına gidin
2. **Valid OAuth Redirect URIs** bölümüne ekleyin:
   ```
   http://localhost:3000/api/admin/social/oauth/instagram/callback
   ```
3. **Deauthorize Callback URL** (opsiyonel):
   ```
   http://localhost:3000/api/admin/social/oauth/instagram/deauthorize
   ```
4. **Data Deletion Request URL** (opsiyonel):
   ```
   http://localhost:3000/api/admin/social/oauth/instagram/data-deletion
   ```

## Adım 4: App ID ve App Secret

1. **Settings > Basic** sayfasına gidin
2. **App ID** ve **App Secret**'ı kopyalayın
3. **App Secret** için **Show** butonuna tıklayın

## Adım 5: Test Users Ekleme (Development Mode için)

Development mode'da sadece test kullanıcıları bağlanabilir:

1. **Roles > Test Users** sayfasına gidin
2. **Add Test Users** butonuna tıklayın
3. Test kullanıcıları oluşturun
4. Bu kullanıcılarla OAuth flow'unu test edin

**Not:** Production'da herkes bağlanabilir, ama App Review gerekebilir.

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

4. OAuth flow'u tamamlayın

## Instagram Basic Display vs Instagram Graph API

### Instagram Basic Display (Şu an kullanıyoruz):
- ✅ Kolay erişim, business verification gerekmez
- ✅ Personal Instagram account'lar için çalışır
- ❌ Post yayınlama yok (sadece okuma)
- ❌ Sadece kendi content'inize erişim

### Instagram Graph API (Gelecekte):
- ✅ Post yayınlama var
- ✅ Business account'lar için
- ❌ Business verification gerekir
- ❌ Facebook Page'e bağlı Instagram Business Account gerekir

## Sınırlamalar

Instagram Basic Display API ile:
- ✅ Profil bilgilerini okuyabilirsiniz
- ✅ Kullanıcının media'larını listeleyebilirsiniz
- ❌ Post yayınlayamazsınız (Graph API gerekir)
- ❌ Story yayınlayamazsınız (Graph API gerekir)

**Not:** Post yayınlama için gelecekte Instagram Graph API'ye geçiş yapabiliriz, ama şimdilik Basic Display ile bağlantıyı test edebiliriz.
