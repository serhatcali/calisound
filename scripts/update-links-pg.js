// Update Global Links using PostgreSQL connection
const { Client } = require('pg')

// PostgreSQL connection string
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.uwwqidqtoxwrsgxgapnb.supabase.co:5432/postgres
// Kullanıcı şifreyi girmeli
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.uwwqidqtoxwrsgxgapnb.supabase.co:5432/postgres'

const updatedLinks = {
  youtube: 'https://www.youtube.com/@calisound',
  instagram: 'https://www.instagram.com/cali.sound/',
  tiktok: 'https://www.tiktok.com/@cali.sound',
  spotify: 'https://open.spotify.com/intl-tr/artist/7znHq3X6LhflzUSTYawPaN?si=9k1Dg_1KS_uumTYBFY2UKA',
  apple_music: 'https://music.apple.com/tr/artist/cali-sound/1867501768?l=tr',
  soundcloud: 'https://soundcloud.com/cali-sound-116132115',
  x: 'https://x.com/CaliSoundOff',
  facebook: 'https://www.facebook.com/profile.php?id=61586337060502'
}

async function updateLinks() {
  console.log('🔄 Connecting to Supabase PostgreSQL...')
  
  if (connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ ERROR: Please replace [YOUR-PASSWORD] with your actual password!')
    console.error('')
    console.error('Set DATABASE_URL environment variable:')
    console.error('  export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.uwwqidqtoxwrsgxgapnb.supabase.co:5432/postgres"')
    console.error('')
    console.error('Or run: DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.uwwqidqtoxwrsgxgapnb.supabase.co:5432/postgres" node scripts/update-links-pg.js')
    process.exit(1)
  }

  const client = new Client({
    connectionString: connectionString
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')
    console.log('')

    // Check if global_links table exists and has data
    console.log('📋 Checking existing links...')
    const checkResult = await client.query('SELECT * FROM global_links LIMIT 1')
    
    let result
    if (checkResult.rows.length > 0) {
      // Update existing row
      console.log('✅ Found existing row, updating...')
      result = await client.query(`
        UPDATE global_links SET
          youtube = $1,
          instagram = $2,
          tiktok = $3,
          spotify = $4,
          apple_music = $5,
          soundcloud = $6,
          x = $7,
          facebook = $8
        RETURNING *
      `, [
        updatedLinks.youtube,
        updatedLinks.instagram,
        updatedLinks.tiktok,
        updatedLinks.spotify,
        updatedLinks.apple_music,
        updatedLinks.soundcloud,
        updatedLinks.x,
        updatedLinks.facebook
      ])
    } else {
      // Insert new row
      console.log('➕ No existing row found, inserting...')
      result = await client.query(`
        INSERT INTO global_links (youtube, instagram, tiktok, spotify, apple_music, soundcloud, x, facebook)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        updatedLinks.youtube,
        updatedLinks.instagram,
        updatedLinks.tiktok,
        updatedLinks.spotify,
        updatedLinks.apple_music,
        updatedLinks.soundcloud,
        updatedLinks.x,
        updatedLinks.facebook
      ])
    }

    console.log('')
    console.log('✅ SUCCESS! Global links updated!')
    console.log('')
    console.log('📋 Updated links:')
    const row = result.rows[0]
    console.log('  ✅ YouTube:', row.youtube)
    console.log('  ✅ Instagram:', row.instagram)
    console.log('  ✅ TikTok:', row.tiktok)
    console.log('  ✅ Spotify:', row.spotify)
    console.log('  ✅ Apple Music:', row.apple_music)
    console.log('  ✅ SoundCloud:', row.soundcloud)
    console.log('  ✅ X (Twitter):', row.x)
    console.log('  ✅ Facebook:', row.facebook)
    console.log('')
    console.log('✨ Done! Refresh your website to see the changes.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === '28P01') {
      console.error('')
      console.error('Authentication failed. Please check your password.')
    } else if (error.code === '42P01') {
      console.error('')
      console.error('Table "global_links" does not exist. Please run schema.sql first.')
    } else {
      console.error('')
      console.error('Error details:', error)
    }
  } finally {
    await client.end()
  }
}

updateLinks()
