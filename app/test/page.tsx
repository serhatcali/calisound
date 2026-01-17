export default function TestPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        Test Page - If you see this, basic rendering works!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-4">
        If this page works but homepage doesn't, there's an issue with data fetching or components.
      </p>
    </div>
  )
}
