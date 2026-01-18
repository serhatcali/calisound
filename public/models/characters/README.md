# Karakter Modelleri Rehberi

## 📁 Dosya Yapısı

Karakter modelleri `public/models/characters/` klasörüne yerleştirilmelidir:

```
public/models/characters/
├── character-001-male.glb
├── character-002-male.glb
├── character-003-male.glb
├── character-004-female.glb
├── character-005-female.glb
└── ...
```

## 🎯 Model Gereksinimleri

### Format
- **GLB formatı** (önerilen - tek dosya, hızlı yükleme)
- GLTF formatı da desteklenir

### Özellikler
- ✅ Rigged (kemik yapısı) - animasyon için gerekli
- ✅ T-pose veya A-pose - standart pozisyon
- ✅ Material'lar isimlendirilmiş olmalı:
  - `hair`, `Hair` - Saç için
  - `cloth`, `shirt`, `pants`, `dress`, `jacket` - Kıyafet için
  - `skin`, `face`, `body`, `hand`, `head` - Cilt için

### Ölçek
- Karakter yüksekliği: ~1.8 birim (normalize edilmiş)
- Ayaklar y=0 seviyesinde olmalı

## 📥 Model Kaynakları

### Ücretsiz Kaynaklar

1. **Mixamo** (Adobe)
   - URL: https://www.mixamo.com
   - Ücretsiz, gerçekçi karakterler
   - Animasyonlar dahil
   - GLTF export mevcut

2. **Sketchfab**
   - URL: https://sketchfab.com
   - Creative Commons lisanslı modeller
   - Arama: "rigged human character"
   - GLTF/GLB download

3. **Poly Haven**
   - URL: https://polyhaven.com/models
   - Ücretsiz 3D modeller
   - CC0 lisans

### Premium Kaynaklar (İsteğe Bağlı)

1. **TurboSquid**
   - Profesyonel karakter paketleri
   - Yüksek kalite

2. **CGTrader**
   - Karakter paketleri
   - Çeşitli stiller

## 🔧 Model Hazırlama Adımları

### 1. Model İndirme
- Mixamo'dan veya başka kaynaktan karakter indirin
- GLB formatında export edin

### 2. Material İsimlendirme
Model'i Blender'da açıp material'ları isimlendirin:
- Saç: `hair` veya `Hair`
- Kıyafet: `cloth`, `shirt`, `pants`, vb.
- Cilt: `skin`, `face`, `body`, vb.

### 3. Ölçek ve Pozisyon
- Karakter yüksekliği ~1.8 birim olmalı
- Ayaklar y=0 seviyesinde
- Origin point karakterin ayaklarında olmalı

### 4. Dosya Adlandırma
- Format: `character-XXX-gender.glb`
- Örnek: `character-001-male.glb`
- Örnek: `character-004-female.glb`

### 5. Test
- Model'i `public/models/characters/` klasörüne koyun
- Uygulamada test edin
- Material özelleştirmelerinin çalıştığını kontrol edin

## 🎨 Material Özelleştirme

Sistem otomatik olarak şu material'ları özelleştirir:

- **Saç rengi**: `hair` içeren material'lar
- **Kıyafet rengi**: `cloth`, `shirt`, `pants`, `dress`, `jacket` içeren material'lar
- **Ten rengi**: `skin`, `face`, `body`, `hand`, `head` içeren material'lar

## 📝 Örnek Karakter Listesi

```
character-001-male.glb      - Kısa saçlı erkek
character-002-male.glb      - Uzun saçlı erkek
character-003-male.glb      - Sakallı erkek
character-004-female.glb    - Kısa saçlı kadın
character-005-female.glb    - Uzun saçlı kadın
character-006-female.glb    - Örgülü saçlı kadın
character-007-male.glb      - Spor kıyafetli erkek
character-008-female.glb    - Elbise giymiş kadın
...
```

## ⚠️ Önemli Notlar

1. **Material isimlendirme kritik**: Material'lar doğru isimlendirilmeli, aksi halde renk özelleştirme çalışmaz
2. **Rigging gerekli**: Animasyon için karakter rigged olmalı
3. **Ölçek tutarlılığı**: Tüm karakterler aynı ölçekte olmalı
4. **Performans**: GLB formatı GLTF'den daha hızlı yüklenir

## 🚀 Hızlı Başlangıç

1. Mixamo'dan bir karakter indirin
2. GLB formatında export edin
3. `character-001-male.glb` olarak kaydedin
4. `public/models/characters/` klasörüne koyun
5. Uygulamada test edin!
