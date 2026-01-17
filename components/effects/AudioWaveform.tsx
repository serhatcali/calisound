'use client'

import { useEffect, useRef, useState } from 'react'

interface AudioWaveformProps {
  width?: number
  height?: number
  color?: string
  bars?: number
}

export function AudioWaveform({
  width = 200,
  height = 60,
  color = 'rgba(99, 102, 241, 0.8)',
  bars = 20,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    const barWidth = width / bars
    const barHeights: number[] = Array(bars).fill(0).map(() => Math.random() * height)

    function animate() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerY = height / 2

      for (let i = 0; i < bars; i++) {
        if (isHovered) {
          barHeights[i] += (Math.random() * height * 0.8 - barHeights[i]) * 0.1
        } else {
          barHeights[i] += (Math.random() * height * 0.3 - barHeights[i]) * 0.05
        }

        const barHeight = Math.max(2, barHeights[i])

        ctx.fillStyle = color
        ctx.fillRect(
          i * barWidth + barWidth * 0.2,
          centerY - barHeight / 2,
          barWidth * 0.6,
          barHeight
        )
      }

      requestAnimationFrame(animate)
    }

    animate()
  }, [width, height, color, bars, isHovered])

  return (
    <canvas
      ref={canvasRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full h-full"
    />
  )
}
