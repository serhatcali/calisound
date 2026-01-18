# Karakter Yükleme Sorun Giderme

## 🔍 Sorun: Karakterler Yüklenmiyor (Placeholder Görünüyor)

Eğer karakterler yerine kahverengi kutu (placeholder) görüyorsanız:

### 1. Dosya Kontrolü

**Dosyaların doğru yerde olduğundan emin olun:**
```
public/models/
  ├── C1.fbx    ✅
  ├── C2.fbx    ✅
  ├── C3.fbx    ✅
  └── C4.fbx    ✅
```

**Kontrol:**
- Dosyalar `public/models/` klasöründe mi?
- Dosya isimleri tam olarak `C1.fbx`, `C2.fbx`, vb. mi? (büyük/küçük harf önemli!)
- `.fbx` uzantısı var mı?

### 2. Karakter İsimleri

**Karakter isimleri tam olarak şöyle olmalı:**
- `C1` (C büyük, 1 sayı)
- `C2`
- `C3`
- `C4`

**Yanlış örnekler:**
- ❌ `c1` (küçük harf)
- ❌ `Character1`
- ❌ `C 1` (boşluk var)
- ❌ `C-1` (tire var)

### 3. Tarayıcı Konsolu Kontrolü

**F12 tuşuna basın ve Console sekmesine bakın:**

Hata mesajları:
- `Model not found` → Dosya bulunamadı
- `Failed to load` → Dosya yüklenemedi
- `404 Not Found` → Dosya yolu yanlış

### 4. Network Sekmesi Kontrolü

**F12 → Network sekmesi:**

1. Sayfayı yenileyin (F5)
2. Network sekmesinde `C1.fbx`, `C2.fbx` gibi dosyaları arayın
3. Dosya yükleniyor mu kontrol edin
4. Eğer 404 hatası varsa, dosya yolu yanlış demektir

### 5. Manuel Model URL Belirleme

Eğer otomatik algılama çalışmıyorsa, manuel olarak belirleyin:

```typescript
// Karakter 1
updateCharacter(character1Id, {
  name: 'C1',
  avatar_data: {
    modelUrl: '/models/C1.fbx',  // Tam yol
    color: '#ff6b35'
  }
})

// Karakter 2
updateCharacter(character2Id, {
  name: 'C2',
  avatar_data: {
    modelUrl: '/models/C2.fbx',
    color: '#4ecdc4'
  }
})
```

### 6. Dosya Boyutu Kontrolü

**FBX dosyaları çok büyük olabilir:**
- 10MB altı → Normal
- 10-50MB → Yavaş yüklenebilir
- 50MB+ → Çok büyük, optimize edin

**Çözüm:**
- Mixamo'da "Keyframe Reduction" kullanın
- Gereksiz animasyonları kaldırın

### 7. CORS Hatası

Eğer CORS hatası alıyorsanız:
- Dosyalar `public/models/` klasöründe olmalı
- Next.js otomatik olarak `public/` klasörünü serve eder
- URL: `/models/C1.fbx` (başında `/` olmalı)

### 8. Hızlı Test

**Test için basit bir karakter oluşturun:**

```typescript
// Test karakteri
addCharacter({
  id: 'test-char',
  name: 'C1',  // ÖNEMLİ: Tam olarak "C1"
  gender: 'female',
  avatar_data: {
    modelUrl: '/models/C1.fbx',
    color: '#ff6b35'
  },
  position: { x: 0, y: 0, z: 0 },
  is_active: true
})
```

### 9. Dosya İsimlendirme Alternatifi

Eğer `C1.fbx` çalışmıyorsa, farklı isimler deneyin:

```typescript
// Alternatif 1: Küçük harf
updateCharacter(charId, {
  avatar_data: {
    modelUrl: '/models/c1.fbx'  // Küçük harf
  }
})

// Alternatif 2: Farklı isim
updateCharacter(charId, {
  avatar_data: {
    modelUrl: '/models/character1.fbx'
  }
})
```

### 10. Debug Modu

**Konsola debug bilgisi ekleyin:**

Tarayıcı konsolunda şunu görmelisiniz:
```
Model URL: /models/C1.fbx
Loading FBX model...
Model loaded successfully
```

Eğer görmüyorsanız, model yüklenmiyor demektir.

## ✅ Çözüm Adımları Özeti

1. ✅ Dosyalar `public/models/` klasöründe mi?
2. ✅ Dosya isimleri `C1.fbx`, `C2.fbx`, vb. mi?
3. ✅ Karakter isimleri `C1`, `C2`, vb. mi?
4. ✅ Tarayıcı konsolunda hata var mı?
5. ✅ Network sekmesinde dosyalar yükleniyor mu?
6. ✅ Manuel `modelUrl` belirlediniz mi?

## 🆘 Hala Çalışmıyorsa

1. Tarayıcı konsolundaki hata mesajını paylaşın
2. Network sekmesindeki durumu kontrol edin
3. Dosya yollarını kontrol edin
4. Karakter isimlerini kontrol edin
