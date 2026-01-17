// Check which cities exist in Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCities() {
  console.log('🔍 Checking cities in Supabase...\n')
  
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, name, slug, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📊 Total cities: ${cities.length}\n`)
  console.log('Cities in database:')
  console.log('─'.repeat(60))
  
  cities.forEach((city, index) => {
    const status = city.status === 'OUT_NOW' ? '✅ OUT NOW' : '⏳ SOON'
    const date = city.created_at ? new Date(city.created_at).toLocaleDateString('tr-TR') : 'N/A'
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${city.name.padEnd(20)} | ${city.slug.padEnd(15)} | ${status} | ${date}`)
  })

  console.log('\n')
  
  // Expected cities from seed file
  const expectedCities = [
    'Rio de Janeiro', 'Dubai', 'Rome', 'Amsterdam', 'Istanbul',
    'Madrid', 'Beijing', 'Cairo', 'Delhi', 'Tokyo', 'New York'
  ]
  
  const existingSlugs = cities.map(c => c.name)
  const missing = expectedCities.filter(name => !existingSlugs.includes(name))
  
  if (missing.length > 0) {
    console.log('⚠️  Missing cities from seed file:')
    missing.forEach(name => console.log(`   - ${name}`))
  } else {
    console.log('✅ All expected cities are in the database')
  }
  
  // Check for cities not in seed file
  const unexpected = cities.filter(c => !expectedCities.includes(c.name))
  if (unexpected.length > 0) {
    console.log('\n📝 Cities in database but NOT in seed file:')
    unexpected.forEach(city => {
      console.log(`   - ${city.name} (${city.slug}) - ${city.status}`)
    })
  }
}

checkCities().catch(console.error)
