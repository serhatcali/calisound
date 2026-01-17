// List all cities to check for duplicates
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAllCities() {
  console.log('🔍 Fetching all cities...\n')

  try {
    const { data: cities, error } = await supabase
      .from('cities')
      .select('id, name, slug, country, region')
      .order('name')

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    if (!cities || cities.length === 0) {
      console.log('⚠️ No cities found')
      return
    }

    console.log(`📊 Found ${cities.length} cities:\n`)
    
    cities.forEach((city, index) => {
      console.log(`${index + 1}. ${city.name} (slug: ${city.slug}) - ${city.country}, ${city.region}`)
    })

    // Check for potential duplicates
    console.log('\n🔍 Checking for potential duplicates...\n')
    
    const nameMap = new Map()
    cities.forEach(city => {
      const lowerName = city.name.toLowerCase()
      if (nameMap.has(lowerName)) {
        console.log(`⚠️ Potential duplicate: "${city.name}" (ID: ${city.id}) and "${nameMap.get(lowerName).name}" (ID: ${nameMap.get(lowerName).id})`)
      } else {
        nameMap.set(lowerName, city)
      }
    })

    // Check for Rio specifically
    const rioVariants = cities.filter(c => 
      c.name.toLowerCase().includes('rio') || 
      c.slug.toLowerCase().includes('rio')
    )
    
    if (rioVariants.length > 1) {
      console.log(`\n⚠️ Found ${rioVariants.length} Rio variants:`)
      rioVariants.forEach(city => {
        console.log(`   - ${city.name} (slug: ${city.slug}, ID: ${city.id})`)
      })
    } else if (rioVariants.length === 1) {
      console.log(`\n✅ Found 1 Rio variant: ${rioVariants[0].name} (slug: ${rioVariants[0].slug})`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

listAllCities()
