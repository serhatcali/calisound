# Şehir Resimlerini Ekleme - Detaylı Rehber

## 📋 İçindekiler
1. [Sorunun Analizi](#sorunun-analizi)
2. [Çözüm Yöntemleri](#çözüm-yöntemleri)
3. [Adım Adım Uygulama](#adım-adım-uygulama)
4. [Veritabanı Yapısı](#veritabanı-yapısı)
5. [Frontend'de Nasıl Görüntüleniyor](#frontendde-nasıl-görüntüleniyor)
6. [Alternatif Yöntemler](#alternatif-yöntemler)
7. [Sorun Giderme](#sorun-giderme)

---

## 🔍 Sorunun Analizi

### Mevcut Durum
- **Delhi, Cairo, Madrid, Amsterdam** şehirlerinin resimleri eksik
- Bu şehirler için placeholder (soru işareti) görüntüleri gösteriliyor
- Veritabanında `cover_square_url`, `banner_16x9_url`, `shorts_9x16_url` alanları NULL veya boş

### Neden Bu Şehirler?
1. **Seed data'da URL'ler var** ama veritabanına düzgün yüklenmemiş olabilir
2. **Unsplash URL'leri** çalışmıyor olabilir (rate limit, erişim sorunu)
3. **İlk veri girişi** sırasında bazı alanlar atlanmış olabilir

---

## 🛠️ Çözüm Yöntemleri

### Yöntem 1: SQL UPDATE Komutları (Önerilen)
✅ **Avantajlar:**
- Hızlı ve doğrudan
- Sadece eksik şehirleri günceller
- Veritabanını bozmaz

❌ **Dezavantajlar:**
- Manuel SQL çalıştırma gerektirir
- Her şehir için ayrı komut

### Yöntem 2: Seed Data'yı Yeniden Çalıştırma
✅ **Avantajlar:**
- Tüm verileri günceller
- Tutarlılık sağlar

❌ **Dezavantajlar:**
- Mevcut verileri silebilir (TRUNCATE kullanılırsa)
- Tüm şehirleri yeniden yükler

### Yöntem 3: Supabase Dashboard'dan Manuel Ekleme
✅ **Avantajlar:**
- Görsel arayüz
- Her şehir için ayrı kontrol

❌ **Dezavantajlar:**
- Çok zaman alıcı
- 11 şehir için tekrarlı işlem

---

## 📝 Adım Adım Uygulama

### Adım 1: Supabase'e Giriş
1. [Supabase Dashboard](https://app.supabase.com) açın
2. Projenizi seçin
3. Sol menüden **SQL Editor** seçin

### Adım 2: SQL Komutunu Çalıştırma

#### Seçenek A: Sadece Eksik Şehirleri Güncelleme
```sql
-- update-city-images.sql dosyasındaki komutları kopyalayın
-- SQL Editor'a yapıştırın
-- "Run" butonuna tıklayın
```

#### Seçenek B: Tüm Seed Data'yı Yeniden Yükleme
```sql
-- seed-data.sql dosyasını açın
-- İçeriğini kopyalayın
-- SQL Editor'a yapıştırın
-- "Run" butonuna tıklayın
```

### Adım 3: Güncellemeleri Doğrulama
```sql
-- Hangi şehirlerin resimleri var kontrol edin
SELECT 
  name, 
  slug, 
  cover_square_url IS NOT NULL as has_cover,
  banner_16x9_url IS NOT NULL as has_banner,
  shorts_9x16_url IS NOT NULL as has_shorts
FROM cities 
ORDER BY name;
```

### Adım 4: Frontend'de Test Etme
1. Development server'ı yeniden başlatın (gerekirse)
2. Tarayıcıda sayfayı yenileyin (Ctrl+F5 veya Cmd+Shift+R)
3. `/cities` sayfasına gidin
4. Resimlerin göründüğünü kontrol edin

---

## 🗄️ Veritabanı Yapısı

### Cities Tablosu - Resim Alanları

```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Resim URL'leri (3 farklı format)
  cover_square_url TEXT,        -- 1:1 (3000x3000) - Kart görünümü için
  banner_16x9_url TEXT,         -- 16:9 (1920x1080) - Hero/Banner için
  shorts_9x16_url TEXT,         -- 9:16 (1080x1920) - Instagram/TikTok için
  
  -- Diğer alanlar...
);
```

### Resim Formatları ve Kullanım Yerleri

| Format | Boyut | Kullanım Yeri | Örnek |
|--------|-------|---------------|-------|
| `cover_square_url` | 3000x3000 (1:1) | Şehir kartları, grid görünümü | `/cities` sayfası |
| `banner_16x9_url` | 1920x1080 (16:9) | Hero section, detay sayfası banner | `/city/[slug]` sayfası |
| `shorts_9x16_url` | 1080x1920 (9:16) | Mobil görünüm, Instagram/TikTok | Mobil cihazlarda |

---

## 🎨 Frontend'de Nasıl Görüntüleniyor

### 1. Cities Page (`/cities`)
```tsx
// components/cities/CitiesPageClient.tsx
{city.cover_square_url ? (
  <div className="relative aspect-square overflow-hidden">
    <Image
      src={city.cover_square_url}  // ← Veritabanından gelen URL
      alt={city.name}
      fill
      className="object-cover"
    />
  </div>
) : (
  // Placeholder göster (şehir baş harfi ile)
  <div className="aspect-square bg-gradient...">
    {city.name.charAt(0).toUpperCase()}
  </div>
)}
```

### 2. City Detail Page (`/city/[slug]`)
```tsx
// components/city/CityPageClient.tsx
{city.banner_16x9_url ? (
  <div className="relative aspect-video">
    <Image
      src={city.banner_16x9_url}  // ← Banner formatı
      alt={city.name}
      fill
    />
  </div>
) : (
  // Placeholder göster
)}
```

### 3. Home Page - Latest Release
```tsx
// components/home/LatestRelease.tsx
{city.banner_16x9_url && (
  <div className="relative h-64 md:h-96">
    <Image
      src={city.banner_16x9_url}
      alt={city.name}
      fill
    />
  </div>
)}
```

---

## 🔄 Alternatif Yöntemler

### Yöntem 1: Supabase Storage Kullanımı

Eğer kendi resimlerinizi yüklemek istiyorsanız:

1. **Supabase Storage'a Resim Yükleme:**
   ```bash
   # Supabase Dashboard > Storage > Create Bucket
   # Bucket adı: "city-images"
   # Public: true
   ```

2. **Resimleri Yükleme:**
   - Dashboard'dan manuel yükleme
   - veya API ile yükleme

3. **URL'leri Güncelleme:**
   ```sql
   UPDATE cities 
   SET cover_square_url = 'https://[project-id].supabase.co/storage/v1/object/public/city-images/delhi-square.jpg'
   WHERE slug = 'delhi';
   ```

### Yöntem 2: CDN Kullanımı

```sql
-- Cloudinary, Imgix, veya başka bir CDN
UPDATE cities 
SET cover_square_url = 'https://res.cloudinary.com/your-cloud/image/upload/v123/delhi.jpg'
WHERE slug = 'delhi';
```

### Yöntem 3: Local Assets (Static Export için)

```typescript
// public/images/cities/ klasörüne resimleri koyun
// Sonra URL'leri güncelleyin
UPDATE cities 
SET cover_square_url = '/images/cities/delhi-square.jpg'
WHERE slug = 'delhi';
```

---

## 🐛 Sorun Giderme

### Sorun 1: Resimler Görünmüyor

**Kontrol Listesi:**
- [ ] SQL komutları başarıyla çalıştı mı?
- [ ] Veritabanında URL'ler var mı? (SQL ile kontrol edin)
- [ ] Unsplash URL'leri çalışıyor mu? (Tarayıcıda açın)
- [ ] Next.js Image component doğru yapılandırılmış mı?
- [ ] `next.config.js`'de `images.unoptimized: true` var mı?

**Çözüm:**
```sql
-- Veritabanını kontrol edin
SELECT name, slug, cover_square_url 
FROM cities 
WHERE slug IN ('delhi', 'cairo', 'madrid', 'amsterdam');
```

### Sorun 2: Unsplash Rate Limit

**Belirtiler:**
- Resimler bazen yükleniyor, bazen yüklenmiyor
- Console'da 429 (Too Many Requests) hatası

**Çözüm:**
1. Unsplash API key alın
2. veya kendi resimlerinizi Supabase Storage'a yükleyin
3. veya farklı bir CDN kullanın

### Sorun 3: Resimler Yavaş Yükleniyor

**Çözüm:**
- Next.js Image optimization kullanın (production'da)
- CDN kullanın
- Resim boyutlarını optimize edin

---

## 📊 Güncellenen Şehirler

| Şehir | Slug | Durum | Resim Kaynağı |
|-------|------|-------|---------------|
| Delhi | `delhi` | SOON | Unsplash |
| Cairo | `cairo` | SOON | Unsplash |
| Madrid | `madrid` | OUT_NOW | Unsplash |
| Amsterdam | `amsterdam` | OUT_NOW | Unsplash |

---

## ✅ Sonuç

1. **SQL komutlarını çalıştırın** (`update-city-images.sql`)
2. **Veritabanını doğrulayın** (SELECT sorgusu ile)
3. **Frontend'i test edin** (sayfayı yenileyin)
4. **Resimler görünmüyorsa** sorun giderme adımlarını takip edin

---

## 📞 İhtiyaç Duyduğunuzda

- **Daha fazla şehir eklemek için:** `seed-data.sql` dosyasına yeni şehir ekleyin
- **Resim formatlarını değiştirmek için:** SQL UPDATE komutlarını düzenleyin
- **Kendi resimlerinizi kullanmak için:** Supabase Storage veya CDN kullanın

---

**Not:** Bu rehber, mevcut proje yapısına göre hazırlanmıştır. Farklı bir yapı kullanıyorsanız, komutları buna göre uyarlayın.
