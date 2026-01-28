# Vercel Hobby Plan - Cron Jobs Limiti

## ⚠️ Önemli Not

Vercel Hobby plan'da **günde sadece bir kez** cron job çalıştırılabilir.

## 📅 Mevcut Cron Job Schedule

### Daily Tasks
- **Schedule:** `0 7 * * *` (Her gün 07:00 UTC = 10:00 Europe/Istanbul)
- **Açıklama:** Günlük task email'leri gönderilir

### Reminders
- **Schedule:** `0 8 * * *` (Her gün 08:00 UTC = 11:00 Europe/Istanbul)
- **Açıklama:** Bugün ve yarın post yapılacak planlar için reminder email'leri gönderilir
- **Not:** Post zamanından 2-24 saat öncesinde reminder gönderilir

## 🔄 Alternatif Çözümler

### Seçenek 1: Manuel Trigger (Önerilen)

Reminders için manuel trigger endpoint'i kullanabilirsiniz:

```bash
# Manuel olarak reminder'ları tetikle
curl -X GET "https://your-domain.com/api/cron/reminders" \
  -H "Authorization: Bearer your-cron-secret"
```

### Seçenek 2: Vercel Pro Plan'a Upgrade

Pro plan'da sınırsız cron job çalıştırabilirsiniz:
- Her saat reminder kontrolü yapabilirsiniz
- Daha hassas timing için cron job'ları ayarlayabilirsiniz

### Seçenek 3: External Cron Service

Ücretsiz external cron service'ler kullanabilirsiniz:
- **cron-job.org** (ücretsiz)
- **EasyCron** (ücretsiz plan)
- **UptimeRobot** (ücretsiz)

Bu servislerden Vercel endpoint'inizi her saat çağırabilirsiniz.

## 📝 Mevcut Çalışma Mantığı

### Reminders Cron Job

1. Her gün 08:00 UTC'de çalışır
2. Tüm active release'leri kontrol eder
3. Her release için platform plan'larını kontrol eder
4. Post zamanı **2-24 saat içinde** olan planlar için reminder gönderir
5. Her plan için günde sadece bir kez reminder gönderilir

### Örnek Senaryo

```
Bugün: 29 Ocak 2026, 11:00 (Europe/Istanbul)
Cron Job Çalışır: 29 Ocak 2026, 11:00

Platform Plan:
  - Planned At: 30 Ocak 2026, 14:00
  - Time Diff: ~27 saat
  - ✅ Reminder gönderilir (2-24 saat aralığında)

Platform Plan:
  - Planned At: 30 Ocak 2026, 13:00
  - Time Diff: ~26 saat
  - ✅ Reminder gönderilir

Platform Plan:
  - Planned At: 29 Ocak 2026, 12:00 (1 saat sonra)
  - Time Diff: 1 saat
  - ❌ Reminder gönderilmez (2 saatten az)
```

## 🎯 Öneriler

1. **Manuel Kontrol:** Önemli post'lar için manuel olarak reminder endpoint'ini çağırın
2. **Pro Plan:** Eğer çok fazla release yönetiyorsanız Pro plan'a upgrade edin
3. **External Service:** Ücretsiz external cron service kullanın

## 🔧 Manuel Trigger Script

Manuel olarak reminder'ları tetiklemek için bir script oluşturabilirsiniz:

```bash
#!/bin/bash
# trigger-reminders.sh

CRON_SECRET="your-secret-here"
DOMAIN="https://your-domain.com"

curl -X GET "${DOMAIN}/api/cron/reminders" \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

Bu script'i istediğiniz zaman çalıştırabilirsiniz.
