'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Release, PlatformPlan } from '@/types/release-planning'
import { PLATFORM_LABELS } from '@/types/release-planning'

interface ReleasesCalendarProps {
  releases: Release[]
  platformPlans?: Record<string, PlatformPlan[]> // release_id -> platform plans
  onPlanUpdate?: () => void // Callback to refresh data after update
}

type ViewMode = 'month' | 'week'

// Safe date formatting
function formatDate(date: Date, formatStr: string): string {
  if (formatStr === 'MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  if (formatStr === 'HH:mm') {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }
  return date.toLocaleDateString('en-US')
}

export function ReleasesCalendar({ releases, platformPlans = {}, onPlanUpdate }: ReleasesCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [draggedPlan, setDraggedPlan] = useState<PlatformPlan | null>(null)
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null)
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null)

  // Get first and last day of current month/week
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
    return new Date(d.setDate(diff))
  }

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return end
  }

  const startDate = viewMode === 'month' ? getMonthStart(currentDate) : getWeekStart(currentDate)
  const endDate = viewMode === 'month' ? getMonthEnd(currentDate) : getWeekEnd(currentDate)

  // Get all dates in range
  const dates: Date[] = []
  const current = new Date(startDate)
  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const events: Array<{ type: 'release' | 'platform'; data: any }> = []

    // Releases on this date
    releases.forEach(release => {
      const releaseDate = new Date(release.release_at)
      if (releaseDate.toISOString().split('T')[0] === dateStr) {
        events.push({
          type: 'release',
          data: release,
        })
      }
    })

    // Platform plans on this date
    Object.entries(platformPlans).forEach(([releaseId, plans]) => {
      plans.forEach(plan => {
        const planDate = new Date(plan.planned_at)
        if (planDate.toISOString().split('T')[0] === dateStr) {
          events.push({
            type: 'platform',
            data: plan,
          })
        }
      })
    })

    return events
  }

  // Navigate months/weeks
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, plan: PlatformPlan) => {
    setDraggedPlan(plan)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', plan.id)
  }

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(date)
  }

  const handleDragLeave = () => {
    setDragOverDate(null)
  }

  const handleDrop = useCallback(async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverDate(null)

    // Get plan ID from dataTransfer (more reliable than state)
    const planId = e.dataTransfer.getData('text/plain')
    if (!planId) {
      console.error('[DragDrop] No plan ID in dataTransfer')
      return
    }

    // Find the plan from platformPlans
    let planToUpdate: PlatformPlan | null = null
    for (const [releaseId, plans] of Object.entries(platformPlans)) {
      const found = plans.find(p => p.id === planId)
      if (found) {
        planToUpdate = found
        break
      }
    }

    if (!planToUpdate) {
      console.error('[DragDrop] Plan not found:', planId)
      alert('Plan bulunamadı. Sayfa yenileniyor...')
      window.location.reload()
      return
    }

    // Calculate new date with same time
    const oldDate = new Date(planToUpdate.planned_at)
    const newDate = new Date(targetDate)
    newDate.setHours(oldDate.getHours())
    newDate.setMinutes(oldDate.getMinutes())
    newDate.setSeconds(oldDate.getSeconds())
    newDate.setMilliseconds(0)

    console.log('[DragDrop] Updating plan:', {
      planId: planToUpdate.id,
      oldDate: planToUpdate.planned_at,
      newDate: newDate.toISOString(),
    })

    // Update platform plan via API
    setUpdatingPlanId(planToUpdate.id)
    try {
      const response = await fetch(
        `/api/admin/releases/${planToUpdate.release_id}/platform-plans/${planToUpdate.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planned_at: newDate.toISOString(),
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[DragDrop] API error:', response.status, errorText)
        throw new Error(`API error: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('[DragDrop] API response:', result)

      if (result.success) {
        // Refresh data
        if (onPlanUpdate) {
          onPlanUpdate()
        } else {
          // Fallback: reload page
          window.location.reload()
        }
      } else {
        console.error('[DragDrop] Failed to update:', result.error)
        alert(`Güncelleme başarısız: ${result.error || 'Bilinmeyen hata'}`)
      }
    } catch (error: any) {
      console.error('[DragDrop] Error updating platform plan:', error)
      alert(`Hata: ${error.message || 'Platform planı güncellenemedi'}`)
    } finally {
      setUpdatingPlanId(null)
      setDraggedPlan(null)
    }
  }, [platformPlans, onPlanUpdate])

  // Get day names
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('prev')}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold text-white min-w-[200px] text-center">
            {viewMode === 'month'
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : `${formatDate(getWeekStart(currentDate), 'MMM d, yyyy')} - ${formatDate(getWeekEnd(currentDate), 'MMM d, yyyy')}`
            }
          </h2>
          <button
            onClick={() => navigate('next')}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            →
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Today
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-800">
          {dayNames.map(day => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-gray-400 border-r border-gray-800 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {dates.map((date, index) => {
            const events = getEventsForDate(date)
            const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
            const isCurrentMonth = viewMode === 'month' 
              ? date.getMonth() === currentDate.getMonth()
              : true

            const isDragOver = dragOverDate && dragOverDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-800 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-950' : 'bg-gray-900'
                } ${isToday ? 'bg-orange-500/10' : ''} ${
                  isDragOver ? 'bg-green-500/20 border-green-500 border-2' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, date)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, date)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-orange-500' : 'text-white'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {events.slice(0, 3).map((event, eventIndex) => {
                    if (event.type === 'release') {
                      return (
                        <Link
                          key={eventIndex}
                          href={`/admin/releases/${event.data.id}`}
                          className="block px-2 py-1 rounded text-xs truncate bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:opacity-80 transition-opacity"
                          title={`${event.data.song_title} - Release`}
                        >
                          <span>{event.data.song_title}</span>
                        </Link>
                      )
                    }

                    // Platform plan - draggable
                    const plan = event.data as PlatformPlan
                    const isUpdating = updatingPlanId === plan.id
                    const isDragging = draggedPlan?.id === plan.id

                    return (
                      <div
                        key={eventIndex}
                        draggable={!isUpdating}
                        onDragStart={(e) => handleDragStart(e, plan)}
                        className={`px-2 py-1 rounded text-xs truncate cursor-move ${
                          isDragging
                            ? 'opacity-50 bg-green-500/10 border border-green-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/50'
                        } ${isUpdating ? 'opacity-50 cursor-wait' : 'hover:opacity-80'} transition-opacity`}
                        title={`${PLATFORM_LABELS[plan.platform]} - ${formatDate(new Date(plan.planned_at), 'HH:mm')} (Drag to move)`}
                        onClick={(e) => {
                          // Prevent navigation when clicking to drag
                          e.preventDefault()
                        }}
                      >
                        <span>{PLATFORM_LABELS[plan.platform]} {formatDate(new Date(plan.planned_at), 'HH:mm')}</span>
                      </div>
                    )
                  })}
                  {events.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
          <span className="text-gray-400">Release Date</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded"></div>
          <span className="text-gray-400">Platform Post (drag to move)</span>
        </div>
      </div>
    </div>
  )
}
