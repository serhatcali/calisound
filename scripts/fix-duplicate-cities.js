// Fix duplicate cities (e.g., Rio and Rio de Janeiro)
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwwqidqtoxwrsgxgapnb.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D2MeFa-jB1mJ29OBzianIQ_wPvFjav7'

const supabase = createClient(supabaseUrl, supabaseKey)

// City name and slug mappings - keep the full name/slug, remove the short one
const cityMappings = {
  'Rio': 'Rio de Janeiro',
  // Add more mappings here if needed
}

// Slug mappings - map short slugs to full slugs
const slugMappings = {
  'rio': 'rio-de-janeiro',
  // Add more mappings here if needed
}

async function fixDuplicateCities() {
  console.log('🔍 Checking for duplicate cities...\n')

  try {
    // Get all cities
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (error) {
      console.error('❌ Error fetching cities:', error)
      return
    }

    if (!cities || cities.length === 0) {
      console.log('⚠️ No cities found')
      return
    }

    console.log(`📊 Found ${cities.length} cities\n`)

    // First, check for duplicate slugs (same name, different slugs)
    const nameGroups = new Map()
    cities.forEach(city => {
      const key = city.name.toLowerCase()
      if (!nameGroups.has(key)) {
        nameGroups.set(key, [])
      }
      nameGroups.get(key).push(city)
    })

    for (const [nameKey, cityGroup] of nameGroups.entries()) {
      if (cityGroup.length > 1) {
        console.log(`🔧 Found ${cityGroup.length} cities with same name: "${cityGroup[0].name}"`)
        
        // Find the one with the correct slug
        let keepCity = null
        let removeCity = null

        // Check if any has the correct slug from mappings
        for (const city of cityGroup) {
          const correctSlug = slugMappings[city.slug.toLowerCase()]
          if (correctSlug && city.slug.toLowerCase() !== correctSlug) {
            // This city has wrong slug, find the one with correct slug
            const correctCity = cityGroup.find(c => c.slug.toLowerCase() === correctSlug)
            if (correctCity) {
              keepCity = correctCity
              removeCity = city
              break
            }
          }
        }

        // If no mapping found, keep the one with longer/more standard slug
        if (!keepCity) {
          cityGroup.sort((a, b) => b.slug.length - a.slug.length)
          keepCity = cityGroup[0]
          removeCity = cityGroup[1]
        }

        if (keepCity && removeCity) {
          console.log(`   Keeping: "${keepCity.name}" (slug: ${keepCity.slug}, ID: ${keepCity.id})`)
          console.log(`   Removing: "${removeCity.name}" (slug: ${removeCity.slug}, ID: ${removeCity.id})`)

          // Merge data if needed
          const shouldKeepFull = keepCity.youtube_full || keepCity.cover_square_url || keepCity.banner_16x9_url
          const shouldKeepShort = removeCity.youtube_full || removeCity.cover_square_url || removeCity.banner_16x9_url

          if (shouldKeepShort && !shouldKeepFull) {
            console.log(`   ⚠️ Short slug city has more data, updating...`)
            
            const updateData = {}
            if (removeCity.youtube_full && !keepCity.youtube_full) updateData.youtube_full = removeCity.youtube_full
            if (removeCity.youtube_shorts && !keepCity.youtube_shorts) updateData.youtube_shorts = removeCity.youtube_shorts
            if (removeCity.cover_square_url && !keepCity.cover_square_url) updateData.cover_square_url = removeCity.cover_square_url
            if (removeCity.banner_16x9_url && !keepCity.banner_16x9_url) updateData.banner_16x9_url = removeCity.banner_16x9_url
            if (removeCity.shorts_9x16_url && !keepCity.shorts_9x16_url) updateData.shorts_9x16_url = removeCity.shorts_9x16_url
            if (removeCity.instagram && !keepCity.instagram) updateData.instagram = removeCity.instagram
            if (removeCity.tiktok && !keepCity.tiktok) updateData.tiktok = removeCity.tiktok
            if (removeCity.spotify && !keepCity.spotify) updateData.spotify = removeCity.spotify
            if (removeCity.apple_music && !keepCity.apple_music) updateData.apple_music = removeCity.apple_music
            if (removeCity.description_en && !keepCity.description_en) updateData.description_en = removeCity.description_en
            if (removeCity.description_local && !keepCity.description_local) updateData.description_local = removeCity.description_local

            if (Object.keys(updateData).length > 0) {
              const { error: updateError } = await supabase
                .from('cities')
                .update(updateData)
                .eq('id', keepCity.id)

              if (updateError) {
                console.error(`   ❌ Error updating city:`, updateError)
              } else {
                console.log(`   ✅ Updated city with removed city's data`)
              }
            }
          }

          // Delete the duplicate
          const { error: deleteError } = await supabase
            .from('cities')
            .delete()
            .eq('id', removeCity.id)

          if (deleteError) {
            console.error(`   ❌ Error deleting duplicate:`, deleteError)
          } else {
            console.log(`   ✅ Deleted duplicate city\n`)
          }
        }
      }
    }

    // Find duplicates based on name mappings
    for (const [shortName, fullName] of Object.entries(cityMappings)) {
      const shortCity = cities.find(c => c.name === shortName)
      const fullCity = cities.find(c => c.name === fullName)

      if (shortCity && fullCity) {
        console.log(`🔧 Found duplicate: "${shortName}" and "${fullName}"`)
        console.log(`   Keeping: "${fullName}" (ID: ${fullCity.id})`)
        console.log(`   Removing: "${shortName}" (ID: ${shortCity.id})`)

        // Merge data if needed (keep the one with more data)
        const shouldKeepFull = fullCity.youtube_full || fullCity.cover_square_url || fullCity.banner_16x9_url
        const shouldKeepShort = shortCity.youtube_full || shortCity.cover_square_url || shortCity.banner_16x9_url

        if (shouldKeepShort && !shouldKeepFull) {
          console.log(`   ⚠️ Short name has more data, updating full name city...`)
          
          // Update full city with short city's data
          const updateData = {}
          if (shortCity.youtube_full && !fullCity.youtube_full) updateData.youtube_full = shortCity.youtube_full
          if (shortCity.youtube_shorts && !fullCity.youtube_shorts) updateData.youtube_shorts = shortCity.youtube_shorts
          if (shortCity.cover_square_url && !fullCity.cover_square_url) updateData.cover_square_url = shortCity.cover_square_url
          if (shortCity.banner_16x9_url && !fullCity.banner_16x9_url) updateData.banner_16x9_url = shortCity.banner_16x9_url
          if (shortCity.shorts_9x16_url && !fullCity.shorts_9x16_url) updateData.shorts_9x16_url = shortCity.shorts_9x16_url
          if (shortCity.instagram && !fullCity.instagram) updateData.instagram = shortCity.instagram
          if (shortCity.tiktok && !fullCity.tiktok) updateData.tiktok = shortCity.tiktok
          if (shortCity.spotify && !fullCity.spotify) updateData.spotify = shortCity.spotify
          if (shortCity.apple_music && !fullCity.apple_music) updateData.apple_music = shortCity.apple_music
          if (shortCity.description_en && !fullCity.description_en) updateData.description_en = shortCity.description_en
          if (shortCity.description_local && !fullCity.description_local) updateData.description_local = shortCity.description_local

          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('cities')
              .update(updateData)
              .eq('id', fullCity.id)

            if (updateError) {
              console.error(`   ❌ Error updating full city:`, updateError)
            } else {
              console.log(`   ✅ Updated full city with short city's data`)
            }
          }
        }

        // Delete the short name city
        const { error: deleteError } = await supabase
          .from('cities')
          .delete()
          .eq('id', shortCity.id)

        if (deleteError) {
          console.error(`   ❌ Error deleting short city:`, deleteError)
        } else {
          console.log(`   ✅ Deleted duplicate city "${shortName}"\n`)
        }
      } else if (shortCity && !fullCity) {
        // Only short name exists, rename it to full name
        console.log(`🔧 Found "${shortName}" but not "${fullName}"`)
        console.log(`   Renaming "${shortName}" to "${fullName}"`)

        const { error: updateError } = await supabase
          .from('cities')
          .update({ name: fullName })
          .eq('id', shortCity.id)

        if (updateError) {
          console.error(`   ❌ Error renaming city:`, updateError)
        } else {
          console.log(`   ✅ Renamed "${shortName}" to "${fullName}"\n`)
        }
      } else if (!shortCity && fullCity) {
        console.log(`✅ "${fullName}" exists, no duplicate found\n`)
      }
    }

    console.log('✅ Duplicate check complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixDuplicateCities()
