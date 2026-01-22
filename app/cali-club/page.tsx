import { Metadata } from 'next'
import { CaliClubClient } from '@/components/cali-club/CaliClubClient'

export const metadata: Metadata = {
  title: 'CALI Club - Virtual Concert Experience',
  description: 'Join CALI Club - Create your character, listen to music, and connect with others in real-time virtual concert experience.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function CaliClubPage() {
  return <CaliClubClient />
}
