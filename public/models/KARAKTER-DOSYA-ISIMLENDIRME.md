# Karakter Dosya İsimlendirme Rehberi

## 📁 Dosya İsimlendirme Sistemi

Mixamo'dan indirdiğiniz karakterleri doğru şekilde isimlendirmeniz gerekiyor.

## 🎯 Önerilen Yapı

### Seçenek 1: Cinsiyet Bazlı (Önerilen)

```
public/models/
  ├── character-male.fbx      # Erkek karakter (varsayılan erkek)
  ├── character-female.fbx    # Kadın karakter (varsayılan kadın)
  ├── character-1.fbx         # Özel karakter 1
  ├── character-2.fbx         # Özel karakter 2
  └── character-3.fbx         # Özel karakter 3
```

### Seçenek 2: Özel İsimlendirme

```
public/models/
  ├── C1.fbx                  # Karakter 1
  ├── C2.fbx                  # Karakter 2
  ├── C3.fbx                  # Karakter 3
  └── C4.fbx                  # Karakter 4
```

## 🔧 Karakter Store'da Model URL Belirleme

Her karakter için farklı model kullanmak için:

```typescript
// Karakter 1 - C1.fbx kullan
updateCharacter(character1Id, {
  avatar_data: {
    ...character.avatar_data,
    modelUrl: '/models/C1.fbx'
  }
})

// Karakter 2 - C2.fbx kullan
updateCharacter(character2Id, {
  avatar_data: {
    ...character.avatar_data,
    modelUrl: '/models/C2.fbx'
  }
})

// Karakter 3 - Erkek karakter kullan
updateCharacter(character3Id, {
  gender: 'male',
  avatar_data: {
    ...character.avatar_data,
    modelUrl: '/models/character-male.fbx'
  }
})
```

## 🎭 Farklı Dans Animasyonları

Eğer karakterleriniz farklı dans animasyonları içeriyorsa:

1. **Animasyonlu Karakter İndirme:**
   - Mixamo'da karakter seçin
   - Bir dans animasyonu seçin (örn: "Hip Hop Dancing")
   - Karaktere uygulayın
   - FBX olarak indirin
   - `C1-dance.fbx` olarak kaydedin

2. **Sadece Animasyon İndirme:**
   - Mixamo'da "Animations" sekmesine gidin
   - Animasyonu seçin
   - "Without Skin" seçin (sadece animasyon)
   - FBX olarak indirin
   - Kodda animasyonu karaktere uygulayın

## 📝 Örnek Senaryo

### Senaryo: 4 Farklı Karakter

**Dosyalar:**
```
public/models/
  ├── C1.fbx          # Kadın karakter 1 (Hip Hop dansı)
  ├── C2.fbx          # Kadın karakter 2 (Break dansı)
  ├── C3.fbx          # Kadın karakter 3 (Pop dansı)
  └── C4.fbx          # Kadın karakter 4 (Jazz dansı)
```

**Kod:**
```typescript
// Karakter 1
updateCharacter('char1', {
  name: 'Dancer 1',
  gender: 'female',
  avatar_data: {
    modelUrl: '/models/C1.fbx',
    color: '#ff6b35'
  }
})

// Karakter 2
updateCharacter('char2', {
  name: 'Dancer 2',
  gender: 'female',
  avatar_data: {
    modelUrl: '/models/C2.fbx',
    color: '#4ecdc4'
  }
})

// Karakter 3
updateCharacter('char3', {
  name: 'Dancer 3',
  gender: 'female',
  avatar_data: {
    modelUrl: '/models/C3.fbx',
    color: '#45b7d1'
  }
})

// Karakter 4
updateCharacter('char4', {
  name: 'Dancer 4',
  gender: 'female',
  avatar_data: {
    modelUrl: '/models/C4.fbx',
    color: '#f9ca24'
  }
})
```

## ⚠️ Önemli Notlar

1. **Dosya İsimleri:** Büyük/küçük harf duyarlı olabilir
2. **Uzantı:** `.fbx` uzantısını unutmayın
3. **Klasör:** Dosyalar `public/models/` içinde olmalı
4. **Model URL:** Her karakter için farklı `modelUrl` belirleyin

## 🔄 Otomatik Model Seçimi

Eğer `modelUrl` belirtmezseniz, sistem şu sırayla arar:

1. `character.avatar_data.modelUrl` (özel URL)
2. `character-male.fbx` (erkek karakter için)
3. `character-female.fbx` (kadın karakter için)
4. `character.fbx` (varsayılan)

## 💡 İpucu

Farklı karakterler için farklı renkler kullanarak görsel çeşitlilik sağlayın:

```typescript
const colors = ['#ff6b35', '#4ecdc4', '#45b7d1', '#f9ca24', '#ee5a6f']
characters.forEach((char, index) => {
  updateCharacter(char.id, {
    avatar_data: {
      ...char.avatar_data,
      color: colors[index % colors.length]
    }
  })
})
```
