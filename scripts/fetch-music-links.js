// Auto-fetch Spotify and Apple Music links for cities
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const jwt = require('jsonwebtoken')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const APPLE_MUSIC_TEAM_ID = process.env.APPLE_MUSIC_TEAM_ID
const APPLE_MUSIC_KEY_ID = process.env.APPLE_MUSIC_KEY_ID
const APPLE_MUSIC_PRIVATE_KEY = process.env.APPLE_MUSIC_PRIVATE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Get Spotify access token
async function getSpotifyToken() {
  return new Promise((resolve, reject) => {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      reject(new Error('Spotify credentials not found'))
      return
    }

    const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
    
    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.access_token) {
            resolve(json.access_token)
          } else {
            reject(new Error(json.error?.message || 'Failed to get token'))
          }
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.write('grant_type=client_credentials')
    req.end()
  })
}

// Search Spotify
async function searchSpotify(query, accessToken) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=playlist,album&limit=5`

    const options = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }

    https.get(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json)
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}

// Get Apple Music token (JWT)
function getAppleMusicToken() {
  if (!APPLE_MUSIC_TEAM_ID || !APPLE_MUSIC_KEY_ID || !APPLE_MUSIC_PRIVATE_KEY) {
    throw new Error('Apple Music credentials not found')
  }

  try {
    // Parse private key (handle newlines)
    const privateKey = APPLE_MUSIC_PRIVATE_KEY.replace(/\\n/g, '\n')

    const token = jwt.sign(
      {},
      privateKey,
      {
        algorithm: 'ES256',
        expiresIn: '180d',
        issuer: APPLE_MUSIC_TEAM_ID,
        header: {
          alg: 'ES256',
          kid: APPLE_MUSIC_KEY_ID
        }
      }
    )

    return token
  } catch (error) {
    console.error('Error generating Apple Music token:', error.message)
    throw error
  }
}

// Search Apple Music
async function searchAppleMusic(query, token) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://api.music.apple.com/v1/catalog/us/search?term=${encodedQuery}&types=albums,playlists&limit=5`

    const options = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }

    https.get(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            reject(new Error(`Apple Music API error: ${res.statusCode} - ${data}`))
            return
          }
          const json = JSON.parse(data)
          resolve(json)
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}

// Score search results to find the best match
function scoreResult(result, cityName) {
  const name = result.name.toLowerCase()
  const cityLower = cityName.toLowerCase()
  let score = 0

  // Check if city name is in the result name
  if (name.includes(cityLower)) score += 10
  if (name.includes('cali')) score += 5
  if (name.includes('afro house')) score += 5
  if (name.includes('afrobeat')) score += 3

  // Prefer playlists over albums
  if (result.type === 'playlist') score += 2

  return score
}

// Find best Spotify link for a city
async function findSpotifyLink(cityName, accessToken) {
  try {
    // Try different search queries
    const queries = [
      `CALI Sound ${cityName}`,
      `CALI ${cityName} Afro House`,
      `${cityName} CALI Sound`,
      `CALI ${cityName}`
    ]

    let bestResult = null
    let bestScore = 0

    for (const query of queries) {
      const results = await searchSpotify(query, accessToken)
      
      // Check playlists
      if (results.playlists?.items) {
        for (const item of results.playlists.items) {
          const score = scoreResult(item, cityName)
          if (score > bestScore) {
            bestScore = score
            bestResult = item
          }
        }
      }

      // Check albums
      if (results.albums?.items) {
        for (const item of results.albums.items) {
          const score = scoreResult(item, cityName)
          if (score > bestScore) {
            bestScore = score
            bestResult = item
          }
        }
      }

      // If we found a good match (score > 10), stop searching
      if (bestScore > 10) break
    }

    if (bestResult && bestScore > 5) {
      return bestResult.external_urls?.spotify || null
    }

    return null
  } catch (error) {
    console.error(`   ❌ Error searching Spotify for ${cityName}:`, error.message)
    return null
  }
}

