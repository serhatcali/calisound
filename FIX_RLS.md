# RLS Politikalarını Düzeltme

## Sorun
Linkler geliyor ama cities ve sets boş görünüyor. Bu muhtemelen RLS (Row Level Security) politikaları sorunlu.

## Çözüm

### 1. Supabase SQL Editor'de şunu çalıştırın:

```sql
-- Fix RLS Policies for CALI Sound

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for cities" ON cities;
DROP POLICY IF EXISTS "Public read access for sets" ON sets;
DROP POLICY IF EXISTS "Public read access for global_links" ON global_links;
DROP POLICY IF EXISTS "Public insert for click_tracking" ON click_tracking;

-- Recreate policies
CREATE POLICY "Public read access for cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Public read access for sets" ON sets
  FOR SELECT USING (true);

CREATE POLICY "Public read access for global_links" ON global_links
  FOR SELECT USING (true);

CREATE POLICY "Public insert for click_tracking" ON click_tracking
  FOR INSERT WITH CHECK (true);
```

### 2. RLS'nin aktif olduğundan emin olun:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('cities', 'sets', 'global_links', 'click_tracking');

-- If rowsecurity is false, enable it:
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;
```

### 3. Browser'ı yenileyin

1. Development server'ı durdurun (Ctrl+C)
2. Yeniden başlatın: `npm run dev`
3. Browser'da hard refresh: Cmd+Shift+R

### 4. Terminal'de log'ları kontrol edin

Server başladığında terminal'de şunları görmelisiniz:
```
✅ Cities fetched: 11
✅ Sets fetched: 3
📊 Cities page - cities count: 11
📊 Sets page - sets count: 3
```

Eğer hata görüyorsanız, hata mesajını paylaşın.
