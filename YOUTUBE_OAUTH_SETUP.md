# YouTube OAuth Setup Guide (En Kolay)

YouTube OAuth, Google Cloud Console üzerinden yapılır ve genellikle en kolay erişilebilir platformdur.

## Adım 1: Google Cloud Console'a Giriş

1. [Google Cloud Console](https://console.cloud.google.com/) sayfasına gidin
2. Google hesabınızla giriş yapın
3. Yeni bir proje oluşturun veya mevcut projeyi seçin:
   - Üst kısımdaki proje seçiciye tıklayın
   - **New Project** → Proje adı: "Cali Sound Social" → **Create**

## Adım 2: YouTube Data API v3'ü Etkinleştirin

1. Sol menüden **APIs & Services > Library**'ye gidin
2. Arama kutusuna "YouTube Data API v3" yazın
3. **YouTube Data API v3**'ü seçin
4. **Enable** butonuna tıklayın

## Adım 3: OAuth 2.0 Credentials Oluşturma

1. **APIs & Services > Credentials** sayfasına gidin
2. Üst kısımdaki **+ CREATE CREDENTIALS** butonuna tıklayın
3. **OAuth client ID** seçin

### İlk kez OAuth consent screen ayarlıyorsanız:

1. **Configure Consent Screen** butonuna tıklayın
2. **User Type**: **External** seçin (test için) → **Create**
3. **App information**:
   - App name: "Cali Sound Social"
   - User support email: Email adresiniz
   - Developer contact: Email adresiniz
4. **Save and Continue**
5. **Scopes**: Şimdilik atlayın → **Save and Continue**
6. **Test users**: Şimdilik atlayın → **Save and Continue**
7. **Summary** → **Back to Dashboard**

### OAuth Client ID Oluşturma:

1. **APIs & Services > Credentials** sayfasına dönün
2. **+ CREATE CREDENTIALS > OAuth client ID**
3. **Application type**: **Web application** seçin
4. **Name**: "Cali Sound Web Client"
5. **Authorized redirect URIs** bölümüne ekleyin:
   ```
   http://localhost:3000/api/admin/social/oauth/youtube/callback
   ```
6. **Create** butonuna tıklayın
7. **Client ID** ve **Client secret**'ı kopyalayın (bir daha gösterilmeyecek!)

## Adım 4: Environment Variables

`.env.local` dosyanıza ekleyin:

```bash
YOUTUBE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your-client-secret-here
```

**Örnek:**
```bash
YOUTUBE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

## Adım 5: Server'ı Yeniden Başlatın

```bash
# Terminal'de Ctrl+C ile server'ı durdurun
# Sonra tekrar başlatın:
npm run dev
```

## Adım 6: Test Edin

1. Tarayıcıda `http://localhost:3000/admin/social/integrations` sayfasına gidin
2. YouTube kartında **Connect** butonuna tıklayın
3. Google login sayfası açılacak
4. Giriş yapın ve permissions'ları onaylayın
5. Redirect sonrası hesap "connected" olarak görünmeli

## Sorun Giderme

### "Redirect URI mismatch" hatası
- Redirect URI'nin tam olarak eşleştiğinden emin olun
- `http://localhost:3000` ve `https://localhost:3000` farklıdır
- Google Cloud Console'da redirect URI'yi kontrol edin

### "Access blocked" hatası
- OAuth consent screen'i düzgün yapılandırdığınızdan emin olun
- Test kullanıcı eklemeniz gerekebilir (External app için)

### "API not enabled" hatası
- YouTube Data API v3'ün etkinleştirildiğinden emin olun
- APIs & Services > Library'den kontrol edin

## Production Deployment

Production için:
1. OAuth consent screen'i **Publish** edin (App Review gerekebilir)
2. Authorized redirect URIs'ye production domain'inizi ekleyin:
   ```
   https://yourdomain.com/api/admin/social/oauth/youtube/callback
   ```
3. `.env.local` yerine production environment variables kullanın
