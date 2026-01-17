'use client'

import { useState, useEffect } from 'react'
import { format, differenceInSeconds } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface CountdownTimerProps {
  releaseDate: string
}

export function CountdownTimer({ releaseDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // Parse the release date (assuming UTC+3)
        const release = new Date(releaseDate)
        const now = new Date()
        const diff = differenceInSeconds(release, now)

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          return
        }

        const days = Math.floor(diff / 86400)
        const hours = Math.floor((diff % 86400) / 3600)
        const minutes = Math.floor((diff % 3600) / 60)
        const seconds = diff % 60

        setTimeLeft({ days, hours, minutes, seconds })
      } catch (error) {
        console.error('Error calculating countdown:', error)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [releaseDate])

  if (!timeLeft) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
        <p className="text-sm">Loading countdown...</p>
      </div>
    )
  }

  const releaseDateFormatted = formatInTimeZone(
    new Date(releaseDate),
    'Europe/Istanbul',
    'MMMM d, yyyy • HH:mm'
  )

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
      <p className="text-white text-sm mb-4">Releases on {releaseDateFormatted}</p>
      <div className="flex gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-white/80">Days</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-xs text-white/80">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-xs text-white/80">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{timeLeft.seconds}</div>
          <div className="text-xs text-white/80">Seconds</div>
        </div>
      </div>
    </div>
  )
}
