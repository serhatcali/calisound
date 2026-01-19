import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calisound.music'

export const metadata: Metadata = {
  title: 'Contact - CALI Sound',
  description: 'Get in touch with CALI Sound. Contact us for collaborations, press inquiries, bookings, and more. We\'d love to hear from you.',
  keywords: [
    'calisound',
    'afrohouse',
    'dj',
    'calimusic',
    'afrobeat',
    'cali sound',
    'contact',
    'booking',
    'collaboration',
  ],
  openGraph: {
    title: 'Contact - CALI Sound',
    description: 'Get in touch with CALI Sound. Contact us for collaborations, press inquiries, and bookings.',
    url: `${baseUrl}/contact`,
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
