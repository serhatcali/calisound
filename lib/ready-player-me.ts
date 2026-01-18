/**
 * Ready Player Me API Integration
 * 
 * Ready Player Me allows you to create realistic 3D avatars.
 * Get your free API key at: https://readyplayer.me/developers
 * 
 * Documentation: https://docs.readyplayer.me/ready-player-me
 */

const READY_PLAYER_ME_SUBDOMAIN = process.env.NEXT_PUBLIC_READY_PLAYER_ME_SUBDOMAIN || 'cali-sound'
const READY_PLAYER_ME_API_KEY = process.env.NEXT_PUBLIC_READY_PLAYER_ME_API_KEY || ''

// Base URLs
const BASE_URL = `https://${READY_PLAYER_ME_SUBDOMAIN}.readyplayer.me`
const API_BASE_URL = 'https://api.readyplayer.me/v1'

export interface AvatarConfig {
  gender?: 'male' | 'female'
  bodyType?: 'fullbody' | 'halfbody'
  quality?: 'high' | 'medium' | 'low'
  pose?: 'T' | 'A' | 'relaxed'
  textureAtlas?: 'none' | '1024' | '2048'
  morphTargets?: 'none' | 'ARKit' | 'Oculus'
}

export interface CreateAvatarParams {
  userId: string
  config?: AvatarConfig
}

/**
 * Generate avatar URL from character data
 * Ready Player Me uses avatar IDs or can generate avatars on-the-fly
 */
export function getAvatarUrl(
  characterId: string,
  config?: AvatarConfig
): string {
  // Option 1: Use existing avatar ID if stored
  // return `${BASE_URL}/avatar/${characterId}.glb`
  
  // Option 2: Generate avatar URL with parameters
  const params = new URLSearchParams()
  if (config?.gender) params.append('gender', config.gender)
  if (config?.bodyType) params.append('bodyType', config.bodyType || 'fullbody')
  if (config?.quality) params.append('quality', config.quality || 'high')
  if (config?.pose) params.append('pose', config.pose || 'T')
  
  const queryString = params.toString()
  return `${BASE_URL}/avatar/${characterId}.glb${queryString ? `?${queryString}` : ''}`
}

/**
 * Create a new avatar via Ready Player Me API
 * Requires API key
 */
export async function createAvatar(
  userId: string,
  config?: AvatarConfig
): Promise<{ avatarId: string; avatarUrl: string }> {
  if (!READY_PLAYER_ME_API_KEY) {
    throw new Error('Ready Player Me API key is not configured. Set NEXT_PUBLIC_READY_PLAYER_ME_API_KEY in .env.local')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/avatars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${READY_PLAYER_ME_API_KEY}`,
      },
      body: JSON.stringify({
        userId,
        ...config,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create avatar: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      avatarId: data.avatarId,
      avatarUrl: getAvatarUrl(data.avatarId, config),
    }
  } catch (error) {
    console.error('Error creating avatar:', error)
    throw error
  }
}

/**
 * Get avatar URL from character data
 * Falls back to default avatar if no avatar ID is stored
 */
export function getCharacterAvatarUrl(character: {
  id: string
  gender?: 'male' | 'female'
  avatar_data?: {
    readyPlayerMeId?: string
    color?: string
    size?: number
  }
}): string {
  // If character has a stored Ready Player Me avatar ID, use it
  if (character.avatar_data?.readyPlayerMeId) {
    return getAvatarUrl(character.avatar_data.readyPlayerMeId, {
      gender: character.gender,
      bodyType: 'fullbody',
      quality: 'high',
      pose: 'T',
    })
  }

  // Otherwise, use character ID to generate avatar URL
  // Note: This requires the avatar to be created first via createAvatar()
  return getAvatarUrl(character.id, {
    gender: character.gender,
    bodyType: 'fullbody',
    quality: 'high',
    pose: 'T',
  })
}

/**
 * Alternative: Use Ready Player Me's avatar generator URL
 * Users can create their own avatar and we get the URL
 */
export function getAvatarGeneratorUrl(userId: string): string {
  return `${BASE_URL}/avatar?userId=${userId}`
}
