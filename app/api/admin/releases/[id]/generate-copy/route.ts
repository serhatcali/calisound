import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getRelease, getPlatformPlans, updatePlatformPlan } from '@/lib/release-planning-service'
import { generateAllPlatformCopy } from '@/lib/ai-copy-generator'
import type { ReleasePlatform } from '@/types/release-planning'

export const dynamic = 'force-dynamic'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// POST: Generate AI copy for all platform plans
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminAuthenticated(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const release = await getRelease(params.id)
    const platformPlans = await getPlatformPlans(params.id)

    if (platformPlans.length === 0) {
      return NextResponse.json(
        { error: 'No platform plans found. Please create platform plans first.' },
        { status: 400 }
      )
    }

    // Get unique platforms
    const platforms = [...new Set(platformPlans.map(p => p.platform))] as ReleasePlatform[]

    console.log('[API] ===== STARTING AI COPY GENERATION =====')
    console.log('[API] Release ID:', params.id)
    console.log('[API] Song Title:', release.song_title)
    console.log('[API] Platforms:', platforms.length, platforms)
    console.log('[API] OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('[API] OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
    console.log('[API] OPENAI_API_KEY prefix:', process.env.OPENAI_API_KEY?.substring(0, 7) || 'N/A')
    console.log('[API] OPENAI_MODEL:', process.env.OPENAI_MODEL || 'gpt-4o-mini')
    console.log('[API] =======================================')

    // Test OpenAI connection BEFORE generating
    const testOpenAI = async () => {
      try {
        const OpenAI = (await import('openai')).default
        const apiKey = process.env.OPENAI_API_KEY?.trim()
        if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey.length < 10) {
          console.error('[API] ❌ OPENAI_API_KEY is missing or invalid', {
            exists: !!apiKey,
            length: apiKey?.length || 0,
            isPlaceholder: apiKey === 'your-openai-api-key-here',
          })
          return false
        }
        const testClient = new OpenAI({ apiKey })
        // Try a minimal test call
        const testResponse = await testClient.chat.completions.create({
          model: MODEL,
          messages: [{ role: 'user', content: 'Say "test"' }],
          max_tokens: 5,
        })
        console.log('[API] ✅ OpenAI connection test successful', {
          response: testResponse.choices[0]?.message?.content,
          model: MODEL,
        })
        return true
      } catch (testError: any) {
        console.error('[API] ❌ OpenAI connection test FAILED:', {
          message: testError.message,
          code: testError.code,
          status: testError.status,
          type: testError.type,
        })
        return false
      }
    }
    
    console.log('[API] Testing OpenAI connection...')
    const openaiWorks = await testOpenAI()
    if (!openaiWorks) {
      return NextResponse.json({
        error: 'OpenAI API is not working. Check your OPENAI_API_KEY in .env.local and restart the server.',
        details: 'OpenAI connection test failed. Make sure your API key is valid and the server was restarted after adding it.',
      }, { status: 500 })
    }
    console.log('[API] ✅ OpenAI connection verified, proceeding with copy generation...')

    // Generate AI copy for all platforms
    let aiCopy
    try {
      console.log('[API] Calling generateAllPlatformCopy...')
      aiCopy = await generateAllPlatformCopy(release, platforms)
      console.log('[API] ✅ AI copy generated successfully', {
        platformsGenerated: Object.keys(aiCopy).length,
        sampleTitle: Object.values(aiCopy)[0]?.title,
        sampleDescription: Object.values(aiCopy)[0]?.description?.substring(0, 50),
        sampleHashtags: Object.values(aiCopy)[0]?.hashtags?.length,
        sampleHashtagsList: Object.values(aiCopy)[0]?.hashtags,
      })
    } catch (error: any) {
      console.error('[API] ❌ Error in generateAllPlatformCopy:', error)
      console.error('[API] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
      })
      throw error
    }

    // Validate AI copy quality
    const hasGenericContent = Object.values(aiCopy).some(copy => 
      copy.description.toLowerCase().includes('new release:') ||
      copy.title === `${release.song_title}${release.city ? ` - ${release.city}` : ''}` ||
      copy.hashtags.length < 5
    )

    if (hasGenericContent) {
      console.warn('[API] Generated copy appears generic, but proceeding with update')
    }

    // Update each platform plan with generated copy
    const updatedPlans = []
    for (const plan of platformPlans) {
      const copy = aiCopy[plan.platform]
      if (copy) {
        try {
          const updated = await updatePlatformPlan(plan.id, {
            title: copy.title,
            description: copy.description,
            hashtags: copy.hashtags,
            tags: copy.tags,
            ai_generated: true,
          })
          updatedPlans.push(updated)
          console.log(`[API] Updated platform plan for ${plan.platform}`, {
            title: copy.title,
            hashtagCount: copy.hashtags.length,
          })
        } catch (updateError: any) {
          console.error(`[API] Error updating platform plan for ${plan.platform}:`, updateError)
          // Continue with other platforms
        }
      } else {
        console.warn(`[API] No copy generated for platform ${plan.platform}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated copy for ${updatedPlans.length} platform(s)`,
      plans: updatedPlans,
      warning: hasGenericContent ? 'Some copy appears generic. Check OpenAI API key and configuration.' : undefined,
    })
  } catch (error: any) {
    console.error('[API] Error generating copy:', error)
    console.error('[API] Full error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate copy',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
