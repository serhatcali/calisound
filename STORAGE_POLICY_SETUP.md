# Supabase Storage Policy Setup - Adım Adım

## Problem
Storage bucket RLS policy hatası alıyorsun. Policy'leri Dashboard'dan oluşturman gerekiyor.

## Çözüm: Dashboard'dan Policy Oluştur

### Adım 1: Storage Policies Sayfasına Git
1. **Supabase Dashboard**'a git
2. Sol menüden **Storage**'a tıkla
3. Üstteki **"Policies"** sekmesine tıkla (Buckets değil, Policies!)

### Adım 2: Bucket Seç
1. Üstteki dropdown'dan **`calisound`** bucket'ini seç
2. Eğer dropdown'da yoksa, önce bucket'in var olduğundan emin ol

### Adım 3: Policy 1 - SELECT (Okuma)
1. **"New Policy"** butonuna tıkla
2. **Policy Name**: `Public Access for calisound bucket`
3. **Allowed Operation**: **SELECT** seç
4. **Policy Definition** kutusuna şunu yaz:
   ```
   bucket_id = 'calisound'
   ```
5. **"Review"** butonuna tıkla
6. **"Save Policy"** butonuna tıkla

### Adım 4: Policy 2 - INSERT (Yükleme)
1. Tekrar **"New Policy"** butonuna tıkla
2. **Policy Name**: `Anonymous can upload to calisound`
3. **Allowed Operation**: **INSERT** seç
4. **Policy Definition** kutusuna şunu yaz:
   ```
   bucket_id = 'calisound'
   ```
5. **"Review"** > **"Save Policy"**

### Adım 5: Policy 3 - UPDATE (Güncelleme)
1. **"New Policy"** butonuna tıkla
2. **Policy Name**: `Anonymous can update calisound files`
3. **Allowed Operation**: **UPDATE** seç
4. **Policy Definition**:
   ```
   bucket_id = 'calisound'
   ```
5. **"Review"** > **"Save Policy"**

### Adım 6: Policy 4 - DELETE (Silme)
1. **"New Policy"** butonuna tıkla
2. **Policy Name**: `Anonymous can delete calisound files`
3. **Allowed Operation**: **DELETE** seç
4. **Policy Definition**:
   ```
   bucket_id = 'calisound'
   ```
5. **"Review"** > **"Save Policy"**

## Kontrol
Tüm 4 policy oluşturulduktan sonra:
- Policies listesinde 4 policy görünmeli
- Her birinin "calisound" bucket'ine ait olduğundan emin ol

## Test
1. Sayfayı yenile
2. Upload'u tekrar dene

## Not
Eğer "Policies" sekmesi görünmüyorsa:
- Supabase projenin Storage özelliği aktif mi kontrol et
- Farklı bir Supabase planı kullanıyor olabilirsin
