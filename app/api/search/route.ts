import { NextRequest, NextResponse } from 'next/server'
import { getAllCities, getAllSets } from '@/lib/db'
import { getClientIP, rateLimit, validateString, sanitizeInput } from '@/lib/security'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`search:${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 30, // 30 searches per minute
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      )
    }

    const body = await request.json()
    const queryValidation = validateString(body.query, {
      required: true,
      minLength: 2,
      maxLength: 100,
    })

    if (!queryValidation.valid || !queryValidation.value) {
      return NextResponse.json({ success: true, results: [] })
    }

    const searchTerm = sanitizeInput(queryValidation.value).toLowerCase().trim()

    const [cities, sets] = await Promise.all([
      getAllCities(),
      getAllSets(),
    ])

    const results = []

    // Search cities
    for (const city of cities) {
      const matches =
        city.name.toLowerCase().includes(searchTerm) ||
        city.country.toLowerCase().includes(searchTerm) ||
        city.region.toLowerCase().includes(searchTerm) ||
        city.mood.some(m => m.toLowerCase().includes(searchTerm)) ||
        (city.description_en && city.description_en.toLowerCase().includes(searchTerm))

      if (matches) {
        results.push({
          type: 'city',
          id: city.id,
          title: city.name,
          subtitle: `${city.country} • ${city.region}`,
          url: `/city/${city.slug}`,
          image: city.cover_square_url || city.banner_16x9_url || undefined,
        })
      }
    }

    // Search sets
    for (const set of sets) {
      const matches =
        set.title.toLowerCase().includes(searchTerm) ||
        (set.description && set.description.toLowerCase().includes(searchTerm))

      if (matches) {
        results.push({
          type: 'set',
          id: set.id,
          title: set.title,
          subtitle: set.duration || undefined,
          url: `/sets/${set.id}`,
          image: (set as any)?.thumbnail_url || undefined,
        })
      }
    }

    // Limit to 10 results
    return NextResponse.json({ success: true, results: results.slice(0, 10) })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ success: false, results: [] }, { status: 500 })
  }
}
