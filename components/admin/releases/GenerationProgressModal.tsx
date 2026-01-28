'use client'

export type GenerationStep = {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  message?: string
  details?: string
  progress?: number
}

interface GenerationProgressModalProps {
  isOpen: boolean
  onClose: () => void
  onCancel?: () => void
  title: string
  steps: GenerationStep[]
  overallProgress: number
  error?: string
}

export function GenerationProgressModal({
  isOpen,
  onClose,
  onCancel,
  title,
  steps,
  overallProgress,
  error,
}: GenerationProgressModalProps) {
  if (!isOpen) return null

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const totalSteps = steps.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : step.status === 'in_progress'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    : step.status === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        step.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : step.status === 'in_progress'
                          ? 'bg-orange-500 text-white animate-pulse'
                          : step.status === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {step.status === 'completed' ? '✓' : step.status === 'error' ? '✕' : index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{step.label}</h3>
                      {step.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {step.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {step.progress !== undefined && step.status === 'in_progress' && (
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {step.progress}%
                    </span>
                  )}
                </div>

                {/* Progress bar for individual step */}
                {step.status === 'in_progress' && step.progress !== undefined && (
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                )}

                {/* Details/Error message */}
                {step.details && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {step.details}
                    </p>
                  </div>
                )}

                {step.status === 'error' && step.message && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{step.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          {error || steps.every(s => s.status === 'completed' || s.status === 'error') ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              {error ? 'Close' : 'Done'}
            </button>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generation in progress...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
