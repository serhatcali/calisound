# 🎵 Apple Music Entegrasyonu - CALI Club

## 📋 Apple Music API Seçenekleri

### Seçenek 1: Apple Music Web Player (Önerilen - En Kolay)
Apple Music'in web player'ını iframe olarak embed edebiliriz.

**Avantajlar:**
- ✅ Resmi Apple Music player
- ✅ Yüksek kalite ses (Lossless)
- ✅ Kolay entegrasyon
- ✅ Playlist desteği

**Dezavantajlar:**
- ❌ Apple Music hesabı gerekir (kullanıcıların)
- ❌ API kontrolü sınırlı

---

### Seçenek 2: Apple Music API (MusicKit JS) ⭐ ÖNERİLEN
Apple'ın resmi MusicKit JavaScript framework'ü.

**Avantajlar:**
- ✅ Resmi Apple API
- ✅ Tam kontrol (play, pause, seek, volume)
- ✅ Search, playlist, library erişimi
- ✅ Web ve iOS desteği
- ✅ Ücretsiz (Apple Developer hesabı gerekir)

**Dezavantajlar:**
- ❌ Apple Developer hesabı gerekir
- ❌ MusicKit JS kurulumu gerekir
- ❌ OAuth flow (kullanıcılar için)

**Dokümantasyon:**
- https://developer.apple.com/documentation/musickitjs

---

### Seçenek 3: Apple Music API (REST API)
Apple Music REST API ile direkt entegrasyon.

**Avantajlar:**
- ✅ Tam kontrol
- ✅ Search, catalog erişimi
- ✅ Server-side entegrasyon

**Dezavantajlar:**
- ❌ JWT token yönetimi gerekir
- ❌ Daha karmaşık
- ❌ User token gerekir (playback için)

---

## 🎯 Önerilen Yaklaşım: MusicKit JS

### Neden MusicKit JS?

1. **Resmi Apple çözümü**
2. **Tam kontrol** (play, pause, seek, volume)
3. **Search API** (şarkı arama)
4. **Playlist desteği**
5. **Web ve iOS uyumlu**

---

## 🔧 Teknik Implementasyon

### 1. Apple Developer Setup

1. **Apple Developer hesabı oluşturun**
   - https://developer.apple.com/
   - Ücretsiz hesap yeterli (MusicKit için)

2. **MusicKit Identifier oluşturun**
   - Developer portal'da
   - Services > MusicKit
   - Identifier: `com.calisound.musickit`

3. **Team ID ve Key ID alın**
   - Developer portal'dan

---

### 2. MusicKit JS Kurulumu

```bash
npm install @apple/musickit-js
```

veya CDN:
```html
<script src="https://js-cdn.music.apple.com/musickit/v1/musickit.js"></script>
```

---

### 3. Environment Variables

`.env.local` dosyasına ekleyin:

```env
# Apple Music
NEXT_PUBLIC_APPLE_MUSIC_TEAM_ID=your_team_id
NEXT_PUBLIC_APPLE_MUSIC_KEY_ID=your_key_id
NEXT_PUBLIC_APPLE_MUSIC_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_APPLE_MUSIC_STORE_FRONT=us # veya tr, uk, vb.
```

---

### 4. JWT Token Oluşturma

```typescript
// lib/apple-music/jwt.ts
import jwt from 'jsonwebtoken'

export function generateAppleMusicToken() {
  const teamId = process.env.NEXT_PUBLIC_APPLE_MUSIC_TEAM_ID
  const keyId = process.env.NEXT_PUBLIC_APPLE_MUSIC_KEY_ID
  const privateKey = process.env.NEXT_PUBLIC_APPLE_MUSIC_PRIVATE_KEY

  if (!teamId || !keyId || !privateKey) {
    throw new Error('Apple Music credentials missing')
  }

  const token = jwt.sign(
    {},
    privateKey,
    {
      algorithm: 'ES256',
      expiresIn: '180d',
      issuer: teamId,
      header: {
        alg: 'ES256',
        kid: keyId,
      },
    }
  )

  return token
}
```

---

### 5. MusicKit JS Initialization

