# Karakter Özelleştirme Rehberi

Mixamo'dan indirilen karakterler üzerinde **runtime'da** (kod ile) ve **offline'da** (Blender gibi araçlarla) düzenleme yapabilirsiniz.

## ✅ Runtime'da Yapılabilecekler (Kod ile)

### 1. **Materyal Renkleri**
- Kıyafet renkleri değiştirilebilir
- Cilt tonu ayarlanabilir
- Saç rengi değiştirilebilir
- Göz rengi ayarlanabilir

**Örnek:**
```typescript
updateCharacter(characterId, {
  avatar_data: {
    color: '#ff0000', // Kırmızı kıyafet
    skinTone: '#fdbcb4', // Açık ten rengi
    hairColor: '#000000', // Siyah saç
  }
})
```

### 2. **Scale ve Boyut**
- Karakter boyutu ayarlanabilir
- Ölçeklendirme yapılabilir

**Örnek:**
```typescript
updateCharacter(characterId, {
  avatar_data: {
    size: 1.2 // %20 daha büyük
  }
})
```

### 3. **Animasyonlar**
- Dans animasyonları değiştirilebilir
- Yürüme, koşma animasyonları eklenebilir
- Animasyon hızı ayarlanabilir

### 4. **Efektler**
- Glow (parıltı) efekti
- Outline (dış çizgi) efekti
- Işık efektleri

## ❌ Runtime'da Yapılamayacaklar

### 1. **Geometri Değişiklikleri**
- Yüz şekli değiştirilemez
- Vücut oranları değiştirilemez
- Yeni mesh eklenemez
- Mesh silinemez

### 2. **Rig Değişiklikleri**
- Kemik yapısı değiştirilemez
- Yeni kemikler eklenemez

## 🔧 Offline Düzenleme (Blender ile)

Eğer karakterin geometrisini veya yapısını değiştirmek istiyorsanız:

### 1. **Blender ile Düzenleme**

1. **Blender'ı İndirin:** https://www.blender.org (ücretsiz)
2. **FBX'i İçe Aktarın:**
   - File → Import → FBX
   - Mixamo'dan indirdiğiniz `.fbx` dosyasını seçin
3. **Düzenleme Yapın:**
   - Yüz şeklini değiştirin
   - Vücut oranlarını ayarlayın
   - Kıyafet ekleyin/çıkarın
   - Saç modelini değiştirin
4. **GLTF Olarak Dışa Aktarın:**
   - File → Export → glTF 2.0 (.glb/.gltf)
   - Ayarlar:
     - Format: glTF Binary (.glb)
     - Include: Selected Objects, Animations
     - Transform: +Y Up
5. **Kullanın:**
   - Dışa aktarılan `.glb` dosyasını `public/models/` klasörüne koyun

### 2. **Blender Eklentileri**

- **Mixamo Importer:** Mixamo karakterlerini direkt içe aktarır
- **Rigify:** Otomatik rig oluşturur
- **Auto-Rig Pro:** Gelişmiş karakter rigging

## 🎨 Özelleştirme Seviyeleri

### Seviye 1: Basit (Runtime)
- ✅ Renk değişiklikleri
- ✅ Scale ayarları
- ✅ Animasyon değişiklikleri

### Seviye 2: Orta (Blender)
- ✅ Geometri düzenlemeleri
- ✅ Materyal değişiklikleri
- ✅ Yeni kıyafet ekleme

### Seviye 3: İleri (Blender + Texture)
- ✅ Texture (doku) değişiklikleri
- ✅ Normal map ekleme
- ✅ Özel kıyafet tasarımı

## 💡 Öneriler

1. **Başlangıç için:** Runtime özelleştirmeleri yeterli
2. **Orta seviye:** Blender ile temel düzenlemeler
3. **İleri seviye:** Özel karakter tasarımı

## 🔄 Karakter Güncelleme Süreci

1. **Mixamo'dan İndir** → FBX formatında
2. **Blender'da Düzenle** (isteğe bağlı)
3. **GLTF'ye Dönüştür** (Blender'dan export)
4. **Kod ile Özelleştir** (runtime)
5. **Kullan** → `public/models/` klasörüne koy

## 📝 Notlar

- Mixamo karakterleri zaten rig edilmiş ve animasyonlu gelir
- Runtime özelleştirmeleri anında uygulanır (sayfa yenileme gerekmez)
- Blender düzenlemeleri için 3D modelleme bilgisi gerekir
- En kolay yol: Mixamo'dan farklı karakterler indirip runtime'da renk değiştirmek
