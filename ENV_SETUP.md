# Environment Variables Kurulumu

## Sorun
Localhost'ta site çalışmıyor çünkü Supabase bağlantı bilgileri eksik.

## Çözüm

### 1. Supabase Credentials'ları Alın

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **Settings > API'ye gidin**
   - Sol menüden "Settings" (⚙️)
   - "API" sekmesine tıklayın

3. **Credentials'ları kopyalayın**
   - **Project URL**: `https://xxxxx.supabase.co` formatında
   - **anon public key**: Uzun bir string (anon key, service_role değil!)

### 2. .env.local Dosyası Oluşturun

Proje klasöründe (cali-sound/) `.env.local` dosyası oluşturun:

```bash
cd /Users/serhatcali/Desktop/cali-sound
touch .env.local
```

### 3. İçeriği Doldurun

`.env.local` dosyasını açın ve şunu ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Örnek:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Development Server'ı Yeniden Başlatın

```bash
# Mevcut server'ı durdurun (Ctrl+C)
# Sonra tekrar başlatın:
npm run dev
```

### 5. Kontrol Edin

1. Browser console'u açın (F12)
2. Hata var mı kontrol edin
3. Network tab'ında Supabase isteklerinin başarılı olduğunu kontrol edin

## Sorun Giderme

### "Supabase credentials not found" uyarısı
→ `.env.local` dosyasının doğru yerde olduğundan ve doğru format'ta olduğundan emin olun

### "Failed to fetch" hatası
→ Supabase URL ve key'in doğru olduğundan emin olun
→ Supabase dashboard'da projenizin aktif olduğunu kontrol edin

### "No data" görünüyor
→ Seed data'nın başarıyla eklendiğinden emin olun (Table Editor'de kontrol edin)
→ RLS (Row Level Security) politikalarının doğru olduğundan emin olun

### Veriler görünmüyor
→ Browser'ı hard refresh yapın (Cmd+Shift+R / Ctrl+Shift+R)
→ Development server'ı yeniden başlatın

## Önemli Notlar

- `.env.local` dosyasını **ASLA** git'e commit etmeyin (zaten .gitignore'da olmalı)
- `NEXT_PUBLIC_` prefix'i önemli - olmadan çalışmaz
- Anon key kullanın, service_role key değil (güvenlik için)
