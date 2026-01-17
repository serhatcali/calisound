-- CALI Sound Seed Data
-- Sample data for testing and development
-- Run this in Supabase SQL Editor after creating the schema

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE cities, sets, global_links, click_tracking CASCADE;

-- Insert Global Links (single row)
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
ON CONFLICT DO NOTHING;

-- Insert Sample Cities
INSERT INTO cities (
  name, slug, country, country_flag, region, mood, status, release_datetime,
  cover_square_url, banner_16x9_url, shorts_9x16_url,
  youtube_full, youtube_shorts, instagram, tiktok,
  description_en, description_local,
  yt_title, yt_description, yt_tags, hashtags
) VALUES
(
  'Rio de Janeiro', 'rio', 'Brazil', '🇧🇷', 'Americas',
  ARRAY['festival', 'sunset'], 'OUT_NOW',
  '2024-01-01 12:00:00+03:00',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=3000&h=3000&fit=crop',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1080&h=1920&fit=crop',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'https://instagram.com/p/calisound-rio',
  'https://tiktok.com/@calisound/video/rio',
  'Feel the rhythm of Rio de Janeiro. This festival-inspired Afro House mix captures the energy of Copacabana and the spirit of Brazilian music. Experience the vibrant colors, the samba beats, and the sunset vibes of this iconic city through melodic club sounds.',
  'Sinta o ritmo do Rio de Janeiro. Esta mistura de Afro House inspirada em festivais captura a energia de Copacabana e o espírito da música brasileira. Experimente as cores vibrantes, os ritmos de samba e as vibrações do pôr do sol desta cidade icônica através de sons de clube melódicos.',
  'CALI Sound: Rio de Janeiro | Afro House City Series',
  'Experience Rio de Janeiro through Afro House music. This mix captures the festival energy and Brazilian rhythms of one of the world''s most vibrant cities. From Copacabana to Ipanema, feel the warmth and passion of Rio through melodic club sounds.

Tracklist:
00:00 - Intro: Rio Sunrise
03:15 - Copacabana Vibes
08:30 - Samba House Fusion
14:45 - Sunset at Ipanema
20:00 - Carnival Energy
25:30 - Brazilian Melodies
30:00 - Outro: Rio Nights

Follow CALI Sound:
🎵 Spotify: https://open.spotify.com/artist/calisound
📷 Instagram: https://instagram.com/calisound
🎬 TikTok: https://tiktok.com/@calisound',
  'afro house,melodic house,rio de janeiro,brazil,electronic music,cali sound,club music,brazilian music,festival,house music,deep house,melodic techno',
  '#CALISound #Rio #AfroHouse #MelodicHouse #Brazil #ElectronicMusic #Festival #HouseMusic'
),
(
  'Dubai', 'dubai', 'United Arab Emirates', '🇦🇪', 'MENA',
  ARRAY['luxury', 'sunset'], 'OUT_NOW',
  '2024-01-15 12:00:00+03:00',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=3000&h=3000&fit=crop',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1080&h=1920&fit=crop',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'https://instagram.com/p/calisound-dubai',
  'https://tiktok.com/@calisound/video/dubai',
  'Experience the luxury and opulence of Dubai through Afro House. This mix captures the golden hour energy of the city, blending modern architecture with traditional Middle Eastern influences. Feel the warmth of the desert sun and the coolness of the Persian Gulf in every beat.',
  'اختبر الفخامة والترف في دبي من خلال Afro House. يمزج هذا المزيج بين طاقة الساعة الذهبية للمدينة، ويمزج بين العمارة الحديثة والتأثيرات الشرق أوسطية التقليدية. اشعر بدفء شمس الصحراء وبرودة الخليج العربي في كل إيقاع.',
  'CALI Sound: Dubai | Afro House City Series',
  'Experience Dubai through Afro House music. This mix captures the essence of luxury and sunset vibes in one of the world''s most modern cities.

Tracklist:
00:00 - Burj Al Arab Intro
04:20 - Desert Sunset
09:45 - Luxury Lounge
15:10 - Persian Gulf Breeze
20:35 - Modern Oasis
26:00 - Golden Hour
31:15 - Outro: Dubai Nights',
  'afro house,melodic house,dubai,uae,electronic music,cali sound,club music,house music,luxury,deep house',
  '#CALISound #Dubai #AfroHouse #MelodicHouse #UAE #ElectronicMusic #Luxury'
),
(
  'Rome', 'rome', 'Italy', '🇮🇹', 'Europe',
  ARRAY['luxury', 'deep'], 'OUT_NOW',
  '2024-02-01 12:00:00+03:00',
  'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=3000&h=3000&fit=crop',
  'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1080&h=1920&fit=crop',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'https://instagram.com/p/calisound-rome',
  'https://tiktok.com/@calisound/video/rome',
  'Discover the eternal city through deep Afro House rhythms. Ancient history meets modern electronic sounds in this immersive mix. Walk through the Colosseum, feel the energy of the Forum, and experience the timeless beauty of Rome.',
  'Scopri la città eterna attraverso i ritmi profondi dell''Afro House. La storia antica incontra i suoni elettronici moderni in questo mix coinvolgente. Cammina attraverso il Colosseo, senti l''energia del Foro e vivi la bellezza senza tempo di Roma.',
  'CALI Sound: Rome | Afro House City Series',
  'Experience Rome through Afro House music. Ancient meets modern in this deep melodic journey through the eternal city.

Tracklist:
00:00 - Colosseum Dawn
05:30 - Forum Vibes
11:15 - Vatican Echoes
17:00 - Tiber River Flow
22:45 - Trastevere Nights
28:30 - Outro: Eternal City',
  'afro house,deep house,rome,italy,electronic music,cali sound,melodic house,deep melodic,house music',
  '#CALISound #Rome #AfroHouse #DeepHouse #Italy #ElectronicMusic'
),
(
  'Amsterdam', 'amsterdam', 'Netherlands', '🇳🇱', 'Europe',
  ARRAY['festival', 'sunset'], 'OUT_NOW',
  '2024-02-15 12:00:00+03:00',
  'https://images.unsplash.com/photo-1534351590666-13e3c96a0852?w=3000&h=3000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534351590666-13e3c96a0852?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534351590666-13e3c96a0852?w=1080&h=1920&fit=crop&q=80',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'https://instagram.com/p/calisound-amsterdam',
  'https://tiktok.com/@calisound/video/amsterdam',
  'Feel the festival energy of Amsterdam. This mix celebrates the city''s vibrant electronic music scene with uplifting Afro House beats. From the canals to the clubs, experience the freedom and creativity of Amsterdam.',
  'Voel de festivalenergie van Amsterdam. Deze mix viert de levendige elektronische muziekscène van de stad met opzwepende Afro House beats. Van de grachten tot de clubs, ervaar de vrijheid en creativiteit van Amsterdam.',
  'CALI Sound: Amsterdam | Afro House City Series',
  'Experience Amsterdam through Afro House music. Festival vibes and sunset energy in the city of canals.

Tracklist:
00:00 - Canal Sunrise
04:45 - Festival Energy
10:20 - Red Light District Vibes
16:00 - Vondelpark Sunset
21:35 - Club Scene
27:10 - Outro: Amsterdam Nights',
  'afro house,festival,amsterdam,netherlands,electronic music,cali sound,club music,house music,melodic house',
  '#CALISound #Amsterdam #AfroHouse #Festival #Netherlands #ElectronicMusic'
),
(
  'Istanbul', 'istanbul', 'Turkey', '🇹🇷', 'MENA',
  ARRAY['deep', 'sunset'], 'OUT_NOW',
  '2024-03-01 12:00:00+03:00',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=3000&h=3000&fit=crop',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1080&h=1920&fit=crop',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'https://instagram.com/p/calisound-istanbul',
  'https://tiktok.com/@calisound/video/istanbul',
  'Where East meets West. This deep Afro House mix captures the mystical energy of Istanbul, blending cultures and sounds. From the Bosphorus to the Grand Bazaar, experience the magic of this unique city.',
  'Doğu''nun Batı ile buluştuğu yer. Bu derin Afro House karışımı, kültürleri ve sesleri harmanlayarak İstanbul''un mistik enerjisini yakalıyor. Boğaz''dan Kapalıçarşı''ya, bu eşsiz şehrin büyüsünü yaşayın.',
  'CALI Sound: Istanbul | Afro House City Series',
  'Experience Istanbul through Afro House music. Where cultures collide in deep melodic sounds.

Tracklist:
00:00 - Bosphorus Bridge
05:15 - Hagia Sophia Echoes
11:30 - Grand Bazaar Rhythms
17:45 - Galata Tower Sunset
23:20 - Spice Market Vibes
29:00 - Outro: Istanbul Nights',
  'afro house,deep house,istanbul,turkey,electronic music,cali sound,melodic house,deep melodic',
  '#CALISound #Istanbul #AfroHouse #DeepHouse #Turkey #ElectronicMusic'
),
(
  'Madrid', 'madrid', 'Spain', '🇪🇸', 'Europe',
  ARRAY['festival', 'luxury'], 'OUT_NOW',
  '2024-03-15 12:00:00+03:00',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d2?w=3000&h=3000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d2?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d2?w=1080&h=1920&fit=crop&q=80',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ',
  'https://instagram.com/p/calisound-madrid',
  'https://tiktok.com/@calisound/video/madrid',
  'Experience the vibrant nightlife of Madrid through energetic Afro House. This mix captures the city''s passion for music and celebration. From tapas bars to rooftop clubs, feel the energy of Spain''s capital.',
  'Experimenta la vibrante vida nocturna de Madrid a través del Afro House enérgico. Esta mezcla captura la pasión de la ciudad por la música y la celebración. Desde bares de tapas hasta clubes en la azotea, siente la energía de la capital de España.',
  'CALI Sound: Madrid | Afro House City Series',
  'Experience Madrid through Afro House music. Vibrant nightlife and festival energy in the Spanish capital.

Tracklist:
00:00 - Retiro Park Intro
04:30 - Puerta del Sol
10:15 - Gran Via Energy
16:00 - Rooftop Sunset
21:45 - Tapas & Beats
27:30 - Outro: Madrid Nights',
  'afro house,festival,madrid,spain,electronic music,cali sound,club music,house music,melodic house',
  '#CALISound #Madrid #AfroHouse #Festival #Spain #ElectronicMusic'
),
(
  'Beijing', 'beijing', 'China', '🇨🇳', 'Asia',
  ARRAY['deep', 'luxury'], 'SOON',
  '2024-04-01 12:00:00+03:00',
  'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=3000&h=3000&fit=crop',
  'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1080&h=1920&fit=crop',
  NULL, NULL, NULL, NULL,
  'Coming soon: Discover the ancient capital through deep Afro House. Traditional meets modern in this upcoming release. Experience the Forbidden City, the Great Wall, and the modern skyline through melodic sounds.',
  '即将推出：通过深沉的 Afro House 探索古都。传统与现代在这即将发布的版本中相遇。通过旋律声音体验紫禁城、长城和现代天际线。',
  'CALI Sound: Beijing | Afro House City Series',
  'Experience Beijing through Afro House music. Ancient traditions meet modern sounds in the Chinese capital.

Coming soon - April 2024',
  'afro house,deep house,beijing,china,electronic music,cali sound,melodic house,deep melodic',
  '#CALISound #Beijing #AfroHouse #DeepHouse #China #ElectronicMusic'
),
(
  'Cairo', 'cairo', 'Egypt', '🇪🇬', 'MENA',
  ARRAY['sunset', 'deep'], 'SOON',
  '2024-04-15 12:00:00+03:00',
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=3000&h=3000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1080&h=1920&fit=crop&q=80',
  NULL, NULL, NULL, NULL,
  'Coming soon: Journey through the city of a thousand minarets with deep Afro House rhythms. Experience the Nile, the Pyramids, and the ancient mystique of Cairo through melodic electronic sounds.',
  'قريباً: سافر عبر مدينة الألف مئذنة بإيقاعات Afro House العميقة. اختبر النيل والأهرامات والغموض القديم لمدينة القاهرة من خلال الأصوات الإلكترونية اللحنية.',
  'CALI Sound: Cairo | Afro House City Series',
  'Experience Cairo through Afro House music. Ancient mystique meets modern beats in the city of a thousand minarets.

Coming soon - April 2024',
  'afro house,deep house,cairo,egypt,electronic music,cali sound,melodic house,deep melodic',
  '#CALISound #Cairo #AfroHouse #DeepHouse #Egypt #ElectronicMusic'
),
(
  'Delhi', 'delhi', 'India', '🇮🇳', 'Asia',
  ARRAY['festival', 'sunset'], 'SOON',
  '2024-05-01 12:00:00+03:00',
  'https://images.unsplash.com/photo-1587474260584-136574028703?w=3000&h=3000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587474260584-136574028703?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587474260584-136574028703?w=1080&h=1920&fit=crop&q=80',
  NULL, NULL, NULL, NULL,
  'Coming soon: Experience the colors and sounds of Delhi through vibrant Afro House. From the Red Fort to modern New Delhi, feel the energy of India''s capital through festival-inspired beats.',
  'जल्द ही: जीवंत Afro House के माध्यम से दिल्ली के रंगों और ध्वनियों का अनुभव करें। लाल किले से लेकर आधुनिक नई दिल्ली तक, त्योहार से प्रेरित बीट्स के माध्यम से भारत की राजधानी की ऊर्जा महसूस करें।',
  'CALI Sound: Delhi | Afro House City Series',
  'Experience Delhi through Afro House music. Colors, sounds, and festival energy in India''s capital.

Coming soon - May 2024',
  'afro house,festival,delhi,india,electronic music,cali sound,club music,house music,melodic house',
  '#CALISound #Delhi #AfroHouse #Festival #India #ElectronicMusic'
),
(
  'Tokyo', 'tokyo', 'Japan', '🇯🇵', 'Asia',
  ARRAY['luxury', 'deep'], 'SOON',
  '2024-05-15 12:00:00+03:00',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=3000&h=3000&fit=crop',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1080&h=1920&fit=crop',
  NULL, NULL, NULL, NULL,
  'Coming soon: Discover Tokyo through deep Afro House. Where tradition meets innovation, experience the neon lights, the temples, and the cutting-edge electronic scene of Japan''s capital.',
  '近日公開：深いAfro Houseを通じて東京を発見。伝統と革新が出会う場所で、ネオンライト、寺院、そして日本の首都の最先端の電子シーンを体験してください。',
  'CALI Sound: Tokyo | Afro House City Series',
  'Experience Tokyo through Afro House music. Tradition meets innovation in Japan''s capital.

Coming soon - May 2024',
  'afro house,deep house,tokyo,japan,electronic music,cali sound,melodic house,deep melodic',
  '#CALISound #Tokyo #AfroHouse #DeepHouse #Japan #ElectronicMusic'
),
(
  'New York', 'new-york', 'United States', '🇺🇸', 'Americas',
  ARRAY['festival', 'luxury'], 'SOON',
  '2024-06-01 12:00:00+03:00',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=3000&h=3000&fit=crop',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1080&h=1920&fit=crop',
  NULL, NULL, NULL, NULL,
  'Coming soon: Feel the energy of the city that never sleeps through festival Afro House. From Times Square to Brooklyn, experience the diversity and energy of New York.',
  'Próximamente: Siente la energía de la ciudad que nunca duerme a través del Afro House de festival. Desde Times Square hasta Brooklyn, experimenta la diversidad y energía de Nueva York.',
  'CALI Sound: New York | Afro House City Series',
  'Experience New York through Afro House music. The city that never sleeps in festival energy.

Coming soon - June 2024',
  'afro house,festival,new york,usa,electronic music,cali sound,club music,house music',
  '#CALISound #NewYork #AfroHouse #Festival #USA #ElectronicMusic'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample DJ Sets
INSERT INTO sets (title, youtube_embed, duration, chapters, description)
VALUES 
(
  'CALI Sound Global Mix - 32 Minutes',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  '32:00',
  '00:00 Intro - Rio de Janeiro
00:05 Dubai Luxury Vibes
05:20 Rome Deep Journey
08:15 Amsterdam Festival Energy
12:30 Istanbul Sunset
15:45 Madrid Nightlife
20:00 Rio Carnival Finale
25:30 Global Fusion
28:00 Outro - CALI Sound',
  'A 32-minute journey through the CALI Sound Global Afro House City Series. This mix features highlights from multiple cities, creating a seamless global experience. From the beaches of Rio to the skyscrapers of Dubai, experience the world through melodic club sounds.'
),
(
  'CALI Sound Deep Sessions - 45 Minutes',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  '45:00',
  '00:00 Deep Intro
05:15 Rome Ancient Vibes
12:30 Istanbul Mystical Journey
18:45 Deep House Interlude
25:00 Beijing Preview
30:15 Cairo Deep Sunset
36:30 Tokyo Deep Nights
42:00 Outro',
  'A deeper journey into the CALI Sound universe. This 45-minute mix focuses on the deep and luxurious side of Afro House, perfect for late-night listening or sunset sessions.'
),
(
  'CALI Sound Festival Mix - 60 Minutes',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  '60:00',
  '00:00 Festival Intro
08:00 Rio Carnival Energy
15:30 Amsterdam Festival Vibes
23:45 Madrid Nightlife
32:00 Delhi Colors
40:15 New York Energy
48:30 Global Festival Finale
55:00 Outro',
  'The ultimate festival mix from CALI Sound. 60 minutes of high-energy Afro House perfect for parties, festivals, and celebrations. Feel the energy of cities around the world in one continuous mix.'
)
ON CONFLICT DO NOTHING;
