# 🎵 Tidal Entegrasyonu - CALI Club

## 📋 Tidal API Seçenekleri

### Seçenek 1: Tidal Web Player Embed (Önerilen - En Kolay)
Tidal'ın resmi web player'ını iframe olarak embed edebiliriz.

**Avantajlar:**
- ✅ Resmi Tidal player
- ✅ Yüksek kalite ses
- ✅ Kolay entegrasyon
- ✅ Playlist desteği

**Dezavantajlar:**
- ❌ Tidal hesabı gerekir (kullanıcıların)
- ❌ API kontrolü sınırlı

**Kullanım:**
```html
<iframe 
  src="https://tidal.com/embed/track/{track_id}"
  width="100%" 
  height="100"
  frameborder="0"
/>
```

---

### Seçenek 2: Tidal API (Third-party)
Tidal'ın resmi public API'si yok, ancak bazı third-party servisler var:

**Servisler:**
1. **Tidal API (Unofficial)** - GitHub'da açık kaynak projeler
2. **Tidal-dl API** - Python tabanlı
3. **Tidal API Wrapper** - Node.js wrapper'lar

**Avantajlar:**
- ✅ Daha fazla kontrol
- ✅ Programatik erişim
- ✅ Playlist, search, vb.

**Dezavantajlar:**
- ❌ Resmi değil (risk)
- ❌ Rate limiting
- ❌ API key gerekebilir

---

### Seçenek 3: Tidal OAuth + Web API
Tidal OAuth ile kullanıcı hesaplarına erişim.

**Avantajlar:**
- ✅ Resmi Tidal API erişimi
- ✅ Kullanıcı playlist'leri
- ✅ Favoriler, vb.

**Dezavantajlar:**
- ❌ OAuth kurulumu gerekir
- ❌ Her kullanıcının Tidal hesabı olmalı
- ❌ Daha karmaşık

---

## 🎯 Önerilen Yaklaşım

### Hybrid Yaklaşım (En İyi)

1. **Admin Panel'den Tidal Track ID'leri ekle**
   - Admin, şarkıları Tidal'dan seçer
   - Track ID'leri database'e kaydedilir
   - Şarkı listesi oluşturulur

2. **Tidal Embed Player kullan**
   - Her şarkı için Tidal embed iframe
   - Play/Pause kontrolü
   - Progress tracking

3. **Fallback: YouTube**
   - Tidal yoksa YouTube kullan
   - Mevcut sistemle uyumlu

---

## 🗄️ Database Schema Güncellemesi

### Şarkılar Tablosu

```sql
-- CALI Club şarkıları
CREATE TABLE cali_club_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  tidal_track_id TEXT, -- Tidal track ID
  tidal_embed_url TEXT, -- Tidal embed URL
  youtube_url TEXT, -- Fallback için
  duration INTEGER, -- Saniye cinsinden
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Teknik Implementasyon

### Tidal Track ID Nasıl Alınır?

1. **Tidal Web'de şarkıyı aç**
2. **URL'den track ID'yi al**
   ```
   https://tidal.com/browse/track/12345678
   → Track ID: 12345678
   ```

3. **Embed URL oluştur**
   ```
   https://tidal.com/embed/track/12345678
   ```

### React Component Örneği

```typescript
// components/cali-club/TidalPlayer.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

interface TidalPlayerProps {
  trackId: string
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
}

