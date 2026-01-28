# ⚠️ CRON_SECRET Güvenlik Uyarısı

## 🔴 ÖNEMLİ: Secret Değiştirin!

CRON_SECRET'ınız paylaşıldı. **Hemen yeni bir secret oluşturup güncelleyin!**

## 🔧 Yeni Secret Oluşturma

### 1. Terminal'de yeni secret oluşturun:

```bash
openssl rand -base64 32
```

### 2. Vercel Dashboard'da güncelleyin:

1. Vercel Dashboard > Projeniz > Settings > Environment Variables
2. `CRON_SECRET` variable'ını bulun
3. "..." (3 nokta) > "Edit"
4. Yeni secret'ı yapıştırın (başında/sonunda boşluk olmadan!)
5. Save

### 3. Eski secret'ı kullanan herhangi bir yer varsa güncelleyin

## 🔒 Güvenlik Best Practices

1. **Secret'ları asla paylaşmayın:**
   - Email'de
   - Chat'te
   - Screenshot'larda
   - Public repository'lerde

2. **Düzenli olarak rotate edin:**
   - 3-6 ayda bir secret'ları değiştirin
   - Eski secret'ları disable edin

3. **Her environment için farklı secret kullanın:**
   - Production
   - Preview
   - Development

## ✅ Kontrol Listesi

- [ ] Yeni CRON_SECRET oluşturuldu
- [ ] Vercel Dashboard'da güncellendi
- [ ] Eski secret kullanılan yerler güncellendi
- [ ] Test edildi (yeni secret ile)

---

**Not:** Bu dosyayı secret'ları içerdiği için commit etmeyin!
