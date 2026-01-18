'use client'

import { useState, useEffect } from 'react'
import { useCaliClubStore, useCaliClubStore as store } from '@/stores/cali-club-store'
import { SparklesIcon, RocketIcon, TrashIcon, MaleIcon, FemaleIcon, UserIcon, InfoIcon, XIcon } from './Icons'
import { showToast } from './Toast'
import { Tooltip } from './Tooltip'
import { CharacterSelector } from './CharacterSelector'
import { ColorCustomizer } from './ColorCustomizer'

const COLORS = [
  '#ff6b35', '#ffa500', '#ffd700', '#ff69b4',
  '#00ced1', '#32cd32', '#9370db', '#ff1493',
  '#00bfff', '#ff6347', '#7b68ee', '#20b2aa',
]

interface CharacterCreatorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CharacterCreatorModal({ isOpen, onClose }: CharacterCreatorModalProps) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [isCreating, setIsCreating] = useState(false)
  const { addCharacter, setCurrentCharacter, currentCharacter, characters, updateCharacter } = useCaliClubStore()
  const [hasCharacter, setHasCharacter] = useState(false)

  // Check if user already has a character
  useEffect(() => {
    const savedCharacterId = localStorage.getItem('cali_club_character_id')
    const savedSessionId = localStorage.getItem('cali_club_session_id')

    if (savedCharacterId && savedSessionId) {
      const existingCharacter = characters.find((c) => c.id === savedCharacterId)
      if (existingCharacter) {
        setHasCharacter(true)
        setCurrentCharacter(existingCharacter)
      } else {
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
    const randomSize = 0.8 + Math.random() * 0.4

    const GRID_SIZE = 20
    const CELL_SIZE = 1.8
    const GRID_OFFSET = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2
    
    // Find an empty cell - get current characters from store
    const currentCharacters = store.getState().characters
    const occupiedCells = new Set<string>()
    
    // Mark all occupied cells
    currentCharacters.forEach(char => {
      const gridX = Math.round((char.position.x - GRID_OFFSET) / CELL_SIZE)
      const gridZ = Math.round((char.position.z - GRID_OFFSET) / CELL_SIZE)
      occupiedCells.add(`${gridX},${gridZ}`)
    })
    
    // Find first empty cell (start from center and spiral out)
    let gridX = Math.floor(GRID_SIZE / 2)
    let gridZ = Math.floor(GRID_SIZE / 2)
    let found = false
    
    // Try center first
    if (!occupiedCells.has(`${gridX},${gridZ}`)) {
      found = true
    } else {
      // Spiral search for empty cell
      const maxRadius = Math.floor(GRID_SIZE / 2)
      for (let radius = 1; radius <= maxRadius && !found; radius++) {
        for (let dx = -radius; dx <= radius && !found; dx++) {
          for (let dz = -radius; dz <= radius && !found; dz++) {
            if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
              const testX = Math.floor(GRID_SIZE / 2) + dx
              const testZ = Math.floor(GRID_SIZE / 2) + dz
              if (testX >= 0 && testX < GRID_SIZE && testZ >= 0 && testZ < GRID_SIZE) {
                if (!occupiedCells.has(`${testX},${testZ}`)) {
                  gridX = testX
                  gridZ = testZ
                  found = true
                }
              }
            }
          }
        }
      }
    }
    
    // If no empty cell found, use center anyway (shouldn't happen with 400 cells)
    if (!found) {
      gridX = Math.floor(GRID_SIZE / 2)
      gridZ = Math.floor(GRID_SIZE / 2)
    }
    
    // Calculate exact center of the cell
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

    if (hasCharacter || currentCharacter) {
      showToast('You already have a character! Delete it first to create a new one.', 'info')
      return
    }

    setIsCreating(true)

    try {
      const avatarData = generateRandomCharacter()
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

      addCharacter(character as any)
      setCurrentCharacter(character as any)
      setHasCharacter(true)

      localStorage.setItem('cali_club_session_id', sessionId)
      localStorage.setItem('cali_club_character_id', character.id)

      setName('')
      showToast('Character created successfully!', 'success')
      onClose() // Close modal after creation
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

      localStorage.removeItem('cali_club_character_id')
      localStorage.removeItem('cali_club_session_id')

      setCurrentCharacter(null)
      setHasCharacter(false)
      showToast('Character deleted successfully', 'success')
    } catch (error: any) {
      console.error('Error deleting character:', error)
      showToast('Error deleting character', 'error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-gray-950 via-black to-gray-950 rounded-2xl border-2 border-gray-900/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-900/50 bg-gradient-to-br from-yellow-500/10 via-amber-500/8 to-yellow-600/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SparklesIcon className="text-yellow-400" size={24} />
            <span>Character Management</span>
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all flex items-center justify-center"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {hasCharacter || currentCharacter ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-950/90 via-black/90 to-gray-950/90 backdrop-blur-xl rounded-xl p-6 border-2 border-gray-900/50">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-xl shadow-lg ring-2 ring-yellow-500/30 border border-black/50"
                    style={{
                      backgroundColor: currentCharacter?.avatar_data?.color || '#ff6b35',
                      boxShadow: `0 0 20px ${currentCharacter?.avatar_data?.color || '#ff6b35'}40`,
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold text-xl">{currentCharacter?.name}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                      {currentCharacter?.gender === 'male' ? 'Male' : 'Female'}
                    </p>
                  </div>
                </div>
                
                {/* Character Customization */}
                <div className="space-y-6 mb-6">
                  <CharacterSelector />
                  <ColorCustomizer />
                </div>
                
                <button
                  onClick={handleDeleteCharacter}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm font-semibold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <TrashIcon size={18} />
                  Delete Character
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mb-6">
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
                  className="w-full px-4 py-3 bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl text-white rounded-xl border-2 border-gray-900/50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all shadow-lg"
                  maxLength={20}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">{name.length}/20</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Gender
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      gender === 'male'
                        ? 'bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 ring-1 ring-yellow-400/30 border border-yellow-400/20'
                        : 'bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-gray-900/50 border-2 border-gray-900/50 hover:border-gray-800 shadow-lg'
                    }`}
                  >
                    <MaleIcon size={18} />
                    <span>Male</span>
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      gender === 'female'
                        ? 'bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 ring-1 ring-yellow-400/30 border border-yellow-400/20'
                        : 'bg-gradient-to-br from-gray-950/90 to-black/90 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-gray-900/50 border-2 border-gray-900/50 hover:border-gray-800 shadow-lg'
                    }`}
                  >
                    <FemaleIcon size={18} />
                    <span>Female</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={isCreating || !name.trim()}
                className="w-full px-4 py-4 bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-xl font-bold text-base hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ring-1 ring-yellow-400/20 border border-yellow-400/10"
              >
                {isCreating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <RocketIcon size={20} />
                    Create Character & Join
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