export function TidalPlayer({ trackId, onPlay, onPause, onEnd }: TidalPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const embedUrl = `https://tidal.com/embed/track/${trackId}?autoplay=false`

  // Tidal iframe API ile kontrol (eğer destekleniyorsa)
  useEffect(() => {
    // Tidal iframe message API
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://tidal.com') return
      
      if (event.data.type === 'play') {
        setIsPlaying(true)
        onPlay?.()
      } else if (event.data.type === 'pause') {
        setIsPlaying(false)
        onPause?.()
      } else if (event.data.type === 'ended') {
        setIsPlaying(false)
        onEnd?.()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onPlay, onPause, onEnd])

  return (
    <div className="w-full h-20">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width="100%"
        height="100"
        frameBorder="0"
        allow="autoplay"
        className="rounded-lg"
      />
    </div>
  )
}
```

---

## 📝 Admin Panel Entegrasyonu

### Şarkı Ekleme Formu

```typescript
// components/admin/cali-club/SongForm.tsx
'use client'

export function SongForm() {
  const [tidalUrl, setTidalUrl] = useState('')
  const [trackId, setTrackId] = useState('')

  const extractTrackId = (url: string) => {
    // https://tidal.com/browse/track/12345678
    const match = url.match(/\/track\/(\d+)/)
    return match ? match[1] : null
  }

  const handleSubmit = async () => {
    const id = extractTrackId(tidalUrl)
    if (!id) {
      alert('Geçersiz Tidal URL')
      return
    }

    // API'ye gönder
    await fetch('/api/admin/cali-club/songs', {
      method: 'POST',
      body: JSON.stringify({
        tidal_track_id: id,
        tidal_embed_url: `https://tidal.com/embed/track/${id}`,
      }),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Tidal URL: https://tidal.com/browse/track/..."
        value={tidalUrl}
        onChange={(e) => setTidalUrl(e.target.value)}
      />
      <button type="submit">Şarkı Ekle</button>
    </form>
  )
}
```

---

## 🎵 Şarkı Listesi Component

```typescript
// components/cali-club/SongList.tsx
'use client'

import { useState, useEffect } from 'react'
import { TidalPlayer } from './TidalPlayer'

interface Song {
  id: string
  title: string
  artist: string
  tidal_track_id: string
  thumbnail_url?: string
}

export function SongList() {
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)

  useEffect(() => {
    // Şarkıları yükle
    fetch('/api/cali-club/songs')
      .then(res => res.json())
      .then(data => setSongs(data.songs))
  }, [])

  const playSong = (song: Song) => {
    setCurrentSong(song)
    // Real-time: Tüm kullanıcılara bildir
    // Supabase Realtime ile
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4">Şarkı Listesi</h3>
      
      {/* Current Song */}
      {currentSong && (
        <div className="mb-4">
          <TidalPlayer
            trackId={currentSong.tidal_track_id}
            onEnd={() => setCurrentSong(null)}
          />
          <p className="text-sm mt-2">
            {currentSong.artist} - {currentSong.title}
          </p>
        </div>
      )}

      {/* Song List */}
      <div className="flex-1 overflow-y-auto">
        {songs.map(song => (
          <div
            key={song.id}
            onClick={() => playSong(song)}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
          >
            <p className="font-semibold">{song.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {song.artist}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔄 Real-time Şarkı Senkronizasyonu

### Supabase Realtime ile

```typescript
// lib/cali-club/audio-sync.ts
import { supabase } from '@/lib/supabase'

export function subscribeToCurrentSong(
  onSongChange: (song: Song | null) => void
) {
  const channel = supabase
    .channel('cali-club-audio')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cali_club_state',
      },
      (payload) => {
        const state = payload.new as any
        if (state.current_song_id) {
          // Şarkıyı yükle
          fetch(`/api/cali-club/songs/${state.current_song_id}`)
            .then(res => res.json())
            .then(data => onSongChange(data.song))
        } else {
          onSongChange(null)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function updateCurrentSong(songId: string | null) {
  await supabase
    .from('cali_club_state')
    .update({
      current_song_id: songId,
      is_playing: songId !== null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'main') // Tek bir state kaydı
}
```

---

## ⚠️ Önemli Notlar

### Tidal Hesap Gereksinimleri

1. **Kullanıcılar için:**
   - Tidal hesabı gerekebilir (premium özellikler için)
   - Veya sadece embed player (hesap gerekmeyebilir)

2. **Admin için:**
   - Tidal hesabı gerekir (şarkı eklemek için)
   - Track ID'leri manuel olarak eklenebilir

### Alternatif: Tidal API Key

Eğer Tidal API key alabilirseniz:
- Daha fazla kontrol
- Search, playlist, vb.
- Programatik erişim

---

## 🚀 Sonraki Adımlar

1. **Tidal Embed test et**
   - Bir Tidal track URL'i al
   - Embed iframe'i test et
   - Çalışıyor mu kontrol et

2. **Database schema oluştur**
   - `cali_club_songs` tablosu
   - `cali_club_state` tablosu

3. **Admin panel'e şarkı ekleme formu**
   - Tidal URL input
   - Track ID extraction
   - Database'e kaydetme

4. **CALI Club sayfasına entegre et**
   - SongList component
   - TidalPlayer component
   - Real-time senkronizasyon

---

**Durum**: Tidal entegrasyonu planlandı! 🎵
