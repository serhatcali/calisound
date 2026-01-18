'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipOffset = 8 // Distance from trigger element

      let top = 0
      let left = 0

      switch (position) {
        case 'top':
          top = rect.top - tooltipOffset
          left = rect.left + rect.width / 2
          break
        case 'bottom':
          top = rect.bottom + tooltipOffset
          left = rect.left + rect.width / 2
          break
        case 'left':
          top = rect.top + rect.height / 2
          left = rect.left - tooltipOffset
          break
        case 'right':
          top = rect.top + rect.height / 2
          left = rect.right + tooltipOffset
          break
      }

      setTooltipPosition({ top, left })
    }
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      
      const handleScroll = () => updatePosition()
      const handleResize = () => updatePosition()
      
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [isVisible, position])

  const positionClasses = {
    top: '-translate-y-full -translate-x-1/2',
    bottom: 'translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-r-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-b-0 border-l-0',
    left: 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-l-0 border-b-0',
    right: 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-r-0 border-t-0',
  }

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && mounted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`fixed ${positionClasses[position]} z-[99999] pointer-events-none`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="bg-black/95 backdrop-blur-xl border-2 border-gray-800 rounded-lg px-3 py-2 shadow-2xl">
            <p className="text-white text-xs font-medium whitespace-nowrap">{content}</p>
            <div
              className={`absolute w-2 h-2 bg-black border-2 border-gray-800 rotate-45 ${arrowClasses[position]}`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {mounted && createPortal(tooltipContent, document.body)}
    </>
  )
}
