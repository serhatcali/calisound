# Supabase Storage Setup Guide

## Problem: RLS Policy Error

Supabase Storage'da `storage.objects` tablosu sistem tablosudur ve doğrudan SQL ile policy oluşturulamaz.

## Çözüm: Supabase Dashboard'dan Policy Oluşturma

### Yöntem 1: Dashboard'dan Policy Oluştur (Önerilen)

1. **Supabase Dashboard'a git**
2. **Storage** > **Policies** sekmesine git
3. **`calisound` bucket'ini seç**
4. **"New Policy"** butonuna tıkla
5. **Policy'leri oluştur:**

#### Policy 1: Public Read Access
- **Policy Name**: `Public Access for calisound bucket`
- **Allowed Operation**: `SELECT`
- **Policy Definition**: 
  ```sql
  bucket_id = 'calisound'
  ```

#### Policy 2: Anonymous Upload
- **Policy Name**: `Anonymous can upload to calisound`
- **Allowed Operation**: `INSERT`
- **Policy Definition**:
  ```sql
  bucket_id = 'calisound'
  ```

#### Policy 3: Anonymous Update
- **Policy Name**: `Anonymous can update calisound files`
- **Allowed Operation**: `UPDATE`
- **Policy Definition**:
  ```sql
  bucket_id = 'calisound'
  ```

#### Policy 4: Anonymous Delete
- **Policy Name**: `Anonymous can delete calisound files`
- **Allowed Operation**: `DELETE`
- **Policy Definition**:
  ```sql
  bucket_id = 'calisound'
  ```

### Yöntem 2: Bucket'i Tamamen Public Yap (Daha Basit)

1. **Supabase Dashboard** > **Storage** > **Buckets**
2. **`calisound` bucket'ine tıkla**
3. **Settings** sekmesine git
4. **"Public bucket"** seçeneğini açık yap
5. **"Save"** butonuna tıkla

Bu yöntem genellikle yeterlidir ve ek policy oluşturmanıza gerek kalmaz.

### Yöntem 3: Service Role Key ile SQL (Gelişmiş)

Eğer SQL ile yapmak istersen, Supabase Dashboard > Settings > API > Service Role Key'i kullanarak SQL Editor'de çalıştırabilirsin. Ancak bu yöntem önerilmez çünkü güvenlik riski oluşturur.

## Kontrol

Policy'leri oluşturduktan sonra:
1. Sayfayı yenile
2. Upload'u tekrar dene
3. Çalışmazsa browser console'u kontrol et

## Not

Supabase Storage için RLS policy'leri genellikle Dashboard'dan yönetilir. SQL ile doğrudan oluşturulamaz çünkü `storage.objects` sistem tablosudur.