```typescript
// lib/apple-music/musickit.ts
import MusicKit from '@apple/musickit-js'

export async function initializeMusicKit() {
  if (typeof window === 'undefined') return null

  try {
    await MusicKit.configure({
      developerToken: await getDeveloperToken(), // JWT token
      app: {
        name: 'CALI Club',
        build: '1.0.0',
      },
    })

    const musicKit = MusicKit.getInstance()
    return musicKit
  } catch (error) {
    console.error('MusicKit initialization error:', error)
    return null
  }
}

async function getDeveloperToken() {
  // API route'dan token al
  const response = await fetch('/api/apple-music/token')
  const data = await response.json()
  return data.token
}
```

---

### 6. React Component - Apple Music Player

```typescript
// components/cali-club/AppleMusicPlayer.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { initializeMusicKit } from '@/lib/apple-music/musickit'

interface AppleMusicPlayerProps {
  songId: string
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  onTimeUpdate?: (currentTime: number) => void
}

export function AppleMusicPlayer({
  songId,
  onPlay,
  onPause,
  onEnd,
  onTimeUpdate,
}: AppleMusicPlayerProps) {
  const [musicKit, setMusicKit] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    initializeMusicKit().then(mk => {
      if (mk) {
        setMusicKit(mk)
        
        // Event listeners
        mk.addEventListener('playbackStateDidChange', handlePlaybackStateChange)
        mk.addEventListener('playbackTimeDidChange', handleTimeUpdate)
        mk.addEventListener('playbackDurationDidChange', handleDurationChange)
      }
    })

    return () => {
      if (musicKit) {
        musicKit.removeEventListener('playbackStateDidChange', handlePlaybackStateChange)
        musicKit.removeEventListener('playbackTimeDidChange', handleTimeUpdate)
        musicKit.removeEventListener('playbackDurationDidChange', handleDurationChange)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (musicKit && songId) {
      playSong(songId)
    }
  }, [musicKit, songId])

  const handlePlaybackStateChange = (event: any) => {
    const state = event.state
    if (state === MusicKit.PlaybackStates.playing) {
      setIsPlaying(true)
      onPlay?.()
    } else if (state === MusicKit.PlaybackStates.paused) {
      setIsPlaying(false)
      onPause?.()
    } else if (state === MusicKit.PlaybackStates.ended) {
      setIsPlaying(false)
      onEnd?.()
    }
  }

  const handleTimeUpdate = (event: any) => {
    const time = event.currentPlaybackTime
    setCurrentTime(time)
    onTimeUpdate?.(time)
  }

  const handleDurationChange = (event: any) => {
    // Duration updated
  }

  const playSong = async (id: string) => {
    if (!musicKit) return

    try {
      await musicKit.setQueue({
        song: id,
      })
      await musicKit.play()
    } catch (error) {
      console.error('Error playing song:', error)
    }
  }

  const togglePlayPause = () => {
    if (!musicKit) return

    if (isPlaying) {
      musicKit.pause()
    } else {
      musicKit.play()
    }
  }

  return (
    <div className="w-full">
      {/* Player Controls */}
      <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={togglePlayPause}
          className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {Math.floor(currentTime / 60)}:
            {Math.floor(currentTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* User Authorization (if needed) */}
      {musicKit && !musicKit.isAuthorized && (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            Apple Music'e giriş yapmanız gerekiyor.
          </p>
          <button
            onClick={() => musicKit.authorize()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apple Music'e Giriş Yap
          </button>
        </div>
      )}
    </div>
  )
}
```

---

### 7. Search API - Şarkı Arama

```typescript
// lib/apple-music/search.ts
import { initializeMusicKit } from './musickit'

export async function searchAppleMusic(query: string) {
  const musicKit = await initializeMusicKit()
  if (!musicKit) return []

  try {
    const results = await musicKit.api.search(query, {
      types: ['songs'],
      limit: 20,
    })

    return results.songs?.data || []
  } catch (error) {
    console.error('Apple Music search error:', error)
    return []
  }
}
```

---

### 8. API Route - Developer Token

```typescript
// app/api/apple-music/token/route.ts
import { NextResponse } from 'next/server'
import { generateAppleMusicToken } from '@/lib/apple-music/jwt'

export async function GET() {
  try {
    const token = generateAppleMusicToken()
    return NextResponse.json({ token })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate token' },
      { status: 500 }
    )
  }
}
```

---

## 🗄️ Database Schema

### Şarkılar Tablosu (Apple Music için)

