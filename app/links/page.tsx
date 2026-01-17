import { Metadata } from 'next'
import { LinksPageClient } from '@/components/links/LinksPageClient'
import { getGlobalLinks } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Links - CALI Sound',
  description: 'All CALI Sound links in one place.',
}

export default async function LinksPage() {
  const links = await getGlobalLinks()

  return <LinksPageClient links={links} />
}
