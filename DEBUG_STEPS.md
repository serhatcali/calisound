# Debug Adımları

## 1. Terminal'de Debug Script Çalıştırın

```bash
cd /Users/serhatcali/Desktop/cali-sound
npm run debug-fetch
```

Bu komut Supabase'den veri çekip çekemediğimizi test eder.

## 2. Development Server Terminal'inde Log'ları Kontrol Edin

Server çalışırken terminal'de şunları görmelisiniz:

```
✅ Cities fetched: 11 (Total in DB: 11)
✅ Sets fetched: 3 (Total in DB: 3)
📊 Cities page - cities count: 11
📊 Sets page - sets count: 3
🏙️ CitiesPageClient - initialCities: 11
```

Eğer hata görüyorsanız, hata mesajını kopyalayın.

## 3. Browser Console'u Kontrol Edin

1. Browser'da F12'ye basın
2. Console sekmesine gidin
3. Kırmızı hata var mı kontrol edin
4. Hata varsa, tam hata mesajını kopyalayın

## 4. Network Tab'ını Kontrol Edin

1. F12 > Network sekmesi
2. Sayfayı yenileyin
3. `cities` veya `sets` ile ilgili istek var mı bakın
4. İstek başarısızsa (kırmızı), tıklayıp detayları kontrol edin

## 5. Supabase RLS Kontrolü

SQL Editor'de şunu çalıştırın:

```sql
-- Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('cities', 'sets', 'global_links');
```

Eğer hiç policy görünmüyorsa, RLS politikaları eksik demektir.

## 6. RLS'yi Geçici Olarak Kapat (Test İçin)

⚠️ **SADECE TEST İÇİN!** Production'da açık tutun!

```sql
-- TEMPORARY: Disable RLS for testing
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE sets DISABLE ROW LEVEL SECURITY;
```

Eğer bu çalışırsa, sorun RLS politikalarında demektir.

## Sonuçları Paylaşın

Lütfen şunları paylaşın:
1. `npm run debug-fetch` çıktısı
2. Development server terminal log'ları
3. Browser console hataları (varsa)
4. Network tab'ında başarısız istekler (varsa)
