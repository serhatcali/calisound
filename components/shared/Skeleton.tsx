'use client'

import { motion } from 'framer-motion'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}
    />
  )
}

export function CityCardSkeleton() {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-gray-800">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function SetCardSkeleton() {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-gray-900">
      <Skeleton className="aspect-video w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-screen flex items-center justify-center">
      <Skeleton className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center space-y-6 px-4">
        <Skeleton className="h-16 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto rounded-full" />
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="text-center mb-12 space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
    </div>
  )
}
