// Script to clear all CALI Club characters from Supabase
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearCharacters() {
  try {
    console.log('🔍 Fetching all characters...')
    
    // Get all characters
    const { data: characters, error: fetchError } = await supabase
      .from('cali_club_characters')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching characters:', fetchError)
      return
    }

    if (!characters || characters.length === 0) {
      console.log('✅ No characters found. Database is already clean.')
      return
    }

    console.log(`📊 Found ${characters.length} character(s):`)
    characters.forEach((char, index) => {
      console.log(`  ${index + 1}. ${char.name} (ID: ${char.id}, Session: ${char.session_id})`)
    })

    // Set all to inactive
    console.log('\n🗑️  Setting all characters to inactive...')
    const { error: updateError } = await supabase
      .from('cali_club_characters')
      .update({ is_active: false })
      .neq('is_active', false) // Only update active ones

    if (updateError) {
      console.error('❌ Error updating characters:', updateError)
      return
    }

    console.log('✅ All characters set to inactive!')

    // Optionally delete them completely (uncomment to use)
    // console.log('\n🗑️  Deleting all characters...')
    // const { error: deleteError } = await supabase
    //   .from('cali_club_characters')
    //   .delete()
    //   .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    // if (deleteError) {
    //   console.error('❌ Error deleting characters:', deleteError)
    //   return
    // }

    // console.log('✅ All characters deleted!')

    console.log('\n✨ Done! Characters are now inactive and will disappear from the scene.')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

clearCharacters()
