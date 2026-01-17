/**
 * Test Supabase Connection
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...\n')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT FOUND')
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables not found!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  try {
    // Test cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, slug')
      .limit(3)
    
    if (citiesError) {
      console.error('❌ Cities Error:', citiesError.message)
      console.error('Details:', citiesError)
    } else {
      console.log('✅ Cities:', cities?.length || 0, 'found')
      if (cities && cities.length > 0) {
        console.log('   Sample:', cities[0].name)
      }
    }
    
    // Test sets
    const { data: sets, error: setsError } = await supabase
      .from('sets')
      .select('id, title')
      .limit(1)
    
    if (setsError) {
      console.error('❌ Sets Error:', setsError.message)
    } else {
      console.log('✅ Sets:', sets?.length || 0, 'found')
    }
    
    // Test global_links
    const { data: links, error: linksError } = await supabase
      .from('global_links')
      .select('id')
      .limit(1)
    
    if (linksError) {
      console.error('❌ Global Links Error:', linksError.message)
    } else {
      console.log('✅ Global Links:', links?.length || 0, 'found')
    }
    
    console.log('\n✅ Connection test completed!')
    
  } catch (error) {
    console.error('❌ Fatal Error:', error)
    process.exit(1)
  }
}

test()
