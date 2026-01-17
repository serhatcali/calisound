'use client'

const FAVORITES_KEY = 'cali-sound-favorites'

export function getFavorites(): number[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addFavorite(cityId: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const favorites = getFavorites()
    if (!favorites.includes(cityId)) {
      favorites.push(cityId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  } catch (error) {
    console.error('Failed to add favorite:', error)
  }
}

export function removeFavorite(cityId: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const favorites = getFavorites()
    const updated = favorites.filter((id) => id !== cityId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to remove favorite:', error)
  }
}

export function isFavorite(cityId: number): boolean {
  const favorites = getFavorites()
  return favorites.includes(cityId)
}

export function toggleFavorite(cityId: number): boolean {
  try {
    if (isFavorite(cityId)) {
      removeFavorite(cityId)
      return false
    } else {
      addFavorite(cityId)
      return true
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error)
    return isFavorite(cityId)
  }
}
