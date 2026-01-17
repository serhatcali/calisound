# Seed Data'yı Uygulama - Hızlı Kılavuz

## Adım 1: Supabase'e Giriş Yapın
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin veya yeni bir proje oluşturun

## Adım 2: SQL Editor'ü Açın
1. Sol menüden **"SQL Editor"** seçin
2. **"New query"** butonuna tıklayın

## Adım 3: Schema'yı Oluşturun (İlk kez ise)
1. `supabase/schema.sql` dosyasını açın
2. Tüm içeriği kopyalayın
3. SQL Editor'e yapıştırın
4. **"Run"** butonuna tıklayın (veya Cmd/Ctrl + Enter)
5. Başarılı mesajını bekleyin

## Adım 4: Seed Data'yı Ekleyin
1. `supabase/seed-data.sql` dosyasını açın
2. Tüm içeriği kopyalayın
3. SQL Editor'e yapıştırın
4. **"Run"** butonuna tıklayın
5. Başarılı mesajını bekleyin

## Adım 5: Verileri Kontrol Edin
1. Sol menüden **"Table Editor"** seçin
2. `cities` tablosunu açın - 11 şehir görmelisiniz
3. `sets` tablosunu açın - 3 DJ set görmelisiniz
4. `global_links` tablosunu açın - 1 satır görmelisiniz

## Sorun Giderme

### "relation does not exist" hatası
→ Önce `schema.sql` dosyasını çalıştırdığınızdan emin olun

### "duplicate key" hatası
→ Veriler zaten mevcut, bu normal. İsterseniz tabloları temizleyip tekrar çalıştırabilirsiniz:
```sql
TRUNCATE TABLE cities, sets, global_links CASCADE;
```
Sonra seed-data.sql'i tekrar çalıştırın.

### RLS (Row Level Security) hatası
→ Schema.sql'deki RLS politikalarının doğru çalıştığından emin olun

## Sonraki Adımlar

1. **Görselleri Yükleme** (Opsiyonel):
   - Storage > city-assets bucket oluşturun
   - covers/, banners/, shorts/ klasörleri oluşturun
   - Görselleri yükleyin ve URL'leri güncelleyin

2. **YouTube Linklerini Güncelleme**:
   - Gerçek video ID'leri ile placeholder'ları değiştirin

3. **Release Tarihlerini Güncelleme**:
   - İhtiyacınıza göre tarihleri güncelleyin

## Test Etme

Localhost'ta siteyi açın:
```bash
npm run dev
```

Artık tüm sayfalar örnek verilerle dolu olmalı!
