# Hızlı Düzeltme - Boş Sayfalar

## Sorun
Sayfalar boş görünüyor çünkü Supabase'de veri yok.

## Çözüm

### 1. Supabase'de Tabloları Kontrol Edin

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **Table Editor'ü açın**
   - Sol menüden "Table Editor" seçin
   - `cities` tablosunu kontrol edin
   - `sets` tablosunu kontrol edin
   - `global_links` tablosunu kontrol edin

### 2. Eğer Tablolar Boşsa - Seed Data Ekleyin

1. **SQL Editor'ü açın**
   - Sol menüden "SQL Editor" seçin
   - "New query" butonuna tıklayın

2. **Schema'yı çalıştırın** (eğer tablolar yoksa)
   - `supabase/schema.sql` dosyasını açın
   - Tüm içeriği kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın

3. **Seed data'yı çalıştırın**
   - `supabase/seed-data.sql` dosyasını açın
   - Tüm içeriği kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın
   - "Success" mesajını bekleyin

### 3. Eğer "duplicate key" Hatası Alırsanız

Mevcut verileri temizleyip tekrar ekleyin:

```sql
TRUNCATE TABLE cities, sets, global_links CASCADE;
```

Sonra seed-data.sql'i tekrar çalıştırın.

### 4. RLS (Row Level Security) Kontrolü

Eğer veriler var ama görünmüyorsa, RLS politikalarını kontrol edin:

1. SQL Editor'de şunu çalıştırın:
```sql
-- RLS politikalarını kontrol et
SELECT * FROM pg_policies WHERE tablename = 'cities';
SELECT * FROM pg_policies WHERE tablename = 'sets';
SELECT * FROM pg_policies WHERE tablename = 'global_links';
```

2. Eğer politikalar yoksa, schema.sql'deki RLS bölümünü tekrar çalıştırın.

### 5. Browser'ı Yenileyin

1. Development server'ı durdurun (Ctrl+C)
2. Yeniden başlatın: `npm run dev`
3. Browser'da hard refresh: Cmd+Shift+R (Mac) veya Ctrl+Shift+R (Windows)

## Hızlı Test

SQL Editor'de şunu çalıştırarak verilerin var olup olmadığını kontrol edin:

```sql
SELECT COUNT(*) FROM cities;
SELECT COUNT(*) FROM sets;
SELECT COUNT(*) FROM global_links;
```

- `cities` → 11 olmalı
- `sets` → 3 olmalı  
- `global_links` → 1 olmalı

Eğer 0 görüyorsanız, seed-data.sql'i çalıştırmanız gerekiyor.
