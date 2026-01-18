'use client'

import { StructuredData } from './StructuredData'

interface Item {
  name: string
  url: string
  description?: string
  image?: string
}

interface ItemListSchemaProps {
  name: string
  description: string
  items: Item[]
}

export function ItemListSchema({ name, description, items }: ItemListSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'MusicRecording',
        name: item.name,
        url: item.url,
        ...(item.description && { description: item.description }),
        ...(item.image && {
          image: {
            '@type': 'ImageObject',
            url: item.image,
          },
        }),
      },
    })),
  }

  return <StructuredData data={structuredData} />
}
