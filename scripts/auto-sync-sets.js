// Auto-sync DJ Sets from YouTube
// Finds all CALI Sound DJ sets/mixes from YOUR channel and automatically adds/updates sets in Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const https = require('https')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
// Use service role key for admin operations (bypasses RLS)
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

// Parse YouTube duration (ISO 8601 format: PT1M30S = 90 seconds)
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return null
  
  const hours = parseInt(match[1] || 0)
  const minutes = parseInt(match[2] || 0)
  const seconds = parseInt(match[3] || 0)
  
  return hours * 3600 + minutes * 60 + seconds
}

// Format duration as MM:SS or HH:MM:SS
function formatDuration(seconds) {
  if (!seconds) return null
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Check if video is a DJ set/mix (not a city video)
function isDJSet(title) {
  const titleLower = title.toLowerCase()
  
  // ONLY accept videos with the word "set" in the title (as a whole word, not part of another word)
  // Use word boundary regex to match "set" as a complete word
  // This prevents matching "set" inside words like "sunset", "asset", "upset", etc.
  const setWordRegex = /\bset\b/
  if (!setWordRegex.test(titleLower)) {
    return false
  }
  
  // Exclude city-specific videos (but allow "Global City Set" type)
  const cityKeywords = [
    'rio', 'dubai', 'rome', 'amsterdam', 'istanbul', 'madrid', 
    'beijing', 'cairo', 'delhi', 'tokyo', 'new york', 'mexico city',
    '🇧🇷', '🇦🇪', '🇮🇹', '🇳🇱', '🇹🇷', '🇪🇸', '🇨🇳', '🇪🇬', '🇮🇳', '🇯🇵', '🇺🇸', '🇲🇽'
  ]
  
  // Exclude intro videos (unless they have "set" as a word in title)
  if (titleLower.includes('intro') && !setWordRegex.test(titleLower)) {
    return false
  }
  
  // Check if it's NOT a single city video
  // Allow "Global City Set" but exclude individual city videos
  const hasCityFlag = cityKeywords.some(keyword => titleLower.includes(keyword))
  const isGlobalSet = titleLower.includes('global') && setWordRegex.test(titleLower)
  
  // It's a set if:
  // 1. Has "set" as a word in title AND (no city flag OR is a global set)
  return (!hasCityFlag || isGlobalSet)
}

// Extract chapters from description (look for timestamp patterns)
function extractChapters(description) {
  if (!description) return null
  
  const lines = description.split('\n')
  const chapters = []
  
  for (const line of lines) {
    // Look for patterns like "00:00 Intro" or "00:00 - Intro"
    const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]?\s*(.+)$/)
    if (match) {
      chapters.push(`${match[1]} ${match[2].trim()}`)
    }
  }
  
  return chapters.length > 0 ? chapters.join('\n') : null
}

// Main sync function
async function syncSetsFromYouTube() {
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
      channelIdentifier = youtubeUrl.match(/@([^\/]+)/)?.[1]
    } else if (youtubeUrl.includes('channel/')) {
      channelIdentifier = youtubeUrl.match(/channel\/([^\/]+)/)?.[1]
    } else if (youtubeUrl.includes('c/')) {
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
      if (channelIdentifier.startsWith('UC')) {
        channelId = channelIdentifier
      } else {
        channelId = await getChannelIdFromUsername(channelIdentifier)
      }
    } catch (error) {
      console.error('❌ Error getting channel ID:', error.message)
      process.exit(1)
    }
    
    console.log(`✅ Channel ID: ${channelId}\n`)
    console.log('📹 Fetching videos from your channel...\n')
    
    // Get videos from YOUR channel only
    const videos = await getChannelVideos(channelId, 50)
    console.log(`📹 Found ${videos.length} videos from your channel\n`)
    
    const sets = []
    
    // Process each video
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      const title = video.snippet.title
      
      // Skip shorts
      if (title.toLowerCase().includes('#shorts') || 
          title.toLowerCase().includes('shorts') ||
          video.snippet.description?.toLowerCase().includes('#shorts')) {
        console.log(`⏭️  Skipping: "${title}" (shorts video)`)
        continue
      }
      
      // Check if it's a DJ set
      if (!isDJSet(title)) {
        console.log(`⏭️  Skipping: "${title}" (does not contain "set" in title)`)
        continue
      }
      
      console.log(`\n[${i + 1}/${videos.length}] Processing: "${title}"`)
      
      // Get video details
      try {
        const details = await getVideoDetails(video.id.videoId)
        if (!details) {
          console.log('   ⚠️  Could not fetch video details')
          continue
        }
        
        const snippet = details.snippet
        const contentDetails = details.contentDetails
        
        // Skip if video is too short (less than 5 minutes - sets are usually longer)
        // But allow if title explicitly mentions "set" as a word
        const titleLower = snippet.title.toLowerCase()
        const setWordRegex = /\bset\b/
        const isExplicitSet = setWordRegex.test(titleLower)
        
        if (contentDetails?.duration) {
          const duration = parseDuration(contentDetails.duration)
          if (duration && duration < 300 && !isExplicitSet) { // Less than 5 minutes and not explicitly a set
            console.log(`   ⏭️  Skipping: Video is too short (${formatDuration(duration)}) - likely not a full set`)
            continue
          }
        }
        
        const formattedDuration = contentDetails?.duration 
          ? formatDuration(parseDuration(contentDetails.duration))
          : null
        
        const chapters = extractChapters(snippet.description)
        
        const setData = {
          title: snippet.title,
          youtube_embed: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          duration: formattedDuration,
          chapters: chapters,
          description: snippet.description?.substring(0, 2000) || null,
        }
        
        sets.push(setData)
        console.log(`   ✅ Set data prepared: ${snippet.title}`)
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`   ❌ Error processing video: ${error.message}`)
      }
    }
    
    console.log(`\n\n📊 Found ${sets.length} DJ sets\n`)
    console.log('Sets to sync:')
    sets.forEach((set, index) => {
      console.log(`   ${index + 1}. ${set.title} (${set.duration || 'N/A'})`)
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
    
    for (const setData of sets) {
      try {
        // Check if set exists by youtube_embed
        const { data: existing } = await supabase
          .from('sets')
          .select('id, title')
          .eq('youtube_embed', setData.youtube_embed)
          .maybeSingle()
        
        if (existing) {
          // Update existing set
          const { data, error } = await supabase
            .from('sets')
            .update(setData)
            .eq('id', existing.id)
            .select()
          
          if (error) {
            console.error(`   ❌ Error updating "${setData.title}":`, error.message)
            if (error.message.includes('row-level security')) {
              console.error(`      💡 Tip: Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS`)
            }
          } else {
            console.log(`   ✅ Updated: ${setData.title}`)
          }
        } else {
          // Insert new set
          const { data, error } = await supabase
            .from('sets')
            .insert(setData)
            .select()
          
          if (error) {
            console.error(`   ❌ Error inserting "${setData.title}":`, error.message)
            if (error.message.includes('row-level security')) {
              console.error(`      💡 Tip: Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS`)
            }
          } else {
            console.log(`   ✅ Added: ${setData.title}`)
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`   ❌ Error syncing "${setData.title}":`, error.message)
      }
    }
    
    console.log(`\n✅ Sync complete! ${sets.length} sets processed.`)
    
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

syncSetsFromYouTube().catch(console.error)
