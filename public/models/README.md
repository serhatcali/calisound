# 3D Karakter Modelleri

Bu klasöre gerçekçi karakter modelleri (GLTF/GLB formatında) ekleyebilirsiniz.

## 🎯 Önerilen: Mixamo (Adobe) - ÜCRETSİZ

### Mixamo Kullanım Adımları:

1. **Hesap Oluşturma:**
   - https://www.mixamo.com adresine gidin
   - Adobe hesabıyla giriş yapın (ücretsiz)
   - Veya yeni hesap oluşturun

2. **Karakter Seçme:**
   - "Characters" sekmesine gidin
   - Bir karakter seçin (örn: "Samantha", "Remy", "Y Bot")
   - Karakteri indirmek yerine "Download" butonuna tıklayın

3. **Animasyon Ekleme (Opsiyonel ama Önerilen):**
   - "Animations" sekmesine gidin
   - Dans animasyonları için şunları arayın:
     - "Dancing" 
     - "Hip Hop Dancing"
     - "Idle"
     - "Walking"
   - Bir animasyon seçin
   - "Download" butonuna tıklayın

4. **Export Ayarları:**
   - **Format:** **"FBX Binary (.fbx)"** seçin ✅
     - ⚠️ Mixamo'da GLTF formatı YOK!
     - ✅ FBX formatını kullanın, sistem otomatik olarak yükler
   - **Skin:** "With Skin" seçili olsun
   - **Frames per Second:** 30 (varsayılan)
   - **Keyframe Reduction:** "none" (animasyon kalitesi için)
   - **Pose:** T-Pose (karakter için) veya animasyonlu (animasyon için)

5. **Dosya Yerleştirme:**
   - İndirilen `.glb` veya `.gltf` dosyasını bu klasöre (`public/models/`) koyun
   - Örnek dosya isimleri:
     - `character-male.glb` (erkek karakter)
     - `character-female.glb` (kadın karakter)
     - `character.glb` (varsayılan)

### Örnek Dosya Yapısı:

```
public/
  models/
    character.fbx          # Varsayılan karakter (Mixamo'dan)
    character-male.fbx     # Erkek karakter
    character-female.fbx   # Kadın karakter
    character-dance.fbx    # Dans animasyonlu karakter
```

**Not:** `.glb` veya `.gltf` formatı da kullanılabilir (Sketchfab, vb. kaynaklardan)

## 🔄 Alternatif Kaynaklar:

### 1. **Sketchfab**
- URL: https://sketchfab.com
- "rigged human character" araması yapın
- Ücretsiz modelleri filtreleyin
- GLTF formatında indirin

### 2. **Poly Haven**
- URL: https://polyhaven.com/models
- Ücretsiz, yüksek kalite modeller
- GLTF formatı mevcut

### 3. **CGTrader**
- URL: https://www.cgtrader.com
- Ücretsiz ve ücretli modeller
- GLTF formatı mevcut

## 📝 Notlar:

- **FBX formatı kullanın** (Mixamo'da GLTF yok!)
- Sistem hem FBX hem GLTF formatlarını destekler
- Modelin **rig edilmiş** olması önemli (animasyon için)
- Karakterler otomatik olarak cinsiyete göre model seçer:
  - `character.gender === 'male'` → `character-male.fbx`
  - `character.gender === 'female'` → `character-female.fbx`
  - Aksi halde → `character.fbx`

## 🎨 Karakter Özelleştirme:

Karakter verisinde `modelUrl` belirterek özel model kullanabilirsiniz:

```typescript
updateCharacter(characterId, {
  avatar_data: {
    ...character.avatar_data,
    modelUrl: '/models/my-custom-character.fbx' // veya .glb
  }
})
```

**Desteklenen formatlar:**
- `.fbx` (Mixamo'dan indirilen)
- `.glb` / `.gltf` (diğer kaynaklardan)
```

## ⚠️ Önemli:

- Ready Player Me artık kullanılamıyor (31 Ocak 2026'da kapanıyor)
- Mixamo en güvenilir ve ücretsiz alternatiftir
- **Mixamo'da GLTF formatı YOK, FBX kullanın!**
- Sistem otomatik olarak FBX ve GLTF formatlarını destekler
- Modelleri `public/models/` klasörüne koyun
- Dosya isimlerini yukarıdaki örneklere göre adlandırın
