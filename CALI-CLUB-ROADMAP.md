# 🎵 CALI Club - Yol Haritası

## 🎯 Proje Özeti

**CALI Club**: Interaktif, real-time, 3D/2D konser deneyimi
- Kullanıcılar karakter oluşturup konser alanına katılır
- Şarkılar çalınır, karakterlerin üstünde şarkı adları görünür
- Online chat ile iletişim kurulur
- Real-time senkronizasyon (herkes aynı konseri görür)

---

## 📋 Özellikler Listesi

### 1. Konser Alanı (Concert Venue)
- [ ] 3D/2D sahne tasarımı
- [ ] DJ seti ve ekipmanlar
- [ ] Kamera kontrolleri (zoom, rotate, pan)
- [ ] Lighting effects (müzikle senkronize)

### 2. Karakter Sistemi (Character System)
- [ ] Karakter oluşturma formu (isim, cinsiyet seçimi)
- [ ] Random karakter generator (avatar, renk, stil)
- [ ] Karakter spawn sistemi (konser alanına yerleştirme)
- [ ] Karakter animasyonları (dans, hareket)
- [ ] Karakter isimleri (üstte görünür)

### 3. Müzik Sistemi (Music System)
- [ ] Şarkı listesi (sol sidebar)
- [ ] Şarkı çalma/duraklatma
- [ ] Şarkı adı karakterlerin üstünde görünür
- [ ] Şarkı senkronizasyonu (tüm kullanıcılar aynı şarkıyı duyar)

### 4. Chat Sistemi (Chat System)
- [ ] Real-time chat paneli
- [ ] Kullanıcı mesajları
- [ ] Emoji desteği
- [ ] Mesaj geçmişi

### 5. Real-time Senkronizasyon
- [ ] WebSocket/Supabase Realtime bağlantısı
- [ ] Karakter pozisyonları senkronize
- [ ] Şarkı durumu senkronize
- [ ] Chat mesajları senkronize

---

## 🏗️ Teknik Mimari

### Frontend Teknolojileri

#### Seçenek 1: 3D (Önerilen - Daha Etkileyici)
```
- React Three Fiber (3D rendering)
- Three.js (3D graphics)
- @react-three/drei (helpers)
- Zustand/Jotai (state management)
- Socket.io Client (real-time)
```

#### Seçenek 2: 2D (Daha Basit, Daha Hızlı)
```
- HTML5 Canvas
- Konva.js veya Fabric.js (2D graphics)
- Zustand/Jotai (state management)
- Socket.io Client (real-time)
```

### Backend Teknolojileri

#### Seçenek 1: Supabase Realtime (Önerilen)
```
- Supabase Realtime (WebSocket)
- Supabase Database (karakterler, mesajlar)
- Supabase Storage (avatar images)
```

#### Seçenek 2: Socket.io Server
```
- Node.js + Express
- Socket.io Server
- Redis (optional - scaling için)
```

### Audio System
```
- Apple Music API (MusicKit JS - Öncelikli)
- @apple/musickit-js (resmi Apple framework)
- JWT token authentication
- Search API (şarkı arama)
- Fallback: YouTube IFrame API (Apple Music yoksa)
```

---

## 📐 Sayfa Yapısı

```
/cali-club
├── Concert Area (Ortada - Ana Alan)
│   ├── Stage (Sahne)
│   ├── DJ Booth (DJ Seti)
│   ├── Characters (Spawn edilen karakterler)
│   └── Lighting Effects
│
├── Left Sidebar (Sol)
│   ├── Song List (Şarkı Listesi)
│   │   ├── Play/Pause Controls
│   │   └── Current Song Info
│   └── Character Creator (Karakter Oluşturma)
│       ├── Name Input
│       ├── Gender Select (Kadın/Erkek)
│       └── Random Button
│
└── Right Sidebar (Sağ)
    └── Chat Panel
        ├── Messages List
        ├── Message Input
        └── Online Users Count
```

---

## 🗺️ Geliştirme Aşamaları

### Faz 1: Temel Yapı (1-2 gün)
- [ ] Sayfa oluşturma (`/cali-club`)
- [ ] Layout tasarımı (3 kolon: sidebar, main, chat)
- [ ] Temel state management
- [ ] Routing

### Faz 2: Karakter Sistemi (2-3 gün)
- [ ] Karakter oluşturma formu
- [ ] Random karakter generator
- [ ] Karakter render (2D veya 3D)
- [ ] Karakter spawn mekanizması
- [ ] İsim gösterimi

### Faz 3: Konser Alanı (2-3 gün)
- [ ] Sahne tasarımı
- [ ] DJ seti ve ekipmanlar
- [ ] Kamera kontrolleri
- [ ] Lighting effects

