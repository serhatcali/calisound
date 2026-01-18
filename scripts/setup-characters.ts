/**
 * Karakter Kurulum Scripti
 * 
 * Bu script, C1, C2, C3, C4 karakterlerini otomatik olarak yapılandırır
 * 
 * Kullanım:
 * 1. Mixamo'dan C1.fbx, C2.fbx, C3.fbx, C4.fbx dosyalarını indirin
 * 2. public/models/ klasörüne koyun
 * 3. Bu script'i çalıştırın veya manuel olarak karakterleri güncelleyin
 */

import { useCaliClubStore } from '@/stores/cali-club-store'

/**
 * Karakterleri otomatik olarak yapılandır
 * Her karaktere farklı model ve renk atar
 */
export function setupCharacters() {
  const { characters, updateCharacter } = useCaliClubStore()
  
  // Farklı renkler
  const colors = [
    '#ff6b35', // Turuncu
    '#4ecdc4', // Turkuaz
    '#45b7d1', // Mavi
    '#f9ca24', // Sarı
    '#ee5a6f', // Pembe
    '#a55eea', // Mor
    '#26de81', // Yeşil
    '#fd79a8', // Açık pembe
  ]
  
  // Karakterleri güncelle
  characters.forEach((character, index) => {
    const characterNumber = index + 1
    const modelUrl = `/models/C${characterNumber}.fbx`
    const color = colors[index % colors.length]
    
    updateCharacter(character.id, {
      name: `C${characterNumber}`,
      gender: 'female', // Veya karaktere göre ayarlayın
      avatar_data: {
        ...character.avatar_data,
        modelUrl: modelUrl,
        color: color,
        size: 1.0,
      }
    })
    
    console.log(`✅ Karakter ${character.id} güncellendi:`)
    console.log(`   Model: ${modelUrl}`)
    console.log(`   Renk: ${color}`)
  })
}

/**
 * Manuel karakter yapılandırması örneği
 */
export const characterConfigs = {
  C1: {
    name: 'C1',
    gender: 'female' as const,
    modelUrl: '/models/C1.fbx',
    color: '#ff6b35',
  },
  C2: {
    name: 'C2',
    gender: 'female' as const,
    modelUrl: '/models/C2.fbx',
    color: '#4ecdc4',
  },
  C3: {
    name: 'C3',
    gender: 'female' as const,
    modelUrl: '/models/C3.fbx',
    color: '#45b7d1',
  },
  C4: {
    name: 'C4',
    gender: 'female' as const,
    modelUrl: '/models/C4.fbx',
    color: '#f9ca24',
  },
}
