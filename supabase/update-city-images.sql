-- Update missing city images in Supabase
-- Run this in Supabase SQL Editor

-- Update Delhi images
UPDATE cities 
SET 
  cover_square_url = 'https://images.unsplash.com/photo-1587474260584-136574028703?w=3000&h=3000&fit=crop&q=80',
  banner_16x9_url = 'https://images.unsplash.com/photo-1587474260584-136574028703?w=1920&h=1080&fit=crop&q=80',
  shorts_9x16_url = 'https://images.unsplash.com/photo-1587474260584-136574028703?w=1080&h=1920&fit=crop&q=80'
WHERE slug = 'delhi';

-- Update Cairo images
UPDATE cities 
SET 
  cover_square_url = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=3000&h=3000&fit=crop&q=80',
  banner_16x9_url = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1920&h=1080&fit=crop&q=80',
  shorts_9x16_url = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1080&h=1920&fit=crop&q=80'
WHERE slug = 'cairo';

-- Update Madrid images
UPDATE cities 
SET 
  cover_square_url = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d2?w=3000&h=3000&fit=crop&q=80',
  banner_16x9_url = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d2?w=1920&h=1080&fit=crop&q=80',
  shorts_9x16_url = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d2?w=1080&h=1920&fit=crop&q=80'
WHERE slug = 'madrid';

-- Update Amsterdam images
UPDATE cities 
SET 
  cover_square_url = 'https://images.unsplash.com/photo-1534351590666-13e3c96a0852?w=3000&h=3000&fit=crop&q=80',
  banner_16x9_url = 'https://images.unsplash.com/photo-1534351590666-13e3c96a0852?w=1920&h=1080&fit=crop&q=80',
  shorts_9x16_url = 'https://images.unsplash.com/photo-1534351590666-13e3c96a0852?w=1080&h=1920&fit=crop&q=80'
WHERE slug = 'amsterdam';

-- Verify updates
SELECT name, slug, cover_square_url IS NOT NULL as has_cover_image 
FROM cities 
WHERE slug IN ('delhi', 'cairo', 'madrid', 'amsterdam')
ORDER BY name;
