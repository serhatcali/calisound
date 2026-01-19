import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET - Fetch all songs (excluding Topic channels)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cali_club_songs')
      .select('id, title, artist, album, apple_music_id, apple_music_url, preview_url, artwork_url, duration, genre, created_at') // Don't select all fields
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching songs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch songs' },
        { status: 500 }
      )
    }

    // Filter out ONLY "Topic" channels - accept everything else
    const filteredSongs = (data || []).filter((song: any) => {
      const artist = (song.artist || '').toLowerCase().trim()
      // Only exclude if it explicitly contains "topic" or "- topic"
      const hasTopic = artist.includes('topic') && (artist.includes('- topic') || artist.endsWith('topic'))
      
      if (hasTopic) {
        console.log(`[GET] Filtering out Topic channel song: ${song.artist} - ${song.title}`)
        return false
      }
      
      // Accept everything else
      return true
    })

    console.log(`[GET] Returning ${filteredSongs.length} songs (filtered from ${data?.length || 0} total)`)
    return NextResponse.json({ songs: filteredSongs })
  } catch (error: any) {
    console.error('Error in GET /api/cali-club/songs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    )
  }
}

import { getClientIP, rateLimit, validateObject, sanitizeInput, validateString, validateNumber } from '@/lib/security'

// POST - Add a new song (reject Topic channels)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-songs:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 10, // 10 songs per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = validateObject(body, {
      title: { type: 'string', required: true, minLength: 1, maxLength: 200 },
      artist: { type: 'string', required: true, minLength: 1, maxLength: 200 },
      apple_music_id: { type: 'string', required: true, minLength: 1, maxLength: 100 },
      album: { type: 'string', required: false, maxLength: 200 },
      apple_music_url: { type: 'url', required: false },
      preview_url: { type: 'url', required: false },
      artwork_url: { type: 'url', required: false },
      duration: { type: 'number', required: false, min: 0, max: 86400 },
      genre: { type: 'string', required: false, maxLength: 100 },
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { title, artist, album, apple_music_id, apple_music_url, preview_url, artwork_url, duration, genre } = validation.value!

    // Note: We no longer reject Topic channels here
    // They are filtered out in GET endpoint instead
    // This allows fallback songs to be saved

    // Sanitize inputs
    const sanitizedData = {
      title: sanitizeInput(title),
      artist: sanitizeInput(artist),
      album: album ? sanitizeInput(album) : null,
      apple_music_id: sanitizeInput(apple_music_id),
      apple_music_url: apple_music_url ? sanitizeInput(apple_music_url) : null,
      preview_url: preview_url ? sanitizeInput(preview_url) : null,
      artwork_url: artwork_url ? sanitizeInput(artwork_url) : null,
      duration: duration || null,
      genre: genre ? sanitizeInput(genre) : null,
    }

    // Use upsert to handle duplicates gracefully
    const { data, error } = await supabaseAdmin
      .from('cali_club_songs')
      .upsert(sanitizedData, {
        onConflict: 'apple_music_id',
        ignoreDuplicates: false, // Update if exists
      })
      .select('id, title, artist, album, apple_music_id, apple_music_url, preview_url, artwork_url, duration, genre, created_at') // Don't select all
      .single()

    if (error) {
      // Check if it's a duplicate key error (check error code, not message)
      if (error.code === '23505' || error.code === 'P2002') {
        // Try to get the existing song
        const { data: existingSong } = await supabaseAdmin
          .from('cali_club_songs')
          .select('id, title, artist, album, apple_music_id, apple_music_url, preview_url, artwork_url, duration, genre, created_at')
          .eq('apple_music_id', apple_music_id)
          .single()
        
        if (existingSong) {
          return NextResponse.json({ song: existingSong, duplicate: true })
        }
      }
      
      console.error('Error creating/updating song:', error)
      return NextResponse.json(
        { error: 'Failed to create/update song' },
        { status: 500 }
      )
    }

    return NextResponse.json({ song: data })
  } catch (error: any) {
    console.error('Error in POST /api/cali-club/songs:', error)
    return NextResponse.json(
      { error: 'Failed to create/update song' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a song
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-songs-delete:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 10, // 10 deletions per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Validate ID
    const idValidation = validateString(id, {
      required: true,
      pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    })

    if (!idValidation.valid) {
      return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('cali_club_songs')
      .delete()
      .eq('id', idValidation.value!)

    if (error) {
      console.error('Error deleting song:', error)
      return NextResponse.json(
        { error: 'Failed to delete song' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/cali-club/songs:', error)
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    )
  }
}

// PUT - Clean up Topic channel songs
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`cali-club-songs-cleanup:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 5, // 5 cleanups per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Validate action
    if (action !== 'cleanup-topic') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'cleanup-topic') {
      // Delete all songs from Topic channels
      const { data: allSongs, error: fetchError } = await supabaseAdmin
        .from('cali_club_songs')
        .select('id, artist')

      if (fetchError) {
        console.error('Error fetching songs:', fetchError)
        return NextResponse.json(
          { error: 'Failed to fetch songs' },
          { status: 500 }
        )
      }

      const topicSongIds = (allSongs || [])
        .filter((song: any) => {
          const artist = (song.artist || '').toLowerCase()
          return artist.includes('topic') || artist.includes('- topic')
        })
        .map((song: any) => song.id)

      if (topicSongIds.length === 0) {
        return NextResponse.json({ message: 'No Topic channel songs found', deleted: 0 })
      }

      const { error: deleteError } = await supabaseAdmin
        .from('cali_club_songs')
        .delete()
        .in('id', topicSongIds)

      if (deleteError) {
        console.error('Error deleting songs:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete songs' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        message: `Deleted ${topicSongIds.length} Topic channel songs`,
        deleted: topicSongIds.length
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in PUT /api/cali-club/songs:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
