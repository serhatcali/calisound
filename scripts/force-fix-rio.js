// Force fix Rio de Janeiro duplicates
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'

const supabase = createClient(supabaseUrl, supabaseKey)

async function forceFixRio() {
  console.log('🔍 Finding all Rio de Janeiro entries...\n')

  try {
    // Get all cities with "Rio" in name or slug
    const { data: allCities, error: fetchError } = await supabase
      .from('cities')
      .select('*')
      .or('name.ilike.%Rio%,slug.ilike.%rio%')

    if (fetchError) {
      console.error('❌ Error fetching cities:', fetchError)
      return
    }

    if (!allCities || allCities.length === 0) {
      console.log('⚠️ No Rio cities found')
      return
    }

    console.log(`📊 Found ${allCities.length} Rio-related cities:\n`)
    allCities.forEach(city => {
      console.log(`   - ${city.name} (slug: ${city.slug}, ID: ${city.id})`)
    })

    // Find the one with correct slug (rio-de-janeiro)
    const correctCity = allCities.find(c => c.slug === 'rio-de-janeiro')
    const wrongCity = allCities.find(c => c.slug === 'rio' || (c.slug !== 'rio-de-janeiro' && c.name.toLowerCase().includes('rio')))

    if (!correctCity && !wrongCity) {
      console.log('\n✅ No duplicates found')
      return
    }

    if (correctCity && wrongCity) {
      console.log(`\n🔧 Found duplicates:`)
      console.log(`   Correct: ${correctCity.name} (slug: ${correctCity.slug}, ID: ${correctCity.id})`)
      console.log(`   Wrong: ${wrongCity.name} (slug: ${wrongCity.slug}, ID: ${wrongCity.id})`)

      // Merge data from wrong city to correct city if needed
      const updateData = {}
      if (wrongCity.youtube_full && !correctCity.youtube_full) {
        updateData.youtube_full = wrongCity.youtube_full
        console.log(`   📝 Will copy youtube_full`)
      }
      if (wrongCity.youtube_shorts && !correctCity.youtube_shorts) {
        updateData.youtube_shorts = wrongCity.youtube_shorts
        console.log(`   📝 Will copy youtube_shorts`)
      }
      if (wrongCity.cover_square_url && !correctCity.cover_square_url) {
        updateData.cover_square_url = wrongCity.cover_square_url
        console.log(`   📝 Will copy cover_square_url`)
      }
      if (wrongCity.banner_16x9_url && !correctCity.banner_16x9_url) {
        updateData.banner_16x9_url = wrongCity.banner_16x9_url
        console.log(`   📝 Will copy banner_16x9_url`)
      }
      if (wrongCity.shorts_9x16_url && !correctCity.shorts_9x16_url) {
        updateData.shorts_9x16_url = wrongCity.shorts_9x16_url
        console.log(`   📝 Will copy shorts_9x16_url`)
      }
      if (wrongCity.instagram && !correctCity.instagram) {
        updateData.instagram = wrongCity.instagram
        console.log(`   📝 Will copy instagram`)
      }
      if (wrongCity.tiktok && !correctCity.tiktok) {
        updateData.tiktok = wrongCity.tiktok
        console.log(`   📝 Will copy tiktok`)
      }
      if (wrongCity.spotify && !correctCity.spotify) {
        updateData.spotify = wrongCity.spotify
        console.log(`   📝 Will copy spotify`)
      }
      if (wrongCity.apple_music && !correctCity.apple_music) {
        updateData.apple_music = wrongCity.apple_music
        console.log(`   📝 Will copy apple_music`)
      }
      if (wrongCity.description_en && !correctCity.description_en) {
        updateData.description_en = wrongCity.description_en
        console.log(`   📝 Will copy description_en`)
      }
      if (wrongCity.description_local && !correctCity.description_local) {
        updateData.description_local = wrongCity.description_local
        console.log(`   📝 Will copy description_local`)
      }

      // Update correct city if there's data to merge
      if (Object.keys(updateData).length > 0) {
        console.log(`\n🔄 Updating correct city with data from wrong city...`)
        const { error: updateError } = await supabase
          .from('cities')
          .update(updateData)
          .eq('id', correctCity.id)

        if (updateError) {
          console.error(`   ❌ Error updating:`, updateError)
        } else {
          console.log(`   ✅ Updated correct city`)
        }
      }

      // Delete wrong city
      console.log(`\n🗑️  Deleting wrong city (ID: ${wrongCity.id})...`)
      const { error: deleteError } = await supabase
        .from('cities')
        .delete()
        .eq('id', wrongCity.id)

      if (deleteError) {
        console.error(`   ❌ Error deleting:`, deleteError)
      } else {
        console.log(`   ✅ Deleted wrong city`)
      }
    } else if (wrongCity && !correctCity) {
      // Only wrong one exists, fix its slug
      console.log(`\n🔧 Found only wrong slug, fixing...`)
      console.log(`   Current: ${wrongCity.name} (slug: ${wrongCity.slug})`)
      console.log(`   Will change slug to: rio-de-janeiro`)

      const { error: updateError } = await supabase
        .from('cities')
        .update({ slug: 'rio-de-janeiro', name: 'Rio de Janeiro' })
        .eq('id', wrongCity.id)

      if (updateError) {
        console.error(`   ❌ Error updating:`, updateError)
      } else {
        console.log(`   ✅ Fixed slug and name`)
      }
    }

    // Final check
    console.log(`\n🔍 Final check...`)
    const { data: finalCheck } = await supabase
      .from('cities')
      .select('id, name, slug')
      .or('name.ilike.%Rio%,slug.ilike.%rio%')

    if (finalCheck) {
      console.log(`📊 Remaining Rio cities: ${finalCheck.length}`)
      finalCheck.forEach(city => {
        console.log(`   - ${city.name} (slug: ${city.slug})`)
      })
    }

    console.log(`\n✅ Done!`)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

forceFixRio()
