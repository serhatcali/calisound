// Update Global Links in Supabase
// Run with: node scripts/update-links.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const updatedLinks = {
  youtube: 'https://www.youtube.com/@calisound',
  instagram: 'https://www.instagram.com/cali.sound/',
  tiktok: 'https://www.tiktok.com/@cali.sound',
  spotify: 'https://open.spotify.com/intl-tr/artist/7znHq3X6LhflzUSTYawPaN?si=9k1Dg_1KS_uumTYBFY2UKA',
  apple_music: 'https://music.apple.com/tr/artist/cali-sound/1867501768?l=tr',
  soundcloud: 'https://soundcloud.com/cali-sound-116132115',
  x: 'https://x.com/CaliSoundOff',
  facebook: 'https://www.facebook.com/profile.php?id=61586337060502'
}

async function updateLinks() {
  console.log('🔄 Updating global links in Supabase...')
  console.log('')
  
  try {
    // First, check if there are existing links
    const { data: existing, error: fetchError } = await supabase
      .from('global_links')
      .select('*')
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching existing links:', fetchError)
      return
    }

    let result
    if (existing) {
      // Update existing row
      console.log('📝 Updating existing global_links row...')
      const { data, error } = await supabase
        .from('global_links')
        .update(updatedLinks)
        .eq('id', existing.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Insert new row
      console.log('➕ Inserting new global_links row...')
      const { data, error } = await supabase
        .from('global_links')
        .insert(updatedLinks)
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('❌ Error updating links:', result.error)
      console.error('Error details:', JSON.stringify(result.error, null, 2))
      return
    }

    console.log('✅ Successfully updated global links!')
    console.log('')
    console.log('📋 Updated links:')
    console.log('  YouTube:', result.data.youtube)
    console.log('  Instagram:', result.data.instagram)
    console.log('  TikTok:', result.data.tiktok)
    console.log('  Spotify:', result.data.spotify)
    console.log('  Apple Music:', result.data.apple_music)
    console.log('  SoundCloud:', result.data.soundcloud)
    console.log('  X (Twitter):', result.data.x)
    console.log('  Facebook:', result.data.facebook)
    console.log('')
    console.log('✨ Done! Refresh your website to see the changes.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

updateLinks()
