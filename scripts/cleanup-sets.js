require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupSets() {
  console.log('🧹 Cleaning up sets table...\n')

  try {
    // Get all sets
    const { data: sets, error: fetchError } = await supabase
      .from('sets')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching sets:', fetchError)
      return
    }

    console.log(`📊 Found ${sets?.length || 0} sets in database`)

    if (!sets || sets.length === 0) {
      console.log('✅ No sets to clean up')
      return
    }

    // Show what will be deleted
    console.log('\n📋 Sets to be deleted:')
    sets.forEach((set, index) => {
      console.log(`   ${index + 1}. ${set.title} (${set.youtube_embed || 'no video'})`)
    })

    // Delete all sets one by one (safer approach)
    let deletedCount = 0
    for (const set of sets) {
      const { error: deleteError } = await supabase
        .from('sets')
        .delete()
        .eq('id', set.id)

      if (deleteError) {
        console.error(`❌ Error deleting set ${set.title}:`, deleteError)
      } else {
        deletedCount++
      }
    }

    if (deletedCount < sets.length) {
      console.error(`\n⚠️  Only deleted ${deletedCount} out of ${sets.length} sets`)
      return
    }

    console.log(`\n✅ Deleted ${deletedCount} set(s)`)
    console.log('✅ Sets table cleaned up!')
    console.log('\n💡 Now run: npm run sync-sets')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

cleanupSets()
