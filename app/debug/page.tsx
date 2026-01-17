'use client'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-black">Debug Page</h1>
      <p className="text-gray-600 mt-4">If you see this, basic rendering works!</p>
      <div className="mt-8">
        <a href="/" className="text-blue-600 underline">Go to Homepage</a>
      </div>
    </div>
  )
}
