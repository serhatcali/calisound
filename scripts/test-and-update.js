// Simple test and update script
console.log('🚀 Starting script...')

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
const supabaseKey = 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'

console.log('✅ Credentials loaded')
console.log('URL:', supabaseUrl)

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

async function main() {
  try {
    console.log('📋 Fetching existing links...')
    const { data: existing, error: fetchError } = await supabase
      .from('global_links')
      .select('*')
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError.message)
      return
    }

    console.log('Existing data:', existing ? 'Found' : 'Not found')

    let result
    if (existing && existing.id) {
      console.log('📝 Updating existing row...')
      const { data, error } = await supabase
        .from('global_links')
        .update(updatedLinks)
        .eq('id', existing.id)
        .select()
        .single()
      result = { data, error }
    } else {
      console.log('➕ Inserting new row...')
      const { data, error } = await supabase
        .from('global_links')
        .insert(updatedLinks)
        .select()
        .single()
      result = { data, error }
    }

    if (result.error) {
      console.error('❌ Update error:', result.error.message)
      console.error('Code:', result.error.code)
      return
    }

    console.log('✅ SUCCESS!')
    console.log('Updated links:', JSON.stringify(result.data, null, 2))
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

main().then(() => {
  console.log('✨ Script completed')
  process.exit(0)
}).catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