```sql
-- CALI Club şarkıları (Apple Music)
CREATE TABLE cali_club_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  apple_music_id TEXT NOT NULL, -- Apple Music song ID
  apple_music_url TEXT, -- Apple Music URL
  preview_url TEXT, -- 30 saniyelik preview
  artwork_url TEXT, -- Album artwork
  duration INTEGER, -- Saniye cinsinden
  genre TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Konser durumu (real-time için)
CREATE TABLE cali_club_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_song_id UUID REFERENCES cali_club_songs(id),
  is_playing BOOLEAN DEFAULT false,
  position FLOAT DEFAULT 0, -- Şarkı pozisyonu (saniye)
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📝 Admin Panel - Şarkı Ekleme

```typescript
// components/admin/cali-club/SongForm.tsx
'use client'

import { useState } from 'react'
import { searchAppleMusic } from '@/lib/apple-music/search'

export function SongForm() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const songs = await searchAppleMusic(searchQuery)
    setResults(songs)
    setLoading(false)
  }

  const addSong = async (song: any) => {
    await fetch('/api/admin/cali-club/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: song.attributes.name,
        artist: song.attributes.artistName,
        album: song.attributes.albumName,
        apple_music_id: song.id,
        apple_music_url: song.attributes.url,
        preview_url: song.attributes.previews?.[0]?.url,
        artwork_url: song.attributes.artwork?.url,
        duration: Math.floor(song.attributes.durationInMillis / 1000),
      }),
    })
    alert('Şarkı eklendi!')
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Şarkı Ekle</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Şarkı ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          {loading ? 'Aranıyor...' : 'Ara'}
        </button>
      </div>

      <div className="space-y-2">
        {results.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-4 p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <img
              src={song.attributes.artwork?.url?.replace('{w}', '100').replace('{h}', '100')}
              alt={song.attributes.albumName}
              className="w-16 h-16 rounded"
            />
            <div className="flex-1">
              <p className="font-semibold">{song.attributes.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {song.attributes.artistName} • {song.attributes.albumName}
              </p>
            </div>
            <button
              onClick={() => addSong(song)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ekle
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔄 Real-time Şarkı Senkronizasyonu

```typescript
// lib/cali-club/audio-sync.ts
import { supabase } from '@/lib/supabase'

export function subscribeToCurrentSong(
  onSongChange: (song: Song | null) => void,
  onPlayStateChange: (isPlaying: boolean) => void
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
        onPlayStateChange(state.is_playing)
        
        if (state.current_song_id) {
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

export async function updateCurrentSong(songId: string | null, isPlaying: boolean) {
  await supabase
    .from('cali_club_state')
    .update({
      current_song_id: songId,
      is_playing: isPlaying,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'main')
}
```

---

## 📦 Gerekli Paketler

```json
{
  "@apple/musickit-js": "^3.0.0",
  "jsonwebtoken": "^9.0.3", // Zaten var
  "@types/jsonwebtoken": "^9.0.2"
}
```

---

## ⚠️ Önemli Notlar

### Apple Music Hesap Gereksinimleri

1. **Developer için:**
   - Apple Developer hesabı (ücretsiz yeterli)
   - MusicKit identifier
   - JWT token (private key)

2. **Kullanıcılar için:**
   - Apple Music hesabı gerekebilir (tam playback için)
   - Veya preview (30 saniye) ücretsiz

### Apple Music Storefront

- Farklı ülkeler için farklı storefront'lar
- `us`, `tr`, `uk`, `de`, vb.
- Environment variable'da ayarlanır

---

## 🚀 Kurulum Adımları

1. **Apple Developer hesabı oluştur**
2. **MusicKit identifier oluştur**
3. **Private key oluştur ve indir**
4. **Environment variables ekle**
5. **Paketleri yükle**: `npm install @apple/musickit-js`
6. **JWT token generator oluştur**
7. **MusicKit initialize et**
8. **Test et!**

---

## ✅ Avantajlar

- ✅ Resmi Apple API
- ✅ Yüksek kalite ses
- ✅ Search API (şarkı arama)
- ✅ Playlist desteği
- ✅ Web ve iOS uyumlu
- ✅ Tam kontrol (play, pause, seek)

---

**Durum**: Apple Music entegrasyonu planlandı! 🎵
