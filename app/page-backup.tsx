// Temporary simple homepage for testing
export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        CALI Sound - Test Page
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-4">
        If you see this, basic rendering works!
      </p>
      <div className="mt-8">
        <a href="/links" className="text-blue-600 dark:text-blue-400 underline">
          Go to Links Page
        </a>
      </div>
    </div>
  )
}
