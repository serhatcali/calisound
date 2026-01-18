# Mixamo Karakter İndirme Rehberi

## 📥 Adım Adım İndirme

### 1. Format Seçimi (ÇOK ÖNEMLİ!)

Mixamo'da indirme yaparken **Format dropdown'ından GLTF seçmelisiniz:**

✅ **DOĞRU:** 
- "glTF Binary (.glb)" 
- veya "glTF (.gltf)"

❌ **YANLIŞ:**
- "FBX Binary(.fbx)" 
- "OBJ"
- "DAE"

### 2. İndirme Ayarları

**DOWNLOAD SETTINGS** penceresinde:

```
Format: glTF Binary (.glb)  ← BURAYI DEĞİŞTİRİN!
Frames per Second: 30
Skin: With Skin
Keyframe Reduction: none
```

### 3. Karakter İndirme

1. Mixamo'da bir karakter seçin
2. "Download" butonuna tıklayın
3. Format dropdown'ından **"glTF Binary (.glb)"** seçin
4. "DOWNLOAD" butonuna tıklayın
5. İndirilen `.glb` dosyasını `public/models/` klasörüne koyun

### 4. Animasyon İndirme (Opsiyonel)

1. Mixamo'da "Animations" sekmesine gidin
2. Bir dans animasyonu seçin (örn: "Hip Hop Dancing")
3. Karaktere uygulayın
4. "Download" butonuna tıklayın
5. Format: **"glTF Binary (.glb)"** seçin
6. İndirin ve `public/models/` klasörüne koyun

## 📁 Dosya Yerleştirme

İndirilen dosyaları şu şekilde adlandırın:

```
public/models/
  ├── character.glb          # Varsayılan karakter
  ├── character-male.glb     # Erkek karakter
  └── character-female.glb   # Kadın karakter
```

## ⚠️ Sık Yapılan Hatalar

1. **FBX formatı seçmek:** ❌ FBX çalışmaz, GLTF seçin!
2. **Yanlış klasöre koymak:** Dosyalar `public/models/` içinde olmalı
3. **Dosya ismini değiştirmemek:** Sistem belirli isimleri arıyor

## ✅ Kontrol Listesi

- [ ] Format: glTF Binary (.glb) seçildi
- [ ] Skin: With Skin seçili
- [ ] Dosya `.glb` uzantılı
- [ ] Dosya `public/models/` klasöründe
- [ ] Dosya ismi doğru (character.glb, character-male.glb, vb.)

## 🎯 Önerilen Karakterler

Mixamo'da şu karakterler popülerdir:
- **Samantha** (kadın)
- **Remy** (erkek)
- **Y Bot** (nötr)
- **Paladin** (erkek)

## 🎬 Önerilen Animasyonlar

Dans için:
- "Hip Hop Dancing"
- "Dancing"
- "Idle"
- "Walking"
