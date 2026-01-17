/**
 * Check if data exists in Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkData() {
  console.log('🔍 Checking Supabase data...\n')
  
  // Check cities
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select('id, name')
  
  console.log(`Cities: ${cities?.length || 0} found`)
  if (citiesError) console.error('Error:', citiesError.message)
  
  // Check sets
  const { data: sets, error: setsError } = await supabase
    .from('sets')
    .select('id, title')
  
  console.log(`Sets: ${sets?.length || 0} found`)
  if (setsError) console.error('Error:', setsError.message)
  
  // Check global links
  const { data: links, error: linksError } = await supabase
    .from('global_links')
    .select('id')
  
  console.log(`Global Links: ${links?.length || 0} found`)
  if (linksError) console.error('Error:', linksError.message)
  
  if (cities?.length === 0) {
    console.log('\n⚠️  No data found! Run: npm run seed')
  } else {
    console.log('\n✅ Data exists!')
  }
}

checkData()
