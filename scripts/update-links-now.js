// Update Global Links in Supabase - Direct Update
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
const supabaseKey = 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'

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
  console.log('🔄 Connecting to Supabase...')
  console.log('URL:', supabaseUrl)
  console.log('')
  
  try {
    // First, check if there are existing links
    console.log('📋 Checking existing links...')
    const { data: existing, error: fetchError } = await supabase
      .from('global_links')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Error fetching existing links:', fetchError.message)
      console.error('Error code:', fetchError.code)
      console.error('Error details:', JSON.stringify(fetchError, null, 2))
      return
    }

    let result
    if (existing && existing.id) {
      // Update existing row
      console.log('✅ Found existing global_links row')
      console.log('📝 Updating with new links...')
      const { data, error } = await supabase
        .from('global_links')
        .update(updatedLinks)
        .eq('id', existing.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Insert new row
      console.log('➕ No existing row found')
      console.log('📝 Inserting new row...')
      const { data, error } = await supabase
        .from('global_links')
        .insert(updatedLinks)
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('❌ Error updating links:', result.error.message)
      console.error('Error code:', result.error.code)
      console.error('Error hint:', result.error.hint)
      console.error('Error details:', JSON.stringify(result.error, null, 2))
      return
    }

    console.log('')
    console.log('✅ SUCCESS! Global links updated!')
    console.log('')
    console.log('📋 Updated links:')
    console.log('  ✅ YouTube:', result.data.youtube)
    console.log('  ✅ Instagram:', result.data.instagram)
    console.log('  ✅ TikTok:', result.data.tiktok)
    console.log('  ✅ Spotify:', result.data.spotify)
    console.log('  ✅ Apple Music:', result.data.apple_music)
    console.log('  ✅ SoundCloud:', result.data.soundcloud)
    console.log('  ✅ X (Twitter):', result.data.x)
    console.log('  ✅ Facebook:', result.data.facebook)
    console.log('')
    console.log('✨ Done! Refresh your website to see the changes.')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error(error.stack)
  }
}

updateLinks()
