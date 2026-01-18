# Ready Player Me Entegrasyonu

Bu proje, gerçekçi 3D karakterler için Ready Player Me API'sini kullanıyor.

## Kurulum

### 1. Ready Player Me Hesabı Oluşturma

1. https://readyplayer.me/developers adresine gidin
2. Ücretsiz hesap oluşturun
3. Dashboard'dan bir subdomain oluşturun (örn: `cali-sound`)
4. API key'inizi alın (isteğe bağlı, avatar oluşturma için)

### 2. Environment Variables

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_READY_PLAYER_ME_SUBDOMAIN=cali-sound
NEXT_PUBLIC_READY_PLAYER_ME_API_KEY=your_api_key_here
```

### 3. Avatar Oluşturma

Ready Player Me ile avatar oluşturmanın iki yolu var:

#### Yöntem 1: Avatar Generator URL (Önerilen)

Kullanıcılar kendi avatarlarını oluşturabilir:

```typescript
import { getAvatarGeneratorUrl } from '@/lib/ready-player-me'

const generatorUrl = getAvatarGeneratorUrl(userId)
// Kullanıcıyı bu URL'ye yönlendirin
// Avatar oluşturulduktan sonra callback URL'den avatar ID'yi alın
```

#### Yöntem 2: API ile Avatar Oluşturma

```typescript
import { createAvatar } from '@/lib/ready-player-me'

const { avatarId, avatarUrl } = await createAvatar(userId, {
  gender: 'male',
  bodyType: 'fullbody',
  quality: 'high',
})
```

### 4. Karakter Store'da Avatar ID Saklama

Avatar oluşturulduktan sonra, avatar ID'yi karakter verisinde saklayın:

```typescript
updateCharacter(characterId, {
  avatar_data: {
    ...character.avatar_data,
    readyPlayerMeId: avatarId
  }
})
```

## Kullanım

Karakterler otomatik olarak Ready Player Me avatarlarını kullanacak. Eğer bir karakter için avatar ID yoksa, karakter ID'si kullanılır (avatar önceden oluşturulmuş olmalı).

## Özellikler

- ✅ Gerçekçi 3D karakterler
- ✅ Hazır animasyonlar (dans, yürüme, vb.)
- ✅ Cinsiyet seçimi (male/female)
- ✅ Fullbody ve halfbody desteği
- ✅ Yüksek kalite modeller
- ✅ Ücretsiz plan

## Daha Fazla Bilgi

- [Ready Player Me Dokümantasyonu](https://docs.readyplayer.me/ready-player-me)
- [API Referansı](https://docs.readyplayer.me/api-reference)
- [Avatar Generator](https://readyplayer.me/avatar)
