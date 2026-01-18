# 🎉 CALI Club - Supabase Realtime Setup

## ✅ Yapılanlar

1. **API Routes** oluşturuldu:
   - `/api/cali-club/characters` - Karakter CRUD işlemleri
   - `/api/cali-club/messages` - Chat mesajları
   - `/api/cali-club/state` - Konser durumu

2. **Realtime Hook** eklendi:
   - `hooks/useCaliClubRealtime.ts` - Supabase Realtime subscriptions

3. **Bileşenler güncellendi**:
   - `CharacterCreator` - Supabase'e kaydediyor
   - `ChatPanel` - Supabase'e mesaj gönderiyor
   - `CaliClubClient` - Realtime hook'unu kullanıyor

## 📋 Supabase Setup

### 1. SQL Schema'yı Çalıştırın

Supabase Dashboard → SQL Editor → Yeni Query:

```sql
-- Dosya: supabase/cali-club-schema.sql içeriğini çalıştırın
```

Veya direkt olarak:

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `supabase/cali-club-schema.sql` dosyasının içeriğini kopyalayıp çalıştırın

### 2. Realtime'i Aktifleştirin

Supabase Dashboard → Database → Replication:

Aşağıdaki tablolar için Realtime'i aktifleştirin:
- ✅ `cali_club_characters`
- ✅ `cali_club_messages`
- ✅ `cali_club_state`

### 3. Environment Variables

`.env.local` dosyanızda şunların olduğundan emin olun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 Nasıl Çalışır?

1. **Karakter Oluşturma**:
   - Kullanıcı karakter oluşturur
   - API'ye POST isteği gönderilir
   - Supabase'e kaydedilir
   - Realtime subscription tüm kullanıcılara bildirir
   - 3D sahne otomatik güncellenir

2. **Chat**:
   - Kullanıcı mesaj gönderir
   - API'ye POST isteği gönderilir
   - Supabase'e kaydedilir
   - Realtime subscription tüm kullanıcılara bildirir
   - Chat paneli otomatik güncellenir

3. **Real-time Senkronizasyon**:
   - Tüm karakterler gerçek zamanlı görünür
   - Tüm mesajlar gerçek zamanlı görünür
   - Birden fazla kullanıcı aynı anda bağlanabilir

## 🧪 Test Etme

1. İki farklı tarayıcı penceresi açın (veya farklı cihazlar)
2. Her birinde farklı bir karakter oluşturun
3. Birinde mesaj gönderin
4. Diğer pencerede karakter ve mesajın göründüğünü kontrol edin

## ⚠️ Sorun Giderme

### Karakterler görünmüyor
- Supabase Realtime'in aktif olduğundan emin olun
- Browser console'da hata var mı kontrol edin
- Network tab'de API isteklerinin başarılı olduğunu kontrol edin

### Mesajlar görünmüyor
- `cali_club_messages` tablosunda Realtime aktif mi kontrol edin
- Browser console'da subscription hataları var mı kontrol edin

### Realtime çalışmıyor
- Supabase Dashboard → Database → Replication'da tabloların yanında yeşil işaret olmalı
- Environment variables doğru mu kontrol edin
- Supabase plan'ınız Realtime'i destekliyor mu kontrol edin (Free plan'da var)

## 📝 Sonraki Adımlar

- [ ] Apple Music entegrasyonu
- [ ] Karakter pozisyon güncellemeleri (hareket)
- [ ] Şarkı çalarken karakterlerin üstünde gösterim
- [ ] Daha gelişmiş karakter modelleri
