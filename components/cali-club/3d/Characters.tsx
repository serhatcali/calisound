'use client'

import { Character } from './Character'
import { CharacterGLTF } from './CharacterGLTF'
import { CharacterSimple } from './CharacterSimple'
import { CharacterReadyPlayerMe } from './CharacterReadyPlayerMe'
import { useCaliClubStore } from '@/stores/cali-club-store'
import { useEffect } from 'react'

// Character rendering mode:
// 'procedural' - Complex procedural character (not recommended)
// 'simple' - Simple but better-looking stylized character
// 'gltf' - Use GLTF/GLB models from Mixamo or other sources (RECOMMENDED)
// 'ready-player-me' - Use Ready Player Me API (deprecated - closing Jan 2026)
const CHARACTER_MODE: 'procedural' | 'simple' | 'gltf' | 'ready-player-me' = 'gltf'

const GRID_SIZE = 20
const CELL_SIZE = 1.8
const GRID_OFFSET = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2

// Helper function to snap position to grid (exactly centered in cell)
function snapToGrid(position: { x: number; y: number; z: number }) {
  // Calculate which grid cell this position belongs to
  const gridX = Math.round((position.x - GRID_OFFSET) / CELL_SIZE)
  const gridZ = Math.round((position.z - GRID_OFFSET) / CELL_SIZE)
  
  // Clamp to valid grid bounds
  const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, gridX))
  const clampedZ = Math.max(0, Math.min(GRID_SIZE - 1, gridZ))
  
  // Calculate the EXACT center of that grid cell
  // GRID_OFFSET is already adjusted to center the first cell, so we just multiply
  const snappedX = GRID_OFFSET + clampedX * CELL_SIZE
  const snappedZ = GRID_OFFSET + clampedZ * CELL_SIZE
  
  return {
    x: snappedX, // Exact center of cell
    y: 0, // Always on the dance floor
    z: snappedZ // Exact center of cell
  }
}

export function Characters() {
  const { characters, updateCharacter } = useCaliClubStore()

  // Set model URLs before rendering (DO NOT CHANGE NAMES!)
  useEffect(() => {
    characters.forEach((character, index) => {
      const characterNumber = index + 1
      const modelUrl = `/models/C${characterNumber}.fbx`

      // Only set modelUrl if missing, DO NOT CHANGE NAME!
      if (!character.avatar_data?.modelUrl && !character.avatar_data?.characterModel) {
        updateCharacter(character.id, {
          avatar_data: {
            ...character.avatar_data,
            modelUrl: modelUrl,
            color: character.avatar_data?.color || '#ff6b35',
          }
        })
      }
    })
  }, [characters.length, updateCharacter])

  // Snap all characters to grid on mount and when characters change
  // Force exact centering in grid cells
  useEffect(() => {
    characters.forEach((character) => {
      const snapped = snapToGrid(character.position)
      
      // Always update to ensure exact centering (even if very close)
      // This ensures characters are perfectly centered in their grid cells
      if (
        Math.abs(snapped.x - character.position.x) > 0.0001 ||
        Math.abs(snapped.z - character.position.z) > 0.0001 ||
        Math.abs(snapped.y - character.position.y) > 0.0001
      ) {
        console.log(`[Characters] Snapping character ${character.name} from (${character.position.x.toFixed(4)}, ${character.position.z.toFixed(4)}) to (${snapped.x.toFixed(4)}, ${snapped.z.toFixed(4)})`)
        updateCharacter(character.id, {
          position: snapped
        })
      }
    })
  }, [characters, updateCharacter]) // Run whenever characters array changes

  return (
    <group>
      {characters.map((character) => {
        // Ensure character is snapped to grid and on the dance floor (y = 0)
        const snappedPosition = {
          ...snapToGrid(character.position),
          y: 0 // Always place characters on the dance floor
        }
        const characterWithPosition = {
          ...character,
          position: snappedPosition
        }
        
        if (CHARACTER_MODE === 'ready-player-me') {
          return (
            <CharacterReadyPlayerMe
              key={character.id}
              character={characterWithPosition}
            />
          )
        }
        
        if (CHARACTER_MODE === 'gltf') {
          return (
            <CharacterGLTF
              key={character.id}
              character={characterWithPosition}
            />
          )
        }
        
        if (CHARACTER_MODE === 'simple') {
          return (
            <CharacterSimple
              key={character.id}
              character={characterWithPosition}
            />
          )
        }
        
        // Default: procedural (not recommended)
        return (
          <Character
            key={character.id}
            character={characterWithPosition}
          />
        )
      })}
    </group>
  )
}
