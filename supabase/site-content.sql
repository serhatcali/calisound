-- Site Content Management Table
-- Stores all editable text content across the site

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY, -- Unique identifier (e.g., 'hero_title', 'footer_copyright')
  key TEXT UNIQUE NOT NULL, -- Human-readable key (e.g., 'hero_title')
  section TEXT NOT NULL, -- Section name (e.g., 'hero', 'footer', 'faq')
  label TEXT NOT NULL, -- Display label for admin UI
  content_en TEXT NOT NULL, -- English content
  content_local TEXT, -- Localized content (optional)
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'textarea', 'html', 'rich_text')),
  description TEXT, -- Help text for admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_updated_at();

-- Insert default content keys
INSERT INTO site_content (id, key, section, label, content_en, content_type, description) VALUES
  -- Hero Section
  ('hero_title', 'hero_title', 'hero', 'Hero Title', 'CALI Sound - Global Afro House City Series', 'text', 'Main title on homepage hero section'),
  ('hero_subtitle', 'hero_subtitle', 'hero', 'Hero Subtitle', 'Experience the world through Afro House music', 'text', 'Subtitle below main title'),
  ('hero_description', 'hero_description', 'hero', 'Hero Description', 'CALI Sound brings you city-inspired melodic club music from around the globe.', 'textarea', 'Description text in hero section'),
  ('hero_cta', 'hero_cta', 'hero', 'Hero CTA Button', 'Explore Cities', 'text', 'Call-to-action button text'),
  
  -- Footer
  ('footer_description', 'footer_description', 'footer', 'Footer Description', 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.', 'textarea', 'Footer description text'),
  ('footer_copyright', 'footer_copyright', 'footer', 'Copyright Text', '© 2024 CALI Sound. All rights reserved.', 'text', 'Copyright notice in footer'),
  
  -- Newsletter
  ('newsletter_title', 'newsletter_title', 'newsletter', 'Newsletter Title', 'Stay Updated', 'text', 'Newsletter popup title'),
  ('newsletter_description', 'newsletter_description', 'newsletter', 'Newsletter Description', 'Get the latest updates on new cities, DJ sets, and exclusive content.', 'textarea', 'Newsletter popup description'),
  ('newsletter_button', 'newsletter_button', 'newsletter', 'Subscribe Button', 'Subscribe', 'text', 'Newsletter subscribe button text'),
  
  ('newsletter_success', 'newsletter_success', 'newsletter', 'Success Message', 'Thank you for subscribing!', 'text', 'Message shown after successful subscription'),
  
  -- Cookie Consent
  ('cookie_title', 'cookie_title', 'cookie', 'Cookie Banner Title', 'We use cookies', 'text', 'Cookie consent banner title'),
  ('cookie_description', 'cookie_description', 'cookie', 'Cookie Description', 'We use cookies to enhance your browsing experience and analyze site traffic.', 'textarea', 'Cookie consent description'),
  ('cookie_accept', 'cookie_accept', 'cookie', 'Accept Button', 'Accept', 'text', 'Cookie accept button text'),
  ('cookie_decline', 'cookie_decline', 'cookie', 'Decline Button', 'Decline', 'text', 'Cookie decline button text'),
  
  -- Contact Page
  ('contact_title', 'contact_title', 'contact', 'Contact Page Title', 'Get in Touch', 'text', 'Contact page main title'),
  ('contact_description', 'contact_description', 'contact', 'Contact Description', 'Have a question or want to collaborate? We&apos;d love to hear from you.', 'textarea', 'Contact page description'),
  ('contact_form_name', 'contact_form_name', 'contact', 'Name Field Label', 'Name', 'text', 'Contact form name field label'),
  ('contact_form_email', 'contact_form_email', 'contact', 'Email Field Label', 'Email', 'text', 'Contact form email field label'),
  ('contact_form_subject', 'contact_form_subject', 'contact', 'Subject Field Label', 'Subject', 'text', 'Contact form subject field label'),
  ('contact_form_message', 'contact_form_message', 'contact', 'Message Field Label', 'Message', 'text', 'Contact form message field label'),
  ('contact_form_submit', 'contact_form_submit', 'contact', 'Submit Button', 'Send Message', 'text', 'Contact form submit button text'),
  ('contact_success', 'contact_success', 'contact', 'Success Message', 'Thank you! Your message has been sent.', 'text', 'Message shown after successful form submission'),
  
  -- FAQ
  ('faq_title', 'faq_title', 'faq', 'FAQ Page Title', 'Frequently Asked Questions', 'text', 'FAQ page main title'),
  ('faq_description', 'faq_description', 'faq', 'FAQ Description', 'Find answers to common questions about CALI Sound, Afro House music, and the Global City Series.', 'textarea', 'FAQ page description'),
  
  -- General
  ('site_tagline', 'site_tagline', 'general', 'Site Tagline', 'Global Afro House City Series', 'text', 'Main site tagline'),
  ('loading_text', 'loading_text', 'general', 'Loading Text', 'Loading...', 'text', 'Text shown during page loading'),
  ('error_404_title', 'error_404_title', 'general', '404 Error Title', 'Page Not Found', 'text', '404 error page title'),
  ('error_404_message', 'error_404_message', 'general', '404 Error Message', 'The page you are looking for does not exist.', 'text', '404 error page message'),
  ('error_500_title', 'error_500_title', 'general', '500 Error Title', 'Server Error', 'text', '500 error page title'),
  ('error_500_message', 'error_500_message', 'general', '500 Error Message', 'Something went wrong. Please try again later.', 'text', '500 error page message')
ON CONFLICT (id) DO NOTHING;
