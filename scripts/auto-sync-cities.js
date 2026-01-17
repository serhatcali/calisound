// Auto-sync cities from YouTube
// Finds all CALI Sound videos from YOUR channel and automatically adds/updates cities in Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const https = require('https')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
// Use service role key for admin operations (bypasses RLS)
// If not set, fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Get channel ID from username (e.g., @calisound)
function getChannelIdFromUsername(username) {
  return new Promise((resolve, reject) => {
    if (!YOUTUBE_API_KEY) {
      reject(new Error('YOUTUBE_API_KEY not found'))
      return
    }

    // Remove @ if present and add it back for search
    const cleanUsername = username.replace('@', '')
    const searchQuery = `@${cleanUsername}`
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
    
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
          } else if (json.items && json.items.length > 0) {
            resolve(json.items[0].id.channelId)
          } else {
            reject(new Error('Channel not found'))
          }
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}

// Get all videos from a specific channel
function getChannelVideos(channelId, maxResults = 50) {
  return new Promise((resolve, reject) => {
    if (!YOUTUBE_API_KEY) {
      reject(new Error('YOUTUBE_API_KEY not found'))
      return
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&type=video&maxResults=${maxResults}&order=date&key=${YOUTUBE_API_KEY}`
    
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

// Extract city name from video title
function extractCityFromTitle(title) {
  // Remove HTML entities first
  title = title.replace(/&amp;/g, '&')
  
  // Remove flag emojis and other emojis to simplify matching
  title = title.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '') // Flag emojis
  title = title.replace(/🔥/g, '') // Fire emoji
  
  // Known cities list for validation
  const knownCities = [
    'Mexico City', 'Mexico', 'Rio', 'Rio de Janeiro', 'Madrid', 'Beijing', 
    'Delhi', 'Cairo', 'Dubai', 'Amsterdam', 'Roma', 'Rome', 'Istanbul',
    'Paris', 'London', 'Berlin', 'Barcelona', 'Lisbon', 'Miami', 
    'Los Angeles', 'Bangkok', 'Singapore', 'Sydney', 'Melbourne', 'New York'
  ]
  
  // Pattern 1: "CALI – [City]" or "CALI | [City]"
  let match = title.match(/CALI\s*[–—|]\s*([A-Z][a-zA-Z\s]{2,25}?)(?:\s*[|–—]|\s*Afro|\s*#|$)/)
  if (match) {
    let cityName = cleanCityName(match[1].trim())
    if (isValidCityName(cityName)) {
      // Check if it matches a known city (case-insensitive, partial match)
      const matched = knownCities.find(c => 
        c.toLowerCase() === cityName.toLowerCase() || 
        cityName.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(cityName.toLowerCase())
      )
      if (matched) return matched
      return cityName // Return even if not in known list
    }
  }
  
  // Pattern 2: "CALI – Afro House in [City]"
  match = title.match(/CALI\s*[–—]\s*Afro\s+House\s+in\s+([A-Z][a-zA-Z\s]{2,25}?)(?:\s*[|–—]|\s*#|$)/)
  if (match) {
    let cityName = cleanCityName(match[1].trim())
    if (isValidCityName(cityName)) {
      const matched = knownCities.find(c => 
        c.toLowerCase() === cityName.toLowerCase() || 
        cityName.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(cityName.toLowerCase())
      )
      if (matched) return matched
      return cityName
    }
  }
  
  // Pattern 3: "#afrohouse CALI – [City]"
  match = title.match(/#\w+\s+CALI\s*[–—]\s*([A-Z][a-zA-Z\s]{2,25}?)(?:\s*[|–—]|\s*Afro|\s*#|$)/)
  if (match) {
    let cityName = cleanCityName(match[1].trim())
    if (isValidCityName(cityName)) {
      const matched = knownCities.find(c => 
        c.toLowerCase() === cityName.toLowerCase() || 
        cityName.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(cityName.toLowerCase())
      )
      if (matched) return matched
      return cityName
    }
  }
  
  return null
}

function cleanCityName(cityName) {
  // Remove common suffixes and clean up
  cityName = cityName.replace(/\s*Afro\s+House.*$/i, '')
  cityName = cityName.replace(/\s*in\s+.*$/i, '')
  cityName = cityName.replace(/\s*[|–—:].*$/, '')
  cityName = cityName.replace(/\s*\(.*?\).*$/, '')
  cityName = cityName.replace(/\s*\[.*?\].*$/, '')
  cityName = cityName.replace(/\s*#.*$/, '')
  cityName = cityName.replace(/\s*OUT\s+NOW.*$/i, '')
  cityName = cityName.replace(/\s*🔥.*$/, '')
  cityName = cityName.replace(/\s*Energy.*$/i, '')
  cityName = cityName.replace(/\s*Rhythm.*$/i, '')
  cityName = cityName.replace(/\s*Percussion.*$/i, '')
  cityName = cityName.replace(/\s*Vibes.*$/i, '')
  cityName = cityName.replace(/\s*Festival.*$/i, '')
  cityName = cityName.replace(/\s*Carnival.*$/i, '')
  cityName = cityName.replace(/\s*Club.*$/i, '')
  cityName = cityName.replace(/\s*Global.*$/i, '')
  cityName = cityName.replace(/\s*Set.*$/i, '')
  cityName = cityName.replace(/\s*Intro.*$/i, '')
  cityName = cityName.replace(/\s*Sunset.*$/i, '')
  cityName = cityName.replace(/\s*from\s+the\s+City.*$/i, '')
  cityName = cityName.replace(/\s*Zócalo.*$/i, '')
  return cityName.trim()
}

function isValidCityName(cityName) {
  if (!cityName || cityName.length < 2) return false
  if (/^(Intro|Afro|House|Sound|CALI|Global|City|Set|Mix|Energy|Rhythm|Percussion|Vibes|Festival|Carnival|Club|Sunset|from|the|Zócalo)$/i.test(cityName)) return false
  if (!/[A-Za-z]/.test(cityName)) return false
  if (cityName.length > 30) return false // Too long, probably not a city
  return true
}

// Parse YouTube duration (ISO 8601 format: PT1M30S = 90 seconds)
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return null
  
  const hours = parseInt(match[1] || 0)
  const minutes = parseInt(match[2] || 0)
  const seconds = parseInt(match[3] || 0)
  
  return hours * 3600 + minutes * 60 + seconds
}

// Get country and region from city name (basic mapping)
const cityToCountry = {
  'Rio de Janeiro': { country: 'Brazil', flag: '🇧🇷', region: 'Americas' },
  'Rio': { country: 'Brazil', flag: '🇧🇷', region: 'Americas' },
  'Dubai': { country: 'United Arab Emirates', flag: '🇦🇪', region: 'MENA' },
  'Rome': { country: 'Italy', flag: '🇮🇹', region: 'Europe' },
  'Roma': { country: 'Italy', flag: '🇮🇹', region: 'Europe' },
  'Amsterdam': { country: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  'Istanbul': { country: 'Turkey', flag: '🇹🇷', region: 'MENA' },
  'Madrid': { country: 'Spain', flag: '🇪🇸', region: 'Europe' },
  'Beijing': { country: 'China', flag: '🇨🇳', region: 'Asia' },
  'Cairo': { country: 'Egypt', flag: '🇪🇬', region: 'MENA' },
  'Delhi': { country: 'India', flag: '🇮🇳', region: 'Asia' },
  'Tokyo': { country: 'Japan', flag: '🇯🇵', region: 'Asia' },
  'New York': { country: 'United States', flag: '🇺🇸', region: 'Americas' },
  'Mexico City': { country: 'Mexico', flag: '🇲🇽', region: 'Americas' },
  'Mexico': { country: 'Mexico', flag: '🇲🇽', region: 'Americas' },
  'Paris': { country: 'France', flag: '🇫🇷', region: 'Europe' },
  'London': { country: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  'Berlin': { country: 'Germany', flag: '🇩🇪', region: 'Europe' },
  'Barcelona': { country: 'Spain', flag: '🇪🇸', region: 'Europe' },
  'Lisbon': { country: 'Portugal', flag: '🇵🇹', region: 'Europe' },
  'Miami': { country: 'United States', flag: '🇺🇸', region: 'Americas' },
  'Los Angeles': { country: 'United States', flag: '🇺🇸', region: 'Americas' },
  'Bangkok': { country: 'Thailand', flag: '🇹🇭', region: 'Asia' },
  'Singapore': { country: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  'Sydney': { country: 'Australia', flag: '🇦🇺', region: 'Asia' },
  'Melbourne': { country: 'Australia', flag: '🇦🇺', region: 'Asia' },
}

function getCityInfo(cityName) {
  // Try exact match first
  if (cityToCountry[cityName]) {
    return cityToCountry[cityName]
  }
  
  // Try case-insensitive match
  const normalized = Object.keys(cityToCountry).find(
    key => key.toLowerCase() === cityName.toLowerCase()
  )
  if (normalized) {
    return cityToCountry[normalized]
  }
  
  // Default fallback
  return {
    country: 'Unknown',
    flag: '🌍',
    region: 'Unknown'
  }
}

// Normalize city name (Roma -> Rome, etc.)
function normalizeCityName(cityName) {
  const normalizations = {
    'Roma': 'Rome',
    'Rio': 'Rio de Janeiro',
  }
  
  return normalizations[cityName] || cityName
}

// Create slug from city name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Main sync function
async function syncCitiesFromYouTube() {
  console.log('🔍 Getting your YouTube channel...\n')
  
  try {
    // Get YouTube link from global_links
    const { data: globalLinks, error: linksError } = await supabase
      .from('global_links')
      .select('youtube')
      .single()
    
    let youtubeUrl = null
    
    if (linksError || !globalLinks?.youtube) {
      console.log('⚠️  Could not find YouTube link in global_links')
      console.log('📝 Using default: https://www.youtube.com/@calisound')
      youtubeUrl = 'https://www.youtube.com/@calisound'
    } else {
      youtubeUrl = globalLinks.youtube
    }
    
    console.log(`📺 YouTube URL: ${youtubeUrl}`)
    
    // Extract channel username or ID from URL
    let channelIdentifier = null
    if (youtubeUrl.includes('@')) {
      // Format: https://www.youtube.com/@calisound
      channelIdentifier = youtubeUrl.match(/@([^\/]+)/)?.[1]
    } else if (youtubeUrl.includes('channel/')) {
      // Format: https://www.youtube.com/channel/UC...
      channelIdentifier = youtubeUrl.match(/channel\/([^\/]+)/)?.[1]
    } else if (youtubeUrl.includes('c/')) {
      // Format: https://www.youtube.com/c/calisound
      channelIdentifier = youtubeUrl.match(/\/c\/([^\/]+)/)?.[1]
    }
    
    if (!channelIdentifier) {
      console.error('❌ Could not extract channel identifier from URL')
      process.exit(1)
    }
    
    console.log(`🔍 Finding channel ID for: ${channelIdentifier}\n`)
    
    // Get channel ID
    let channelId = null
    try {
      // If it's already a channel ID (starts with UC)
      if (channelIdentifier.startsWith('UC')) {
        channelId = channelIdentifier
      } else {
        // Try to get channel ID from username
        channelId = await getChannelIdFromUsername(channelIdentifier)
      }
    } catch (error) {
      console.error('❌ Error getting channel ID:', error.message)
      console.error('Trying direct search...')
      // Fallback: search for channel
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelIdentifier)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
      // We'll handle this in the getChannelVideos function
      channelId = channelIdentifier // Use as-is and let API handle it
    }
    
    console.log(`✅ Channel ID: ${channelId}\n`)
    console.log('📹 Fetching videos from your channel...\n')
    
    // Get videos from YOUR channel only
    const videos = await getChannelVideos(channelId, 50)
    console.log(`📹 Found ${videos.length} videos from your channel\n`)
    
    const cityMap = new Map()
    
    // Process each video
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      const title = video.snippet.title
      
      // Skip shorts - only process full videos
      if (title.toLowerCase().includes('#shorts') || 
          title.toLowerCase().includes('shorts') ||
          video.snippet.description?.toLowerCase().includes('#shorts')) {
        console.log(`⏭️  Skipping: "${title}" (shorts video)`)
        continue
      }
      
      let cityName = extractCityFromTitle(title)
      
      if (!cityName) {
        console.log(`⏭️  Skipping: "${title}" (no city found)`)
        continue
      }
      
      // Normalize city name (Roma -> Rome, etc.)
      cityName = normalizeCityName(cityName)
      
      console.log(`\n[${i + 1}/${videos.length}] Processing: "${title}"`)
      console.log(`   City: ${cityName}`)
      
      // Get video details
      try {
        const details = await getVideoDetails(video.id.videoId)
        if (!details) {
          console.log('   ⚠️  Could not fetch video details')
          continue
        }
        
        const snippet = details.snippet
        const thumbnails = snippet.thumbnails
        const contentDetails = details.contentDetails
        
        // Skip if video is too short (likely a shorts - YouTube Shorts are usually < 60 seconds)
        if (contentDetails?.duration) {
          const duration = parseDuration(contentDetails.duration) // Returns seconds
          if (duration && duration < 60) {
            console.log(`   ⏭️  Skipping: Video is too short (${duration}s) - likely a shorts`)
            continue
          }
        }
        
        // Get best quality thumbnail
        const thumbnailUrl = thumbnails.maxres?.url || 
                            thumbnails.high?.url || 
                            thumbnails.medium?.url || 
                            thumbnails.default?.url
        
        // Check if city already exists in map
        if (!cityMap.has(cityName)) {
          const cityInfo = getCityInfo(cityName)
          const slug = createSlug(cityName)
          
          cityMap.set(cityName, {
            name: cityName,
            slug: slug,
            country: cityInfo.country,
            country_flag: cityInfo.flag,
            region: cityInfo.region,
            mood: ['festival', 'sunset'], // Default mood
            status: 'OUT_NOW',
            youtube_full: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            youtube_shorts: null,
            banner_16x9_url: thumbnailUrl,
            cover_square_url: thumbnailUrl,
            shorts_9x16_url: null,
            yt_title: snippet.title,
            yt_description: snippet.description?.substring(0, 5000) || null,
            description_en: snippet.description?.substring(0, 1000) || null,
            description_local: null,
            yt_tags: snippet.tags?.join(',') || null,
            hashtags: `#CALISound #${cityName.replace(/\s+/g, '')} #AfroHouse #MelodicHouse`,
            release_datetime: new Date(snippet.publishedAt).toISOString(),
          })
          
          console.log(`   ✅ City data prepared: ${cityName}`)
        } else {
          // Update if this video is newer
          const existing = cityMap.get(cityName)
          const existingDate = new Date(existing.release_datetime)
          const newDate = new Date(snippet.publishedAt)
          
          // Always update status to OUT_NOW if video exists
          existing.status = 'OUT_NOW'
          
          if (newDate > existingDate) {
            existing.youtube_full = `https://www.youtube.com/watch?v=${video.id.videoId}`
            existing.banner_16x9_url = thumbnailUrl
            existing.cover_square_url = thumbnailUrl
            existing.yt_title = snippet.title
            existing.yt_description = snippet.description?.substring(0, 5000) || null
            existing.release_datetime = newDate.toISOString()
            console.log(`   🔄 Updated with newer video`)
          } else {
            // Even if not newer, ensure we have the video link
            if (!existing.youtube_full) {
              existing.youtube_full = `https://www.youtube.com/watch?v=${video.id.videoId}`
              existing.banner_16x9_url = thumbnailUrl
              existing.cover_square_url = thumbnailUrl
            }
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`   ❌ Error processing video: ${error.message}`)
      }
    }
    
    console.log(`\n\n📊 Found ${cityMap.size} unique cities\n`)
    console.log('Cities to sync:')
    cityMap.forEach((city, name) => {
      console.log(`   - ${name} (${city.slug})`)
    })
    
    // Sync to Supabase
    console.log(`\n🔄 Syncing to Supabase...\n`)
    
    // Check if using service role key
    const usingServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!usingServiceRole) {
      console.log('⚠️  Warning: Using anon key. Some inserts may fail due to RLS policies.')
      console.log('   To fix: Add SUPABASE_SERVICE_ROLE_KEY to .env.local\n')
    } else {
      console.log('✅ Using service role key (RLS bypassed)\n')
    }
    
    for (const [name, cityData] of cityMap.entries()) {
      try {
        // Use UPSERT (insert or update) - works better with RLS
        const { data, error } = await supabase
          .from('cities')
          .upsert(cityData, {
            onConflict: 'slug',
            ignoreDuplicates: false
          })
          .select()
        
        if (error) {
          console.error(`   ❌ Error syncing ${name}:`, error.message)
          if (error.message.includes('row-level security')) {
            console.error(`      💡 Tip: Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS`)
          }
        } else {
          if (data && data.length > 0) {
            const isNew = data[0].created_at === data[0].updated_at
            console.log(`   ${isNew ? '✅ Added' : '✅ Updated'}: ${name}`)
          } else {
            console.log(`   ✅ Synced: ${name}`)
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`   ❌ Error syncing ${name}:`, error.message)
      }
    }
    
    console.log(`\n✅ Sync complete! ${cityMap.size} cities processed.`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run sync
if (!YOUTUBE_API_KEY) {
  console.error('❌ ERROR: YOUTUBE_API_KEY not found!')
  console.error('Please add YOUTUBE_API_KEY to .env.local')
  process.exit(1)
}

syncCitiesFromYouTube().catch(console.error)