// Find best Apple Music link for a city
async function findAppleMusicLink(cityName, token) {
  try {
    // Try different search queries
    const queries = [
      `CALI Sound ${cityName}`,
      `CALI ${cityName} Afro House`,
      `${cityName} CALI Sound`,
      `CALI ${cityName}`
    ]

    let bestResult = null
    let bestScore = 0

    for (const query of queries) {
      const results = await searchAppleMusic(query, token)
      
      // Check playlists
      if (results.results?.playlists?.data) {
        for (const item of results.results.playlists.data) {
          const score = scoreResult({ name: item.attributes.name, type: 'playlist' }, cityName)
          if (score > bestScore) {
            bestScore = score
            bestResult = item
          }
        }
      }

      // Check albums
      if (results.results?.albums?.data) {
        for (const item of results.results.albums.data) {
          const score = scoreResult({ name: item.attributes.name, type: 'album' }, cityName)
          if (score > bestScore) {
            bestScore = score
            bestResult = item
          }
        }
      }

      // If we found a good match (score > 10), stop searching
      if (bestScore > 10) break
    }

    if (bestResult && bestScore > 5) {
      // Apple Music URL format: https://music.apple.com/us/album/... or .../playlist/...
      const type = bestResult.type
      const id = bestResult.id
      const country = 'us' // Default to US, can be made configurable
      
      if (type === 'playlists') {
        return `https://music.apple.com/${country}/playlist/${id}`
      } else if (type === 'albums') {
        return `https://music.apple.com/${country}/album/${id}`
      }
    }

    return null
  } catch (error) {
    console.error(`   ❌ Error searching Apple Music for ${cityName}:`, error.message)
    return null
  }
}

// Main function
async function fetchMusicLinks() {
  console.log('🎵 Fetching Spotify and Apple Music links for cities...\n')

  // Get Spotify token
  let spotifyToken = null
  try {
    console.log('🔑 Getting Spotify access token...')
    spotifyToken = await getSpotifyToken()
    console.log('✅ Spotify token obtained')
  } catch (error) {
    console.error('❌ Failed to get Spotify token:', error.message)
    console.log('💡 Make sure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set in .env.local')
    console.log('⚠️  Continuing without Spotify...')
  }

  // Get Apple Music token
  let appleMusicToken = null
  try {
    console.log('🔑 Getting Apple Music token...')
    appleMusicToken = getAppleMusicToken()
    console.log('✅ Apple Music token obtained')
  } catch (error) {
    console.error('❌ Failed to get Apple Music token:', error.message)
    console.log('💡 Make sure APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and APPLE_MUSIC_PRIVATE_KEY are set in .env.local')
    console.log('⚠️  Continuing without Apple Music...')
  }

  // Check if we have at least one token
  if (!spotifyToken && !appleMusicToken) {
    console.error('\n❌ No API tokens available!')
    console.log('💡 Please set up at least Spotify or Apple Music credentials in .env.local')
    console.log('📖 See scripts/MUSIC-LINKS-SETUP.md for instructions\n')
    return
  }

  console.log('') // Empty line

  // Get all cities
  const { data: cities, error } = await supabase
    .from('cities')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ Error fetching cities:', error)
    return
  }

  if (!cities || cities.length === 0) {
    console.log('⚠️  No cities found')
    return
  }

  console.log(`📊 Found ${cities.length} cities\n`)

  let updated = 0
  let skipped = 0

  for (const city of cities) {
    console.log(`\n🏙️  Processing: ${city.name}`)

    const updates = {}

    // Fetch Spotify link if not already set
    if (!city.spotify && spotifyToken) {
      console.log('   🔍 Searching Spotify...')
      const spotifyLink = await findSpotifyLink(city.name, spotifyToken)
      if (spotifyLink) {
        updates.spotify = spotifyLink
        console.log(`   ✅ Found Spotify: ${spotifyLink}`)
      } else {
        console.log('   ⚠️  No Spotify link found')
      }
    } else if (city.spotify) {
      console.log('   ⏭️  Spotify link already exists')
    } else if (!spotifyToken) {
      console.log('   ⏭️  Skipping Spotify (no token)')
    }

    // Fetch Apple Music link if not already set
    if (!city.apple_music && appleMusicToken) {
      console.log('   🔍 Searching Apple Music...')
      const appleMusicLink = await findAppleMusicLink(city.name, appleMusicToken)
      if (appleMusicLink) {
        updates.apple_music = appleMusicLink
        console.log(`   ✅ Found Apple Music: ${appleMusicLink}`)
      } else {
        console.log('   ⚠️  No Apple Music link found')
      }
    } else if (city.apple_music) {
      console.log('   ⏭️  Apple Music link already exists')
    } else if (!appleMusicToken) {
      console.log('   ⏭️  Skipping Apple Music (no token)')
    }

    // Update city if we found new links
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('cities')
        .update(updates)
        .eq('id', city.id)

      if (updateError) {
        console.error(`   ❌ Error updating ${city.name}:`, updateError)
      } else {
        updated++
        console.log(`   ✅ Updated ${city.name}`)
      }
    } else {
      skipped++
    }

    // Rate limiting - wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n\n✅ Complete!`)
  console.log(`   Updated: ${updated} cities`)
  console.log(`   Skipped: ${skipped} cities`)
}

// Run
fetchMusicLinks().catch(console.error)
