import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CALI Club - Coming Soon',
  description: 'CALI Club virtual concert experience is coming soon. Stay tuned!',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CaliClubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
            CALI CLUB
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Coming Soon
          </h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            We're building an amazing virtual concert experience where you can create your character, 
            listen to music, and connect with others in real-time.
          </p>
          <p className="text-base md:text-lg text-gray-400">
            Stay tuned for updates!
          </p>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70 transform hover:scale-105 active:scale-95"
          >
            Back to Home
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  )
}
