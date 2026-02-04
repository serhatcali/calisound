-- Add source page and label to click tracking (hangi sayfadan tıklandı)
-- Run once in Supabase SQL Editor.

ALTER TABLE click_tracking
  ADD COLUMN IF NOT EXISTS source_page TEXT,
  ADD COLUMN IF NOT EXISTS source_label TEXT;

COMMENT ON COLUMN click_tracking.source_page IS 'Site path where click happened, e.g. /links, /city/istanbul';
COMMENT ON COLUMN click_tracking.source_label IS 'Human-readable source, e.g. Links Page, Home, City: Paris';

CREATE INDEX IF NOT EXISTS idx_click_tracking_source_page ON click_tracking(source_page);
CREATE INDEX IF NOT EXISTS idx_click_tracking_link_type ON click_tracking(link_type);
