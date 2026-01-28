# Tag Pack ve Hashtag Set Test Rehberi

## 1. Veritabanı Şemasını Çalıştırın

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `supabase/social-hashtags-tagpacks-schema.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'de çalıştırın

## 2. Tag Pack Testi

### Adım 1: Tag Pack Oluşturma
1. Admin panelinde **Social > Library** sayfasına gidin
2. **Tag Packs** tab'ına tıklayın
3. **+ New Tag Pack** butonuna tıklayın
4. Formu doldurun:
   - **Pack Name**: `Electronic Music Tags`
   - **Tags**: `electronic music, house music, techno, calisound, edm, progressive house`
   - **Description**: `Standard tags for electronic music releases`
5. **Create Pack** butonuna tıklayın

### Adım 2: Tag Pack Görüntüleme
- Oluşturduğunuz tag pack listede görünmeli
- Usage count 0 olarak görünmeli
- Edit ve Delete butonları çalışmalı

### Adım 3: Tag Pack Düzenleme
1. **Edit** butonuna tıklayın
2. Tags'i güncelleyin
3. **Update Pack** butonuna tıklayın
4. Değişikliklerin kaydedildiğini kontrol edin

### Adım 4: Tag Pack Silme
1. **Delete** butonuna tıklayın
2. Onaylayın
3. Tag pack'in listeden kaldığını kontrol edin

## 3. Hashtag Set Testi

### Adım 1: Hashtag Set Oluşturma
1. **Hashtags** tab'ına tıklayın
2. Platform filtresini seçin (örn: Instagram)
3. **+ New Hashtag Set** butonuna tıklayın
4. Formu doldurun:
   - **Platform**: `Instagram`
   - **Set Name**: `City Release Hashtags`
   - **Hashtags**: Input alanına `#music, #city, #release, #electronic` yazın ve **Add** butonuna tıklayın
   - **Description**: `Standard hashtags for city releases`
5. **Create Set** butonuna tıklayın

### Adım 2: Hashtag Set Görüntüleme
- Oluşturduğunuz hashtag set listede görünmeli
- Platform badge'i doğru görünmeli
- Hashtag'ler chip'ler olarak görünmeli
- Usage count 0 olarak görünmeli

### Adım 3: Platform Filtreleme
1. Platform dropdown'dan farklı bir platform seçin
2. Sadece o platforma ait hashtag set'lerinin göründüğünü kontrol edin
3. "All Platforms" seçtiğinizde tüm set'lerin göründüğünü kontrol edin

### Adım 4: Hashtag Set Düzenleme
1. Bir hashtag set'in **Edit** butonuna tıklayın
2. Hashtag ekleyin veya çıkarın
3. **Update Set** butonuna tıklayın
4. Değişikliklerin kaydedildiğini kontrol edin

### Adım 5: Hashtag Set Silme
1. **Delete** butonuna tıklayın
2. Onaylayın
3. Hashtag set'in listeden kaldığını kontrol edin

## 4. API Testi (Opsiyonel)

### Tag Pack API Testi
```bash
# List tag packs
curl -X GET http://localhost:3000/api/admin/social/tagpacks \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE"

# Create tag pack
curl -X POST http://localhost:3000/api/admin/social/tagpacks \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Test Tag Pack",
    "tags": "test, tags, pack",
    "description": "Test description"
  }'
```

### Hashtag Set API Testi
```bash
# List hashtag sets
curl -X GET http://localhost:3000/api/admin/social/hashtags \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE"

# Create hashtag set
curl -X POST http://localhost:3000/api/admin/social/hashtags \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Test Hashtag Set",
    "platform": "instagram",
    "hashtags": ["#music", "#city", "#release"],
    "description": "Test description"
  }'
```

## 5. Beklenen Sonuçlar

✅ Tag pack'ler oluşturulabilmeli, düzenlenebilmeli ve silinebilmeli
✅ Hashtag set'ler platform bazlı oluşturulabilmeli
✅ Platform filtresi çalışmalı
✅ Usage count takibi yapılmalı (şu an kullanım yok, ama yapı hazır)
✅ Tab count'ları doğru görünmeli
✅ Form validasyonları çalışmalı (name required, tags/hashtags required)

## 6. Sorun Giderme

### Tablolar oluşturulmadı hatası
- Supabase SQL Editor'de şemayı tekrar çalıştırın
- Tabloların oluştuğunu Supabase Table Editor'dan kontrol edin

### API 401 Unauthorized hatası
- Admin olarak giriş yaptığınızdan emin olun
- Session cookie'nin geçerli olduğunu kontrol edin

### Hashtag eklenmiyor
- Hashtag'lerin `#` ile başladığından emin olun
- Input alanına virgülle ayrılmış hashtag'ler yazın ve Add butonuna tıklayın
