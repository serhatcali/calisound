require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSets() {
  console.log('🔍 Checking sets in Supabase...\n')

  try {
    const { data: sets, error } = await supabase
      .from('sets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching sets:', error)
      return
    }

    console.log(`📊 Found ${sets?.length || 0} sets in database\n`)

    if (!sets || sets.length === 0) {
      console.log('✅ No sets found (database is clean)')
      return
    }

    sets.forEach((set, index) => {
      console.log(`${index + 1}. ${set.title}`)
      console.log(`   YouTube: ${set.youtube_embed || 'N/A'}`)
      console.log(`   Duration: ${set.duration || 'N/A'}`)
      console.log(`   Created: ${set.created_at || 'N/A'}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkSets()
