import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CALI Sound - Global Afro House City Series',
    short_name: 'CALI Sound',
    description: 'Experience the world through Afro House music. CALI Sound brings you city-inspired melodic club music from around the globe.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#f97316',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['music', 'entertainment'],
  }
}
