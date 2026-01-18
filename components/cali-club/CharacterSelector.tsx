'use client'

import { useState } from 'react'
import { useCaliClubStore } from '@/stores/cali-club-store'

// Available character models
// These will be GLB/GLTF files in public/models/characters/
const AVAILABLE_CHARACTERS = [
  { id: 'character-001-male', name: 'Realistic Male', gender: 'male', preview: '/models/characters/character-001-male-preview.jpg' },
  { id: 'character-002-male', name: 'Male 2', gender: 'male', preview: '/models/characters/character-002-male-preview.jpg' },
  { id: 'character-003-male', name: 'Male 3 (Bearded)', gender: 'male', preview: '/models/characters/character-003-male-preview.jpg' },
  { id: 'character-004-female', name: 'Female 1', gender: 'female', preview: '/models/characters/character-004-female-preview.jpg' },
  { id: 'character-005-female', name: 'Female 2', gender: 'female', preview: '/models/characters/character-005-female-preview.jpg' },
  // Add more characters as needed
]

export function CharacterSelector() {
  const { currentCharacter, updateCharacter } = useCaliClubStore()
  const [selectedCharacter, setSelectedCharacter] = useState<string>(
    currentCharacter?.avatar_data?.characterModel || AVAILABLE_CHARACTERS[0].id
  )

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId)
    if (currentCharacter) {
      updateCharacter(currentCharacter.id, {
        avatar_data: {
          ...currentCharacter.avatar_data,
          characterModel: characterId,
          modelUrl: `/models/characters/${characterId}.glb`, // Update model URL
        }
      })
    }
  }

  if (!currentCharacter) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Select a character first</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white text-lg font-bold mb-4">Select Character</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVAILABLE_CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => handleCharacterSelect(char.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedCharacter === char.id
                ? 'border-cyan-400 bg-cyan-400/20'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="w-full h-32 bg-gray-600 rounded mb-2 flex items-center justify-center">
              {/* Preview image or placeholder */}
              <span className="text-gray-400 text-sm">{char.name}</span>
            </div>
            <p className="text-white text-sm font-medium">{char.name}</p>
            <p className="text-gray-400 text-xs">{char.gender}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
