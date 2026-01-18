'use client'

import { StructuredData } from './StructuredData'

interface VideoSchemaProps {
  name: string
  description: string
  thumbnailUrl?: string
  videoUrl: string
  uploadDate?: string
  duration?: string
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  videoUrl,
  uploadDate,
  duration,
}: VideoSchemaProps) {
  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const videoId = extractVideoId(videoUrl)
  if (!videoId) return null

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    uploadDate: uploadDate || new Date().toISOString(),
    duration,
    contentUrl: videoUrl,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    publisher: {
      '@type': 'MusicGroup',
      name: 'CALI Sound',
      logo: {
        '@type': 'ImageObject',
        url: 'https://calisound.com/og-default.jpg',
      },
    },
  }

  return <StructuredData data={structuredData} />
}
