# 📋 Supabase SQL Schema Kurulum Rehberi

## 🎯 Adım Adım Kurulum

### 1️⃣ Supabase Dashboard'a Giriş Yapın

1. Tarayıcınızda [https://supabase.com](https://supabase.com) adresine gidin
2. "Sign In" butonuna tıklayın
3. Hesabınıza giriş yapın

### 2️⃣ Projenizi Seçin

1. Dashboard'da projenizi seçin (CALI Sound projesi)
2. Sol menüden **"SQL Editor"** seçeneğine tıklayın

### 3️⃣ SQL Editor'ü Açın

1. SQL Editor sayfasında **"New query"** butonuna tıklayın
2. Veya mevcut bir query varsa, yeni bir tab açın

### 4️⃣ SQL Dosyasını Açın

1. Bilgisayarınızda şu dosyayı açın:
   ```
   /Users/serhatcali/Desktop/cali-sound/supabase/cali-club-schema.sql
   ```

2. Dosyanın **tüm içeriğini** kopyalayın (Cmd+A, Cmd+C)

### 5️⃣ SQL'i Supabase'e Yapıştırın

1. Supabase SQL Editor'deki boş alana yapıştırın (Cmd+V)
2. SQL kodunun tamamının yapıştırıldığından emin olun

### 6️⃣ SQL'i Çalıştırın

1. SQL Editor'ün sağ alt köşesinde **"Run"** butonuna tıklayın
2. Veya klavye kısayolu: **Cmd+Enter** (Mac) veya **Ctrl+Enter** (Windows)

### 7️⃣ Sonucu Kontrol Edin

1. SQL Editor'ün alt kısmında sonuç mesajı görünecek
2. Başarılı olursa yeşil bir onay mesajı göreceksiniz
3. Hata varsa kırmızı bir hata mesajı göreceksiniz

### 8️⃣ Tabloları Kontrol Edin

1. Sol menüden **"Table Editor"** seçeneğine tıklayın
2. Aşağıdaki tabloların oluşturulduğunu kontrol edin:
   - ✅ `cali_club_songs`
   - ✅ `cali_club_characters`
   - ✅ `cali_club_messages`
   - ✅ `cali_club_state`
   - ✅ `cali_club_sessions`

---

## 🔄 Realtime'i Aktifleştirme

### 1️⃣ Replication Sayfasına Gidin

1. Sol menüden **"Database"** seçeneğine tıklayın
2. Alt menüden **"Replication"** seçeneğine tıklayın

### 2️⃣ Tabloları Aktifleştirin

Aşağıdaki tabloların yanındaki toggle'ları **ON** yapın:

- ✅ `cali_club_characters` → Toggle ON
- ✅ `cali_club_messages` → Toggle ON
- ✅ `cali_club_state` → Toggle ON (opsiyonel)

### 3️⃣ Kaydedin

- Değişiklikler otomatik kaydedilir
- Yeşil işaret görünene kadar bekleyin

---

## ✅ Kontrol Listesi

Kurulum tamamlandıktan sonra kontrol edin:

- [ ] SQL Schema başarıyla çalıştırıldı
- [ ] 5 tablo oluşturuldu (songs, characters, messages, state, sessions)
- [ ] Realtime aktif edildi (characters, messages, state)
- [ ] Hata mesajı yok

---

## 🐛 Sorun Giderme

### Hata: "relation already exists"
- Tablolar zaten oluşturulmuş demektir
- Bu normal, devam edebilirsiniz

### Hata: "permission denied"
- Projenizin sahibi olduğunuzdan emin olun
- Service role key'iniz doğru mu kontrol edin

### Realtime çalışmıyor
- Replication sayfasında tabloların yanında yeşil işaret olmalı
- Supabase plan'ınız Realtime'i destekliyor mu kontrol edin
- Free plan'da Realtime mevcut

---

## 📸 Görsel Rehber (Yakında)

Adım adım ekran görüntüleri eklenecek.

---

## 🎉 Tamamlandı!

Kurulum tamamlandıktan sonra CALI Club sayfasını test edebilirsiniz:
- http://localhost:3000/cali-club
