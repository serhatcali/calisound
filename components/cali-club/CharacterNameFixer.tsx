'use client'

/**
 * Character Name Fixer Component
 * 
 * Bu component, karakter isimlerini otomatik olarak C1, C2, C3, C4 formatına çevirir
 * veya manuel olarak model URL'lerini ayarlar.
 */

import { useEffect, useRef } from 'react'
import { useCaliClubStore } from '@/stores/cali-club-store'

export function CharacterNameFixer() {
  const { characters, updateCharacter } = useCaliClubStore()
  const fixedCharactersRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Karakterleri kontrol et ve gerekirse düzelt
    characters.forEach((character, index) => {
      // Eğer bu karakter zaten düzeltildiyse, tekrar düzeltme
      if (fixedCharactersRef.current.has(character.id)) {
        return
      }

      const characterNumber = index + 1
      const expectedName = `C${characterNumber}`
      const modelUrl = `/models/C${characterNumber}.fbx`

      // Sadece modelUrl yoksa veya characterModel yoksa düzelt
      // İSİM DEĞİŞTİRME - Kullanıcının girdiği ismi koru!
      const needsModelUrl = !character.avatar_data?.modelUrl && !character.avatar_data?.characterModel
      
      if (needsModelUrl) {
        console.log(`[CharacterNameFixer] Setting model URL for character ${character.id}:`)
        console.log(`  Character name: "${character.name}" (keeping original name)`)
        console.log(`  Model URL: ${modelUrl}`)

        // Sadece modelUrl'i ayarla, ismi değiştirme
        updateCharacter(character.id, {
          avatar_data: {
            ...character.avatar_data,
            modelUrl: modelUrl,
            color: character.avatar_data?.color || '#ff6b35',
          }
        })

        // Düzeltildi olarak işaretle
        fixedCharactersRef.current.add(character.id)
      } else if (character.avatar_data?.modelUrl || character.avatar_data?.characterModel) {
        // Zaten model URL'i var, işaretle
        fixedCharactersRef.current.add(character.id)
      }
    })
  }, [characters, updateCharacter]) // Her karakter değişikliğinde çalış

  return null // Bu component görsel bir şey render etmez
}
