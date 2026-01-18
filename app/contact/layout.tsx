import { Metadata } from 'next'

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
    url: 'https://calisound.com/contact',
  },
  alternates: {
    canonical: 'https://calisound.com/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
