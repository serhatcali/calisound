/**
 * Seed Supabase Database
 * 
 * This script will insert sample data into your Supabase database.
 * 
 * Usage:
 * 1. Make sure .env.local file exists with your Supabase credentials
 * 2. Run: node scripts/seed-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found!')
  console.error('Please make sure .env.local file exists with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Read seed data SQL file
const seedDataPath = path.join(__dirname, '../supabase/seed-data.sql')
const seedData = fs.readFileSync(seedDataPath, 'utf8')

async function seedDatabase() {
  console.log('🚀 Starting seed process...')
  console.log(`📡 Connecting to: ${supabaseUrl}`)
  
  try {
    // Split SQL into individual statements
    const statements = seedData
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length < 10) continue // Skip very short statements
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        // Use RPC or direct query - Supabase JS client doesn't support raw SQL
        // So we'll use the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ query: statement })
        })
        
        // Alternative: Use Supabase client for specific operations
        // For now, let's insert data directly using the client
        
      } catch (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message)
      }
    }
    
    // Instead of raw SQL, let's insert data using Supabase client
    await insertGlobalLinks()
    await insertCities()
    await insertSets()
    
    console.log('✅ Seed process completed!')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

async function insertGlobalLinks() {
  console.log('📝 Inserting global links...')
  
  const { data, error } = await supabase
    .from('global_links')
    .upsert({
      youtube: 'https://youtube.com/@calisound',
      instagram: 'https://instagram.com/calisound',
      tiktok: 'https://tiktok.com/@calisound',
      spotify: 'https://open.spotify.com/artist/calisound',
      apple_music: 'https://music.apple.com/artist/calisound',
      soundcloud: 'https://soundcloud.com/calisound',
      x: 'https://x.com/calisound',
      facebook: 'https://facebook.com/calisound'
    }, { onConflict: 'id' })
  
  if (error) {
    console.error('❌ Error inserting global links:', error)
  } else {
    console.log('✅ Global links inserted')
  }
}

async function insertCities() {
  console.log('📝 Inserting cities...')
  
  const cities = [
    {
      name: 'Rio de Janeiro',
      slug: 'rio',
      country: 'Brazil',
      country_flag: '🇧🇷',
      region: 'Americas',
      mood: ['festival', 'sunset'],
      status: 'OUT_NOW',
      release_datetime: '2024-01-01T12:00:00+03:00',
      cover_square_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=3000&h=3000&fit=crop',
      banner_16x9_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&h=1080&fit=crop',
      shorts_9x16_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1080&h=1920&fit=crop',
      youtube_full: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      youtube_shorts: 'https://youtube.com/shorts/dQw4w9WgXcQ',
      instagram: 'https://instagram.com/p/calisound-rio',
      tiktok: 'https://tiktok.com/@calisound/video/rio',
      description_en: 'Feel the rhythm of Rio de Janeiro. This festival-inspired Afro House mix captures the energy of Copacabana and the spirit of Brazilian music.',
      description_local: 'Sinta o ritmo do Rio de Janeiro. Esta mistura de Afro House inspirada em festivais captura a energia de Copacabana e o espírito da música brasileira.',
      yt_title: 'CALI Sound: Rio de Janeiro | Afro House City Series',
      yt_description: 'Experience Rio de Janeiro through Afro House music.',
      yt_tags: 'afro house,melodic house,rio de janeiro,brazil,electronic music,cali sound,club music',
      hashtags: '#CALISound #Rio #AfroHouse #MelodicHouse #Brazil'
    },
    {
      name: 'Dubai',
      slug: 'dubai',
      country: 'United Arab Emirates',
      country_flag: '🇦🇪',
      region: 'MENA',
      mood: ['luxury', 'sunset'],
      status: 'OUT_NOW',
      release_datetime: '2024-01-15T12:00:00+03:00',
      cover_square_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=3000&h=3000&fit=crop',
      banner_16x9_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&h=1080&fit=crop',
      shorts_9x16_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1080&h=1920&fit=crop',
      youtube_full: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      youtube_shorts: 'https://youtube.com/shorts/dQw4w9WgXcQ',
      instagram: 'https://instagram.com/p/calisound-dubai',
      tiktok: 'https://tiktok.com/@calisound/video/dubai',
      description_en: 'Experience the luxury and opulence of Dubai through Afro House.',
      description_local: 'اختبر الفخامة والترف في دبي من خلال Afro House.',
      yt_title: 'CALI Sound: Dubai | Afro House City Series',
      yt_description: 'Experience Dubai through Afro House music.',
      yt_tags: 'afro house,melodic house,dubai,uae,electronic music,cali sound',
      hashtags: '#CALISound #Dubai #AfroHouse #MelodicHouse #UAE'
    }
  ]
  
  for (const city of cities) {
    const { error } = await supabase
      .from('cities')
      .upsert(city, { onConflict: 'slug' })
    
    if (error) {
      console.error(`❌ Error inserting ${city.name}:`, error)
    } else {
      console.log(`✅ Inserted: ${city.name}`)
    }
  }
}

async function insertSets() {
  console.log('📝 Inserting DJ sets...')
  
  const sets = [
    {
      title: 'CALI Sound Global Mix - 32 Minutes',
      youtube_embed: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '32:00',
      chapters: '00:00 Intro - Rio de Janeiro\n00:05 Dubai Luxury Vibes\n05:20 Rome Deep Journey',
      description: 'A 32-minute journey through the CALI Sound Global Afro House City Series.'
    }
  ]
  
  for (const set of sets) {
    const { error } = await supabase
      .from('sets')
      .insert(set)
    
    if (error) {
      console.error(`❌ Error inserting ${set.title}:`, error)
    } else {
      console.log(`✅ Inserted: ${set.title}`)
    }
  }
}

// Run the seed
seedDatabase()
