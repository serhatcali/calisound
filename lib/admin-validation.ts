/**
 * Admin Input Validation
 * Validates and sanitizes admin API inputs
 */

import { validateObject, validateString, validateNumber, sanitizeInput } from './security'

/**
 * Validate city data
 */
export function validateCityData(body: any): {
  valid: boolean
  data?: any
  errors?: Record<string, string>
} {
  const validation = validateObject(body, {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    slug: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-z0-9-]+$/, // Only lowercase, numbers, and hyphens
    },
    description_en: {
      type: 'string',
      required: false,
      maxLength: 5000,
    },
    description_tr: {
      type: 'string',
      required: false,
      maxLength: 5000,
    },
    cover_square_url: {
      type: 'url',
      required: false,
    },
    banner_16x9_url: {
      type: 'url',
      required: false,
    },
    youtube_playlist_id: {
      type: 'string',
      required: false,
      maxLength: 100,
    },
    spotify_playlist_id: {
      type: 'string',
      required: false,
      maxLength: 100,
    },
    apple_music_playlist_id: {
      type: 'string',
      required: false,
      maxLength: 100,
    },
    is_featured: {
      type: 'boolean',
      required: false,
    },
    order_index: {
      type: 'number',
      required: false,
      min: 0,
      max: 1000,
      integer: true,
    },
  })

  if (!validation.valid) {
    return { valid: false, errors: validation.errors }
  }

  // Additional sanitization
  const sanitized = {
    ...validation.value,
    name: sanitizeInput(validation.value!.name || ''),
    slug: sanitizeInput(validation.value!.slug || '').toLowerCase(),
    description_en: validation.value!.description_en
      ? sanitizeInput(validation.value!.description_en)
      : null,
    description_tr: validation.value!.description_tr
      ? sanitizeInput(validation.value!.description_tr)
      : null,
  }

  return { valid: true, data: sanitized }
}

/**
 * Validate set data
 */
export function validateSetData(body: any): {
  valid: boolean
  data?: any
  errors?: Record<string, string>
} {
  const validation = validateObject(body, {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 200,
    },
    description: {
      type: 'string',
      required: false,
      maxLength: 5000,
    },
    youtube_video_id: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/, // YouTube video ID format
    },
    cover_url: {
      type: 'url',
      required: false,
    },
    duration: {
      type: 'number',
      required: false,
      min: 0,
      max: 86400, // Max 24 hours
      integer: true,
    },
    is_featured: {
      type: 'boolean',
      required: false,
    },
    order_index: {
      type: 'number',
      required: false,
      min: 0,
      max: 1000,
      integer: true,
    },
  })

  if (!validation.valid) {
    return { valid: false, errors: validation.errors }
  }

  // Additional sanitization
  const sanitized = {
    ...validation.value,
    name: sanitizeInput(validation.value!.name || ''),
    description: validation.value!.description
      ? sanitizeInput(validation.value!.description)
      : null,
  }

  return { valid: true, data: sanitized }
}

/**
 * Validate settings data
 */
export function validateSettingsData(body: any): {
  valid: boolean
  data?: any
  errors?: Record<string, string>
} {
  const validation = validateObject(body, {
    key: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-z_]+$/, // Only lowercase and underscores
    },
    value: {
      type: 'string',
      required: true,
      maxLength: 10000,
    },
  })

  if (!validation.valid) {
    return { valid: false, errors: validation.errors }
  }

  // Sanitize
  const sanitized = {
    key: sanitizeInput(validation.value!.key || '').toLowerCase(),
    value: sanitizeInput(validation.value!.value || ''),
  }

  return { valid: true, data: sanitized }
}

/**
 * Validate comment update data
 */
export function validateCommentUpdateData(body: any): {
  valid: boolean
  data?: any
  errors?: Record<string, string>
} {
  const validation = validateObject(body, {
    status: {
      type: 'string',
      required: false,
      pattern: /^(pending|approved|rejected)$/,
    },
    content: {
      type: 'string',
      required: false,
      minLength: 10,
      maxLength: 2000,
    },
  })

  if (!validation.valid) {
    return { valid: false, errors: validation.errors }
  }

  const sanitized: any = {}
  if (validation.value!.status) {
    sanitized.status = validation.value!.status
  }
  if (validation.value!.content) {
    sanitized.content = sanitizeInput(validation.value!.content)
  }

  return { valid: true, data: sanitized }
}
