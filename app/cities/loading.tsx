import { CityCardSkeleton, PageHeaderSkeleton } from '@/components/shared/Skeleton'

export default function CitiesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CityCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
