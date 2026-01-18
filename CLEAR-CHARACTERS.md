# 🗑️ CALI Club Karakterlerini Temizleme

## Hızlı Yol: Supabase Dashboard

1. **Supabase Dashboard**'a gidin
2. **SQL Editor**'ü açın
3. Aşağıdaki SQL'i çalıştırın:

```sql
-- Tüm karakterleri inactive yap (sahneden kaybolur)
UPDATE cali_club_characters
SET is_active = false
WHERE is_active = true;
```

4. **Run** butonuna tıklayın

## Alternatif: Karakterleri Tamamen Sil

Eğer karakterleri tamamen silmek isterseniz:

```sql
-- Tüm karakterleri sil
DELETE FROM cali_club_characters;
```

## Kontrol Etme

Temizleme sonrası kontrol için:

```sql
SELECT id, name, session_id, is_active, created_at
FROM cali_club_characters
ORDER BY created_at DESC;
```

## Not

- `is_active = false` yapmak karakterleri sahneden kaldırır ama veritabanında tutar
- `DELETE` karakterleri tamamen siler
- Realtime subscription sayesinde değişiklikler anında görünür
