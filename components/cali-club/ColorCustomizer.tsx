'use client'

import { useState } from 'react'
import { useCaliClubStore } from '@/stores/cali-club-store'

const HAIR_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Blonde', value: '#FFD700' },
  { name: 'Red', value: '#A52A2A' },
  { name: 'Gray', value: '#808080' },
]

const CLOTHING_COLORS = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Orange', value: '#FF6B35' },
]

const SKIN_COLORS = [
  { name: 'Light', value: '#FDBCB4' },
  { name: 'Medium', value: '#D08B5B' },
  { name: 'Dark', value: '#8B4513' },
]

export function ColorCustomizer() {
  const { currentCharacter, updateCharacter } = useCaliClubStore()
  
  const [hairColor, setHairColor] = useState(
    currentCharacter?.avatar_data?.customizations?.hairColor || HAIR_COLORS[0].value
  )
  const [clothingColor, setClothingColor] = useState(
    currentCharacter?.avatar_data?.customizations?.clothingColor || CLOTHING_COLORS[0].value
  )
  const [skinColor, setSkinColor] = useState(
    currentCharacter?.avatar_data?.customizations?.skinColor || SKIN_COLORS[0].value
  )

  const handleColorChange = (type: 'hair' | 'clothing' | 'skin', color: string) => {
    if (!currentCharacter) return

    const updates: any = {
      customizations: {
        ...currentCharacter.avatar_data?.customizations,
        [type === 'hair' ? 'hairColor' : type === 'clothing' ? 'clothingColor' : 'skinColor']: color,
      }
    }

    updateCharacter(currentCharacter.id, {
      avatar_data: {
        ...currentCharacter.avatar_data,
        ...updates,
      }
    })

    if (type === 'hair') setHairColor(color)
    if (type === 'clothing') setClothingColor(color)
    if (type === 'skin') setSkinColor(color)
  }

  if (!currentCharacter) {
    return null
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white text-lg font-bold mb-4">Customize Colors</h3>
      
      {/* Hair Color */}
      <div className="mb-4">
        <label className="text-gray-300 text-sm mb-2 block">Hair Color</label>
        <div className="flex gap-2 flex-wrap">
          {HAIR_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange('hair', color.value)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                hairColor === color.value ? 'border-cyan-400 scale-110' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Clothing Color */}
      <div className="mb-4">
        <label className="text-gray-300 text-sm mb-2 block">Clothing Color</label>
        <div className="flex gap-2 flex-wrap">
          {CLOTHING_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange('clothing', color.value)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                clothingColor === color.value ? 'border-cyan-400 scale-110' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Skin Color */}
      <div>
        <label className="text-gray-300 text-sm mb-2 block">Skin Color</label>
        <div className="flex gap-2 flex-wrap">
          {SKIN_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange('skin', color.value)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                skinColor === color.value ? 'border-cyan-400 scale-110' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
