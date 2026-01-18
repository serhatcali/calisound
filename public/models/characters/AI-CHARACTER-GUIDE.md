# Yapay Zeka ile Karakter Oluşturma Rehberi

## 🎯 Test Karakteri Tarifi

### Karakter Özellikleri

**Temel Bilgiler:**
- **Cinsiyet**: Erkek
- **Yaş**: 25-30 yaş arası
- **Vücut Tipi**: Ortalama, atletik
- **Yükseklik**: Normal (1.75-1.80m)

**Yüz Özellikleri:**
- Orta büyüklükte gözler (anime değil, gerçekçi)
- Düzgün burun
- Orta büyüklükte ağız
- Temiz yüz (sakalsız veya hafif sakal)
- Doğal ten rengi

**Saç:**
- Kısa saç (2-3 cm)
- Doğal saç rengi (siyah, kahverengi veya sarı)
- Basit stil (düz veya hafif dalgalı)

**Kıyafet:**
- Basit T-shirt veya polo
- Pantolon (jean veya chino)
- Ayakkabı (spor ayakkabı veya bot)

**Pozisyon:**
- T-pose veya A-pose (kollar yana açık)
- Ayakta duruyor
- Düzgün duruş

## 🤖 AI Araçları ve Prompt'lar

### 1. Meshy.ai (Önerilen)
**URL**: https://meshy.ai

**Prompt:**
```
A realistic 3D human character, male, 25-30 years old, average build, athletic. 
Short hair, clean face, wearing a simple t-shirt and pants. 
T-pose position, standing straight. 
Game-ready, low poly, rigged character. 
Realistic style, not anime or stylized.
```

**Ayarlar:**
- Style: Realistic
- Quality: High
- Format: GLB
- Include: Rigging, Textures

### 2. Rodin (Blockade Labs)
**URL**: https://rodin.gg

**Prompt:**
```
Realistic 3D human male character, T-pose, 
short hair, casual clothing, 
game-ready model, rigged skeleton, 
realistic proportions, not stylized
```

### 3. Luma AI Genie
**URL**: https://lumalabs.ai/genie

**Prompt:**
```
A realistic 3D character model of a young adult male, 
standing in T-pose, wearing casual clothes, 
short hair, clean face, 
ready for game engine, rigged
```

### 4. CSM (Common Sense Machines)
**URL**: https://csm.ai

**Prompt:**
```
Realistic human male character, 
T-pose position, 
casual clothing, 
short hair, 
rigged 3D model, 
game-ready
```

## 📝 Detaylı Prompt Örneği

### İngilizce (En İyi Sonuç)
```
Create a realistic 3D human character model:
- Gender: Male
- Age: 25-30 years
- Body: Average build, athletic
- Pose: T-pose (arms extended horizontally)
- Hair: Short hair (2-3cm), natural color
- Face: Clean, no beard, realistic proportions
- Clothing: Simple t-shirt and pants
- Style: Realistic, not anime or stylized
- Technical: Game-ready, low poly, rigged skeleton
- Format: GLB with textures
- Height: Normal human proportions (1.75-1.80m)
- Feet position: Standing on ground plane (y=0)
```

### Türkçe (Bazı AI'lar için)
```
Gerçekçi 3D insan karakter modeli oluştur:
- Cinsiyet: Erkek
- Yaş: 25-30
- Vücut: Ortalama, atletik
- Pozisyon: T-pose (kollar yana açık)
- Saç: Kısa saç, doğal renk
- Yüz: Temiz, sakalsız, gerçekçi oranlar
- Kıyafet: Basit tişört ve pantolon
- Stil: Gerçekçi, anime değil
- Teknik: Oyun için hazır, düşük poly, kemik yapısı
- Format: GLB, texture'lar dahil
```

## 🎨 Material İsimlendirme (Önemli!)

AI ile oluşturduktan sonra, Blender'da material'ları isimlendirmeniz gerekir:

### Gerekli Material İsimleri:
- **Saç**: `hair` veya `Hair`
- **Kıyafet**: `cloth`, `shirt`, `pants`, `clothing`
- **Cilt**: `skin`, `face`, `body`, `hand`, `head`

### Blender'da İsimlendirme:
1. Blender'da model'i açın
2. Material Properties panel'ine gidin
3. Her material'ı uygun isimle değiştirin:
   - Saç material'ı → `hair`
   - Tişört material'ı → `shirt` veya `cloth`
   - Pantolon material'ı → `pants` veya `cloth`
   - Cilt material'ı → `skin` veya `body`

## 📐 Ölçek ve Pozisyon Ayarları

### Blender'da Düzenleme:
1. **Ölçek**: Karakter yüksekliği ~1.8 birim olmalı
2. **Pozisyon**: Ayaklar y=0 seviyesinde
3. **Origin**: Origin point karakterin ayaklarında olmalı

### Adımlar:
```
1. Model'i seçin
2. Object Mode → Origin to Geometry (Bottom)
3. Scale: Y ekseninde 1.8 birim yükseklik
4. Position: Y ekseninde ayaklar 0'da
5. Export: GLB formatında
```

## 🚀 Hızlı Test Karakteri

### En Basit Yöntem:
1. **Meshy.ai** kullanın (en kolay)
2. Prompt'u kopyalayın
3. GLB olarak indirin
4. Blender'da material'ları isimlendirin
5. `character-001-male.glb` olarak kaydedin
6. `public/models/characters/` klasörüne koyun

### Test Prompt (Kopyala-Yapıştır):
```
Realistic 3D human male character, T-pose, short hair, 
casual t-shirt and pants, clean face, 
game-ready rigged model, realistic proportions, 
GLB format with textures
```

## ⚠️ Önemli Notlar

1. **T-pose zorunlu**: Animasyon için T-pose veya A-pose gerekli
2. **Rigging gerekli**: Kemik yapısı olmalı
3. **Material isimlendirme kritik**: Renk özelleştirme için gerekli
4. **Ölçek tutarlı**: Tüm karakterler aynı ölçekte olmalı
5. **GLB formatı**: En hızlı yükleme için GLB kullanın

## 🎯 Başarı Kriterleri

Test karakteri başarılı sayılır eğer:
- ✅ T-pose pozisyonunda
- ✅ Rigged (kemik yapısı var)
- ✅ Material'lar isimlendirilmiş
- ✅ Ölçek doğru (~1.8 birim)
- ✅ Ayaklar y=0 seviyesinde
- ✅ GLB formatında
- ✅ Texture'lar dahil

## 📞 Sorun Giderme

**Karakter çok büyük/küçük:**
- Blender'da scale ayarlayın
- Yükseklik 1.8 birim olmalı

**Renkler değişmiyor:**
- Material isimlendirmesini kontrol edin
- `hair`, `cloth`, `skin` isimlerini kullanın

**Animasyon çalışmıyor:**
- Rigging kontrol edin
- T-pose pozisyonunu kontrol edin
