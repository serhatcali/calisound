'use client'

import { useState } from 'react'
import { useCaliClubStore } from '@/stores/cali-club-store'
import { showToast } from '../Toast'

const GRID_SIZE = 20 // 20x20 grid
const CELL_SIZE = 1.8 // Each cell is 1.8 units
const GRID_OFFSET = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2

interface GridCell {
  x: number
  z: number
  occupied: boolean
  characterId?: string
}

export function DanceFloorGrid() {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; z: number } | null>(null)
  const { characters, currentCharacter, setCurrentCharacter, updateCharacter } = useCaliClubStore()

  // Create grid cells
  const gridCells: GridCell[] = []
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      const cellX = GRID_OFFSET + x * CELL_SIZE
      const cellZ = GRID_OFFSET + z * CELL_SIZE
      
      // Find if this cell is occupied
      // Use more precise grid snapping comparison
      const occupied = characters.some(char => {
        const snappedX = GRID_OFFSET + Math.round((char.position.x - GRID_OFFSET) / CELL_SIZE) * CELL_SIZE
        const snappedZ = GRID_OFFSET + Math.round((char.position.z - GRID_OFFSET) / CELL_SIZE) * CELL_SIZE
        return Math.abs(snappedX - cellX) < 0.1 && Math.abs(snappedZ - cellZ) < 0.1
      })
      
      const character = characters.find(char => {
        const snappedX = GRID_OFFSET + Math.round((char.position.x - GRID_OFFSET) / CELL_SIZE) * CELL_SIZE
        const snappedZ = GRID_OFFSET + Math.round((char.position.z - GRID_OFFSET) / CELL_SIZE) * CELL_SIZE
        return Math.abs(snappedX - cellX) < 0.1 && Math.abs(snappedZ - cellZ) < 0.1
      })

      gridCells.push({
        x: cellX,
        z: cellZ,
        occupied,
        characterId: character?.id
      })
    }
  }

  const handleCellClick = (cell: GridCell) => {
    if (!currentCharacter) return
    
    // If cell is occupied by another character, show error and don't move
    if (cell.occupied && cell.characterId !== currentCharacter.id) {
      showToast('Bu kare dolu! Lütfen başka boş bir kare seçin.', 'error')
      return
    }

    // Move current character to this cell (exactly centered)
    const newPosition = {
      x: cell.x, // cell.x is already the center of the cell
      y: 0, // Always on the dance floor
      z: cell.z // cell.z is already the center of the cell
    }
    
    updateCharacter(currentCharacter.id, {
      position: newPosition
    })
    
    // Also update current character in store
    setCurrentCharacter({
      ...currentCharacter,
      position: newPosition
    })
    
    showToast('Karakter taşındı!', 'success')
  }

  return (
    <group>
      {gridCells.map((cell, index) => {
        const isHovered = hoveredCell?.x === cell.x && hoveredCell?.z === cell.z
        const isOccupied = cell.occupied
        const isCurrentCharacter = cell.characterId === currentCharacter?.id

        return (
          <mesh
            key={`cell-${index}`}
            position={[cell.x, 0.01, cell.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerEnter={() => setHoveredCell({ x: cell.x, z: cell.z })}
            onPointerLeave={() => setHoveredCell(null)}
            onClick={() => handleCellClick(cell)}
            onPointerMissed={() => setHoveredCell(null)}
          >
            <planeGeometry args={[CELL_SIZE * 0.9, CELL_SIZE * 0.9]} />
            <meshStandardMaterial
              color={
                isCurrentCharacter
                  ? '#00ffff'
                  : isOccupied
                  ? '#ff0066'
                  : isHovered
                  ? '#00ff00'
                  : '#1a1a2e'
              }
              transparent
              opacity={
                isCurrentCharacter
                  ? 0.6
                  : isOccupied
                  ? 0.4
                  : isHovered
                  ? 0.5
                  : 0.2
              }
              emissive={
                isCurrentCharacter
                  ? '#00ffff'
                  : isOccupied
                  ? '#ff0066'
                  : isHovered
                  ? '#00ff00'
                  : '#000000'
              }
              emissiveIntensity={
                isCurrentCharacter
                  ? 0.8
                  : isOccupied
                  ? 0.4
                  : isHovered
                  ? 0.6
                  : 0
              }
            />
          </mesh>
        )
      })}
    </group>
  )
}
