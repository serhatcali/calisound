'use client'

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View website analytics and statistics
        </p>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Analytics Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Google Analytics integration will be available here
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Setup:</strong> Add your Google Analytics ID in Settings to enable analytics tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
