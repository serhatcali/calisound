-- Simple UPDATE command for Global Links
-- Copy and paste this directly into Supabase SQL Editor

UPDATE global_links SET
  youtube = 'https://www.youtube.com/@calisound',
  instagram = 'https://www.instagram.com/cali.sound/',
  tiktok = 'https://www.tiktok.com/@cali.sound',
  spotify = 'https://open.spotify.com/intl-tr/artist/7znHq3X6LhflzUSTYawPaN?si=9k1Dg_1KS_uumTYBFY2UKA',
  apple_music = 'https://music.apple.com/tr/artist/cali-sound/1867501768?l=tr',
  soundcloud = 'https://soundcloud.com/cali-sound-116132115',
  x = 'https://x.com/CaliSoundOff',
  facebook = 'https://www.facebook.com/profile.php?id=61586337060502';

-- Check if update worked
SELECT * FROM global_links;
