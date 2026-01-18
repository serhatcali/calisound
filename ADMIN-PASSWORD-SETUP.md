# Admin Password Setup

## ✅ Admin Şifresi Güncelleme

Admin şifreniz: **355266077.sSs**

## Kurulum Adımları

1. Proje kök dizinindeki `.env.local` dosyasını açın (yoksa oluşturun)

2. Aşağıdaki satırı ekleyin veya güncelleyin:

```env
ADMIN_PASSWORD=355266077.sSs
```

3. Dosyayı kaydedin

4. Development server'ı yeniden başlatın:
   ```bash
   npm run dev
   ```

## Önemli Notlar

- Bu şifre sadece development için. Production'da daha güçlü bir şifre kullanın.
- `.env.local` dosyası git'e commit edilmemeli (zaten .gitignore'da olmalı).
- Şifreyi değiştirmek için `.env.local` dosyasındaki `ADMIN_PASSWORD` değerini güncelleyin.

## Admin Panel Erişimi

1. Tarayıcıda `/admin/login` adresine gidin
2. Şifrenizi girin: `355266077.sSs`
3. Admin paneline erişebilirsiniz
