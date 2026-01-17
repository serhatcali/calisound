# Otomatik YouTube Senkronizasyon Kurulumu

## Mevcut Durum
Şu anda YouTube videoları **manuel** olarak senkronize ediliyor:
- `npm run sync-cities` - Şehirleri senkronize eder
- `npm run sync-sets` - DJ setlerini senkronize eder

## Otomatik Senkronizasyon Seçenekleri

### 1. GitHub Actions (Önerilen) ✅

GitHub Actions ile her 6 saatte bir otomatik olarak senkronizasyon yapılabilir.

#### Kurulum:
1. GitHub repository'nize gidin
2. **Settings** > **Secrets and variables** > **Actions** bölümüne gidin
3. Şu secret'ları ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `YOUTUBE_API_KEY`

4. `.github/workflows/sync-youtube.yml` dosyası zaten oluşturuldu
5. GitHub Actions otomatik olarak çalışmaya başlayacak

#### Manuel Çalıştırma:
GitHub repository'nizde **Actions** sekmesinden manuel olarak da çalıştırabilirsiniz.

#### Zamanlama:
- Şu anda: Her 6 saatte bir
- Değiştirmek için `.github/workflows/sync-youtube.yml` dosyasındaki `cron: '0 */6 * * *'` satırını düzenleyin
  - Her saat: `'0 * * * *'`
  - Her 12 saat: `'0 */12 * * *'`
  - Her gün saat 00:00: `'0 0 * * *'`

### 2. Vercel Cron Jobs

Eğer Vercel'de deploy ediyorsanız, `vercel.json` dosyasına cron job ekleyebilirsiniz.

### 3. API Route (Manuel Tetikleme)

API route oluşturup dışarıdan tetiklenebilir hale getirebiliriz.

## Notlar

- GitHub Actions **ücretsiz** planında aylık 2000 dakika limiti var
- Her senkronizasyon yaklaşık 1-2 dakika sürer
- Aylık yaklaşık 720 çalıştırma (her 6 saatte bir) = ~1440 dakika (limit içinde)

## Sorun Giderme

Eğer otomatik senkronizasyon çalışmıyorsa:
1. GitHub Actions loglarını kontrol edin
2. Secret'ların doğru olduğundan emin olun
3. Manuel olarak `npm run sync-cities` ve `npm run sync-sets` komutlarını test edin
