# Seed Data Instructions

Bu dosya, CALI Sound sitesini örnek verilerle doldurmak için kullanılır.

## Hızlı Başlangıç

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **SQL Editor'ü açın**
   - Sol menüden "SQL Editor" seçin
   - "New query" butonuna tıklayın

3. **Schema'yı oluşturun**
   - `supabase/schema.sql` dosyasının içeriğini kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın

4. **Seed data'yı ekleyin**
   - `supabase/seed-data.sql` dosyasının içeriğini kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın

## İçerik

### Şehirler (Cities)
- **Rio de Janeiro** - OUT NOW (Festival, Sunset)
- **Dubai** - OUT NOW (Luxury, Sunset)
- **Rome** - OUT NOW (Luxury, Deep)
- **Amsterdam** - OUT NOW (Festival, Sunset)
- **Istanbul** - OUT NOW (Deep, Sunset)
- **Madrid** - OUT NOW (Festival, Luxury)
- **Beijing** - SOON (Deep, Luxury)
- **Cairo** - SOON (Sunset, Deep)
- **Delhi** - SOON (Festival, Sunset)
- **Tokyo** - SOON (Luxury, Deep)
- **New York** - SOON (Festival, Luxury)

### DJ Sets
- **CALI Sound Global Mix** - 32 dakika
- **CALI Sound Deep Sessions** - 45 dakika
- **CALI Sound Festival Mix** - 60 dakika

### Global Links
- YouTube, Instagram, TikTok, Spotify, Apple Music, SoundCloud, X, Facebook linkleri

## Notlar

- Tüm görseller Unsplash placeholder URL'leri kullanıyor
- Gerçek görseller için Supabase Storage'a yükleme yapmanız gerekecek
- YouTube linkleri placeholder - gerçek video ID'leri ile değiştirin
- Release tarihleri örnek olarak ayarlanmış - ihtiyacınıza göre güncelleyin

## Görselleri Yükleme

1. Supabase Dashboard > Storage
2. `city-assets` bucket'ını oluşturun (eğer yoksa)
3. Alt klasörler: `covers/`, `banners/`, `shorts/`
4. Görselleri yükleyin
5. Public URL'leri alın ve seed-data.sql'deki placeholder URL'leri güncelleyin

## Sorun Giderme

- **"relation does not exist" hatası**: Önce schema.sql'i çalıştırdığınızdan emin olun
- **"duplicate key" hatası**: Veriler zaten mevcut, bu normal
- **RLS hatası**: Schema.sql'deki RLS politikalarının doğru çalıştığından emin olun
