/**
 * Debug Supabase Fetch
 * Test if we can fetch cities and sets directly
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Debug Supabase Fetch\n')
console.log('URL:', supabaseUrl)
console.log('Key starts with:', supabaseKey?.substring(0, 20))
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('📡 Testing cities fetch...')
  const { data: cities, error: citiesError, count } = await supabase
    .from('cities')
    .select('*', { count: 'exact' })
    .limit(5)
  
  console.log('Cities result:')
  console.log('  Count:', count)
  console.log('  Data length:', cities?.length || 0)
  if (citiesError) {
    console.error('  ❌ Error:', citiesError.message)
    console.error('  Details:', JSON.stringify(citiesError, null, 2))
  } else if (cities && cities.length > 0) {
    console.log('  ✅ Success! First city:', cities[0].name)
  } else {
    console.log('  ⚠️  No data returned (but no error)')
  }
  
  console.log('\n📡 Testing sets fetch...')
  const { data: sets, error: setsError, count: setsCount } = await supabase
    .from('sets')
    .select('*', { count: 'exact' })
    .limit(5)
  
  console.log('Sets result:')
  console.log('  Count:', setsCount)
  console.log('  Data length:', sets?.length || 0)
  if (setsError) {
    console.error('  ❌ Error:', setsError.message)
    console.error('  Details:', JSON.stringify(setsError, null, 2))
  } else if (sets && sets.length > 0) {
    console.log('  ✅ Success! First set:', sets[0].title)
  } else {
    console.log('  ⚠️  No data returned (but no error)')
  }
  
  console.log('\n📡 Testing global_links fetch...')
  const { data: links, error: linksError } = await supabase
    .from('global_links')
    .select('*')
    .limit(1)
  
  console.log('Global Links result:')
  console.log('  Data length:', links?.length || 0)
  if (linksError) {
    console.error('  ❌ Error:', linksError.message)
  } else if (links && links.length > 0) {
    console.log('  ✅ Success!')
  }
}

test().catch(console.error)
