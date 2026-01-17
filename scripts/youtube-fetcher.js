// YouTube Video Fetcher for Cities
// Fetches city videos from YouTube and updates Supabase
// Usage: node scripts/youtube-fetcher.js [city-slug]

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const https = require('https')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// YouTube API helper
function searchYouTube(query, maxResults = 5) {
  return new Promise((resolve, reject) => {
    if (!YOUTUBE_API_KEY) {
      reject(new Error('YOUTUBE_API_KEY not found in .env.local'))
      return
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    
    const options = {
      headers: {
        'User-Agent': 'CALI-Sound-YouTube-Fetcher/1.0',
        'Referer': 'https://localhost:3000',
        'Accept': 'application/json'
      }
    }
    
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) {
            reject(new Error(json.error.message))
          } else {
            resolve(json.items || [])
          }
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}

function getVideoDetails(videoId) {
  return new Promise((resolve, reject) => {
    if (!YOUTUBE_API_KEY) {
      reject(new Error('YOUTUBE_API_KEY not found'))
      return
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    
    const options = {
      headers: {
        'User-Agent': 'CALI-Sound-YouTube-Fetcher/1.0',
        'Referer': 'https://localhost:3000',
        'Accept': 'application/json'
      }
    }
    
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) {
            reject(new Error(json.error.message))
          } else {
            resolve(json.items?.[0] || null)
          }
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

// Find best video for a city
async function findCityVideos(cityName, country) {
  const queries = [
    `${cityName} ${country} afro house`,
    `${cityName} ${country} melodic house`,
    `CALI Sound ${cityName}`,
    `${cityName} electronic music`,
  ]

  const allVideos = []
  
  for (const query of queries) {
    try {
      console.log(`🔍 Searching: "${query}"`)
      const videos = await searchYouTube(query, 3)
      allVideos.push(...videos)
      await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit
    } catch (error) {
      console.error(`❌ Error searching "${query}":`, error.message)
    }
  }

  // Remove duplicates
  const uniqueVideos = []
  const seenIds = new Set()
  for (const video of allVideos) {
    if (!seenIds.has(video.id.videoId)) {
      seenIds.add(video.id.videoId)
      uniqueVideos.push(video)
    }
  }

  return uniqueVideos
}

// Update city with YouTube data
async function updateCityWithYouTube(citySlug, videoData) {
  if (!videoData) {
    console.log('⚠️ No video data to update')
    return
  }

  const videoId = videoData.id.videoId || extractVideoId(videoData.url)
  if (!videoId) {
    console.log('⚠️ No video ID found')
    return
  }

  try {
    const details = await getVideoDetails(videoId)
    if (!details) {
      console.log('⚠️ Could not fetch video details')
      return
    }

    const snippet = details.snippet
    const thumbnails = snippet.thumbnails

    // Get best quality thumbnail
    const thumbnailUrl = thumbnails.maxres?.url || 
                        thumbnails.high?.url || 
                        thumbnails.medium?.url || 
                        thumbnails.default?.url

    const updateData = {
      youtube_full: `https://www.youtube.com/watch?v=${videoId}`,
      youtube_shorts: null, // Will be set separately if needed
      banner_16x9_url: thumbnailUrl,
      cover_square_url: thumbnailUrl, // YouTube thumbnails are 16:9, we'll use them
      yt_title: snippet.title,
      yt_description: snippet.description?.substring(0, 5000) || null,
    }

    console.log(`📝 Updating city: ${citySlug}`)
    console.log(`   Video: ${snippet.title}`)
    console.log(`   Thumbnail: ${thumbnailUrl ? 'Yes' : 'No'}`)

    const { data, error } = await supabase
      .from('cities')
      .update(updateData)
      .eq('slug', citySlug)
      .select()

    if (error) {
      console.error('❌ Error updating city:', error)
    } else {
      console.log('✅ City updated successfully!')
    }

  } catch (error) {
    console.error('❌ Error fetching video details:', error.message)
  }
}

// Main function
async function main() {
  const citySlug = process.argv[2]

  if (!YOUTUBE_API_KEY) {
    console.error('❌ ERROR: YOUTUBE_API_KEY not found!')
    console.error('')
    console.error('Please add to .env.local:')
    console.error('  YOUTUBE_API_KEY=your-youtube-api-key')
    console.error('')
    console.error('Get your API key from: https://console.cloud.google.com/apis/credentials')
    process.exit(1)
  }

  if (citySlug) {
    // Update specific city
    console.log(`🎯 Fetching videos for city: ${citySlug}`)
    
    const { data: city, error } = await supabase
      .from('cities')
      .select('*')
      .eq('slug', citySlug)
      .single()

    if (error || !city) {
      console.error(`❌ City not found: ${citySlug}`)
      process.exit(1)
    }

    const videos = await findCityVideos(city.name, city.country)
    if (videos.length > 0) {
      await updateCityWithYouTube(citySlug, videos[0])
    } else {
      console.log('⚠️ No videos found')
    }
  } else {
    // Update all cities
    console.log('🌍 Fetching videos for all cities...')
    
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (error) {
      console.error('❌ Error fetching cities:', error)
      process.exit(1)
    }

    console.log(`📋 Found ${cities.length} cities`)
    console.log('')

    for (let i = 0; i < cities.length; i++) {
      const city = cities[i]
      console.log(`\n[${i + 1}/${cities.length}] Processing: ${city.name}`)
      
      const videos = await findCityVideos(city.name, city.country)
      if (videos.length > 0) {
        await updateCityWithYouTube(city.slug, videos[0])
      } else {
        console.log('⚠️ No videos found')
      }

      // Rate limiting - wait 1 second between cities
      if (i < cities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('\n✅ All cities processed!')
  }
}

main().catch(console.error)
