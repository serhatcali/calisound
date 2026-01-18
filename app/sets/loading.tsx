import { SetCardSkeleton, PageHeaderSkeleton } from '@/components/shared/Skeleton'

export default function SetsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
