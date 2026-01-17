import { HeroSkeleton } from '@/components/shared/Skeleton'

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <HeroSkeleton />
    </div>
  )
}
