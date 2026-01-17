-- Update Global Links with Real URLs
-- Run this in Supabase SQL Editor

-- Method 1: Update if exists, insert if not (UPSERT)
INSERT INTO global_links (youtube, instagram, tiktok, spotify, apple_music, soundcloud, x, facebook)
VALUES (
  'https://www.youtube.com/@calisound',
  'https://www.instagram.com/cali.sound/',
  'https://www.tiktok.com/@cali.sound',
  'https://open.spotify.com/intl-tr/artist/7znHq3X6LhflzUSTYawPaN?si=9k1Dg_1KS_uumTYBFY2UKA',
  'https://music.apple.com/tr/artist/cali-sound/1867501768?l=tr',
  'https://soundcloud.com/cali-sound-116132115',
  'https://x.com/CaliSoundOff',
  'https://www.facebook.com/profile.php?id=61586337060502'
)
ON CONFLICT (id) DO UPDATE SET
  youtube = EXCLUDED.youtube,
  instagram = EXCLUDED.instagram,
  tiktok = EXCLUDED.tiktok,
  spotify = EXCLUDED.spotify,
  apple_music = EXCLUDED.apple_music,
  soundcloud = EXCLUDED.soundcloud,
  x = EXCLUDED.x,
  facebook = EXCLUDED.facebook;

-- Alternative Method 2: If the above doesn't work, use this:
-- UPDATE global_links SET
--   youtube = 'https://www.youtube.com/@calisound',
--   instagram = 'https://www.instagram.com/cali.sound/',
--   tiktok = 'https://www.tiktok.com/@cali.sound',
--   spotify = 'https://open.spotify.com/intl-tr/artist/7znHq3X6LhflzUSTYawPaN?si=9k1Dg_1KS_uumTYBFY2UKA',
--   apple_music = 'https://music.apple.com/tr/artist/cali-sound/1867501768?l=tr',
--   soundcloud = 'https://soundcloud.com/cali-sound-116132115',
--   x = 'https://x.com/CaliSoundOff',
--   facebook = 'https://www.facebook.com/profile.php?id=61586337060502';

-- Verify the update
SELECT 
  youtube,
  instagram,
  tiktok,
  spotify,
  apple_music,
  soundcloud,
  x,
  facebook
FROM global_links;