### Faz 4: Müzik Sistemi (2-3 gün)
- [ ] Apple Music entegrasyonu (MusicKit JS)
- [ ] JWT token generator (developer token)
- [ ] MusicKit initialization
- [ ] Şarkı arama API (admin panel)
- [ ] Şarkı listesi (Supabase'den çek)
- [ ] Apple Music player component
- [ ] Şarkı adı gösterimi (karakterlerin üstünde)
- [ ] Play/Pause/Seek kontrolleri
- [ ] Real-time şarkı senkronizasyonu

### Faz 5: Chat Sistemi (1-2 gün)
- [ ] Chat UI tasarımı
- [ ] Mesaj gönderme/alma
- [ ] Real-time senkronizasyon
- [ ] Kullanıcı adı gösterimi

### Faz 6: Real-time Senkronizasyon (2-3 gün)
- [ ] WebSocket/Realtime bağlantısı
- [ ] Karakter pozisyonları senkronize
- [ ] Şarkı durumu senkronize
- [ ] Chat mesajları senkronize
- [ ] Online kullanıcı sayısı

### Faz 7: Polish & Optimizasyon (1-2 gün)
- [ ] Animasyonlar
- [ ] Performance optimizasyonu
- [ ] Mobile responsive
- [ ] Error handling
- [ ] Loading states

---

## 🎨 Tasarım Önerileri

### Renk Paleti
- Ana renk: Turuncu/Amber (mevcut tema ile uyumlu)
- Sahne: Koyu tonlar (siyah, gri)
- Karakterler: Canlı renkler (çeşitli)
- Chat: Açık/koyu tema desteği

### Karakter Tasarımı
- Basit, stilize karakterler (2D sprite veya 3D low-poly)
- Farklı renkler ve stiller
- Dans animasyonları
- İsim tag'leri (üstte)

### Sahne Tasarımı
- Modern DJ seti
- LED ışıklar
- Dans pisti
- Kamera açıları (bird's eye, side view)

---

## 🗄️ Database Schema

### Supabase Tables

```sql
-- Karakterler
CREATE TABLE cali_club_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Session ID veya user identifier
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  avatar_data JSONB, -- Renk, stil, vb.
  position JSONB, -- {x, y, z} pozisyon
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Mesajları
CREATE TABLE cali_club_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Konser Durumu
CREATE TABLE cali_club_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_song_id TEXT,
  is_playing BOOLEAN DEFAULT false,
  position FLOAT DEFAULT 0, -- Şarkı pozisyonu (saniye)
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Teknik Detaylar

### Real-time Senkronizasyon Stratejisi

#### Supabase Realtime (Önerilen)
```typescript
// Characters subscription
supabase
  .channel('cali-club-characters')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'cali_club_characters'
  }, (payload) => {
    // Update characters
  })
  .subscribe()

// Chat subscription
supabase
  .channel('cali-club-chat')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'cali_club_messages'
  }, (payload) => {
    // Add new message
  })
  .subscribe()
```

### Karakter Render Stratejisi

#### 2D (Daha Basit)
```typescript
// Konva.js ile
<Circle
  x={character.position.x}
  y={character.position.y}
  radius={20}
  fill={character.color}
/>
<Text
  x={character.position.x}
  y={character.position.y - 30}
  text={character.name}
/>
```

#### 3D (Daha Etkileyici)
```typescript
// React Three Fiber ile
<mesh position={[character.position.x, 0, character.position.z]}>
  <boxGeometry args={[1, 2, 1]} />
  <meshStandardMaterial color={character.color} />
</mesh>
```

---

## 📦 Gerekli Paketler

### 3D Versiyonu için:
```json
{
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.88.0",
  "three": "^0.158.0",
  "zustand": "^4.4.7",
  "howler": "^2.2.4"
}
```

### 2D Versiyonu için:
```json
{
  "konva": "^9.2.0",
  "react-konva": "^18.2.10",
  "zustand": "^4.4.7",
  "howler": "^2.2.4"
}
```

---

## 🚀 Başlangıç Adımları

### 1. Karar Verme
- [ ] 2D mi 3D mi? (Öneri: 2D ile başla, sonra 3D'ye geç)
- [ ] Supabase Realtime mi Socket.io mu? (Öneri: Supabase Realtime)

### 2. Temel Setup
- [ ] Sayfa oluştur (`/app/cali-club/page.tsx`)
- [ ] Layout tasarla
- [ ] State management kur (Zustand)

### 3. İlk Prototip
- [ ] Basit karakter render
- [ ] Karakter oluşturma formu
- [ ] Basit sahne

---

## ❓ Sorular ve Kararlar

### 1. 2D mi 3D mi?
- **2D**: Daha basit, daha hızlı geliştirme, daha iyi performance
- **3D**: Daha etkileyici, daha modern, daha karmaşık

**Öneri**: 2D ile başla, sonra 3D'ye upgrade et

### 2. Real-time: Supabase mi Socket.io mu?
- **Supabase Realtime**: Zaten kullanıyorsunuz, kolay entegrasyon
- **Socket.io**: Daha fazla kontrol, custom server gerekir

**Öneri**: Supabase Realtime (zaten var)

### 3. Audio: Apple Music mi YouTube mu?
- **Apple Music**: Resmi API, yüksek kalite, search API, tam kontrol
- **YouTube**: Kolay, mevcut şarkılar, fallback olarak

**Öneri**: Apple Music ile başla (MusicKit JS - resmi çözüm)

---

## 📝 Sonraki Adım

Hangi yaklaşımı tercih edersiniz?

1. **2D + Supabase Realtime** (Önerilen - Hızlı başlangıç)
2. **3D + Supabase Realtime** (Daha etkileyici, daha karmaşık)
3. **2D + Socket.io** (Daha fazla kontrol)

Karar verdiğinizde, ilk fazdan başlayalım! 🚀
