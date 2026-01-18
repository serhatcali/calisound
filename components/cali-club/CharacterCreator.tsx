'use client'

import { useState, useEffect } from 'react'
import { useCaliClubStore } from '@/stores/cali-club-store'
import { SparklesIcon, RocketIcon, TrashIcon, MaleIcon, FemaleIcon, UserIcon, InfoIcon } from './Icons'
import { showToast } from './Toast'
import { Tooltip } from './Tooltip'
import { CharacterSelector } from './CharacterSelector'
import { ColorCustomizer } from './ColorCustomizer'

const COLORS = [
  '#ff6b35', '#ffa500', '#ffd700', '#ff69b4',
  '#00ced1', '#32cd32', '#9370db', '#ff1493',
  '#00bfff', '#ff6347', '#7b68ee', '#20b2aa',
]

export function CharacterCreator() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [isCreating, setIsCreating] = useState(false)
  const { addCharacter, setCurrentCharacter, currentCharacter, characters } = useCaliClubStore()
  const [hasCharacter, setHasCharacter] = useState(false)

  // Check if user already has a character
  useEffect(() => {
    const savedCharacterId = localStorage.getItem('cali_club_character_id')
    const savedSessionId = localStorage.getItem('cali_club_session_id')

    if (savedCharacterId && savedSessionId) {
      // Check if character exists in store
      const existingCharacter = characters.find((c) => c.id === savedCharacterId)
      if (existingCharacter) {
        setHasCharacter(true)
        setCurrentCharacter(existingCharacter)
      } else {
        // Character might be loading, check again after a moment
        setTimeout(() => {
          const char = characters.find((c) => c.id === savedCharacterId)
          if (char) {
            setHasCharacter(true)
            setCurrentCharacter(char)
          }
        }, 1000)
      }
    }
  }, [characters, setCurrentCharacter])

  const generateRandomCharacter = () => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)]
    const randomSize = 0.8 + Math.random() * 0.4 // 0.8 - 1.2

    // Grid-based position (20x20 grid, cell size 1.8)
    const GRID_SIZE = 20
    const CELL_SIZE = 1.8
    const GRID_OFFSET = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2
    
    // Find an empty cell (prefer center area)
    const centerX = Math.floor(GRID_SIZE / 2)
    const centerZ = Math.floor(GRID_SIZE / 2)
    const radius = 5 // Search within 5 cells of center
    
    let gridX = centerX + Math.floor((Math.random() - 0.5) * radius * 2)
    let gridZ = centerZ + Math.floor((Math.random() - 0.5) * radius * 2)
    
    // Clamp to grid bounds
    gridX = Math.max(0, Math.min(GRID_SIZE - 1, gridX))
    gridZ = Math.max(0, Math.min(GRID_SIZE - 1, gridZ))
    
    const x = GRID_OFFSET + gridX * CELL_SIZE
    const z = GRID_OFFSET + gridZ * CELL_SIZE

    return {
      color: randomColor,
      size: randomSize,
      position: { x, y: 0, z },
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Please enter a name', 'warning')
      return
    }

    if (name.trim().length < 2) {
      showToast('Name must be at least 2 characters', 'warning')
      return
    }

    if (name.trim().length > 20) {
      showToast('Name must be less than 20 characters', 'warning')
      return
    }

    // Prevent creating multiple characters
    if (hasCharacter || currentCharacter) {
      showToast('You already have a character! Delete it first to create a new one.', 'info')
      return
    }

    setIsCreating(true)

    try {
      const avatarData = generateRandomCharacter()
      // Set default character model for new characters
      avatarData.characterModel = 'character-001-male'
      avatarData.modelUrl = '/models/characters/character-001-male.glb'
      
      const sessionId = localStorage.getItem('cali_club_session_id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const characterData = {
        session_id: sessionId,
        name: name.trim(),
        gender,
        avatar_data: avatarData,
        position: avatarData.position,
      }

      // Save to Supabase
      const response = await fetch('/api/cali-club/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create character')
      }

      const { character } = await response.json()

      // Add to store (will also be added via realtime subscription)
      addCharacter(character as any)
      setCurrentCharacter(character as any)
      setHasCharacter(true)

      // Store session ID in localStorage
      localStorage.setItem('cali_club_session_id', sessionId)
      localStorage.setItem('cali_club_character_id', character.id)

      setName('')
      showToast('Character created successfully!', 'success')
    } catch (error: any) {
      console.error('Error creating character:', error)
      showToast(error.message || 'Error creating character', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCharacter = async () => {
    if (!currentCharacter) return

    if (!confirm('Are you sure you want to delete your character?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/cali-club/characters?id=${currentCharacter.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete character')
      }

      // Clear localStorage
      localStorage.removeItem('cali_club_character_id')
      localStorage.removeItem('cali_club_session_id')

      // Clear from store
      setCurrentCharacter(null)
      setHasCharacter(false)
      showToast('Character deleted successfully', 'success')
    } catch (error: any) {
      console.error('Error deleting character:', error)
      showToast('Error deleting character', 'error')
    }
  }

  // If user already has a character, show customization options
  if (hasCharacter || currentCharacter) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full shadow-md shadow-green-500/30" />
          <span>Your Character</span>
        </h2>
        <div className="bg-gradient-to-br from-gray-950/90 via-black/90 to-gray-950/90 backdrop-blur-xl rounded-xl p-4 border-2 border-gray-900/50 shadow-lg ring-1 ring-yellow-500/10">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl shadow-lg ring-2 ring-yellow-500/30 border border-black/50"
              style={{
                backgroundColor: currentCharacter?.avatar_data?.color || '#ff6b35',
                boxShadow: `0 0 20px ${currentCharacter?.avatar_data?.color || '#ff6b35'}40`,
              }}
            />
            <div className="flex-1">
              <p className="text-white font-bold text-lg">{currentCharacter?.name}</p>
              <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                {currentCharacter?.gender === 'male' ? 'Male' : 'Female'}
              </p>
            </div>
          </div>
          
          {/* Character Customization */}
          <div className="space-y-4 mb-4">
            <CharacterSelector />
            <ColorCustomizer />
          </div>
          
          <button
            onClick={handleDeleteCharacter}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm font-semibold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <TrashIcon size={16} />
            Delete Character
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
          <SparklesIcon className="text-yellow-400" size={16} />
        </div>
        <span>Create Character</span>
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
          <UserIcon className="text-yellow-500" size={16} />
          <span>Name</span>
          <Tooltip content="Choose a unique name for your character (2-20 characters)">
            <button
              type="button"
              className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500/25 to-amber-500/25 border border-yellow-500/40 flex items-center justify-center hover:from-yellow-500/35 hover:to-amber-500/35 hover:border-yellow-500/60 transition-all cursor-help group shadow-sm hover:shadow-md"
              aria-label="Name information"
            >
              <InfoIcon className="text-yellow-400 group-hover:text-yellow-300 transition-colors" size={14} />
            </button>
          </Tooltip>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isCreating && name.trim() && handleCreate()}
          placeholder="Your character name"
          className="w-full px-4 py-2.5 bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl text-white rounded-xl border-2 border-gray-900/50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all shadow-lg"
          maxLength={20}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-500">{name.length}/20</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-200 mb-2">
          Gender
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setGender('male')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              gender === 'male'
                ? 'bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 ring-1 ring-yellow-400/30 border border-yellow-400/20'
                : 'bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-gray-900/50 border-2 border-gray-900/50 hover:border-gray-800 shadow-lg'
            }`}
          >
            <MaleIcon size={16} />
            <span>Male</span>
          </button>
          <button
            onClick={() => setGender('female')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              gender === 'female'
                ? 'bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 ring-1 ring-yellow-400/30 border border-yellow-400/20'
                : 'bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-gray-900/50 border-2 border-gray-900/50 hover:border-gray-800 shadow-lg'
            }`}
          >
            <FemaleIcon size={16} />
            <span>Female</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={isCreating || !name.trim()}
        className="w-full px-4 py-3 bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-xl font-bold text-sm hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ring-1 ring-yellow-400/20 border border-yellow-400/10"
      >
        {isCreating ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <RocketIcon size={18} />
            Create Character & Join
          </>
        )}
      </button>
    </div>
  )
}
