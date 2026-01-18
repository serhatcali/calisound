/**
 * Character Customizer - Runtime character customization utilities
 * 
 * Bu dosya, yüklenen karakter modellerini runtime'da özelleştirmek için
 * yardımcı fonksiyonlar içerir.
 */

import * as THREE from 'three'
import { Mesh, MeshStandardMaterial, Group } from 'three'

/**
 * Karakter modelindeki materyalleri özelleştir
 * - Kıyafet renkleri
 * - Cilt tonu
 * - Saç rengi
 * - Göz rengi
 */
export function customizeCharacterMaterials(
  model: Group | THREE.Object3D,
  options: {
    clothingColor?: string
    skinTone?: string
    hairColor?: string
    eyeColor?: string
  }
) {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      const material = child.material as MeshStandardMaterial
      
      if (!material) return
      
      // Material ismini kontrol et (Mixamo genellikle isimlendirir)
      const name = child.name.toLowerCase()
      
      // Kıyafet materyalleri
      if (
        name.includes('cloth') ||
        name.includes('shirt') ||
        name.includes('pants') ||
        name.includes('dress') ||
        name.includes('jacket')
      ) {
        if (options.clothingColor) {
          material.color.setHex(parseInt(options.clothingColor.replace('#', ''), 16))
          material.needsUpdate = true
        }
      }
      
      // Cilt materyalleri
      if (
        name.includes('skin') ||
        name.includes('face') ||
        name.includes('body') ||
        name.includes('hand') ||
        name.includes('head')
      ) {
        if (options.skinTone) {
          material.color.setHex(parseInt(options.skinTone.replace('#', ''), 16))
          material.needsUpdate = true
        }
      }
      
      // Saç materyalleri
      if (name.includes('hair')) {
        if (options.hairColor) {
          material.color.setHex(parseInt(options.hairColor.replace('#', ''), 16))
          material.needsUpdate = true
        }
      }
      
      // Göz materyalleri
      if (name.includes('eye')) {
        if (options.eyeColor) {
          material.color.setHex(parseInt(options.eyeColor.replace('#', ''), 16))
          material.needsUpdate = true
        }
      }
    }
  })
}

/**
 * Karakter modelindeki tüm materyalleri listele
 * Debug için kullanışlı - hangi materyallerin mevcut olduğunu görmek için
 */
export function listCharacterMaterials(model: Group | THREE.Object3D): string[] {
  const materials: string[] = []
  
  model.traverse((child) => {
    if (child instanceof Mesh && child.material) {
      const name = child.name || 'unnamed'
      materials.push(name)
    }
  })
  
  return [...new Set(materials)] // Unique values
}

/**
 * Karakter modelindeki belirli bir mesh'i bul ve özelleştir
 */
export function findAndCustomizeMesh(
  model: Group | THREE.Object3D,
  meshName: string,
  callback: (mesh: Mesh, material: MeshStandardMaterial) => void
) {
  model.traverse((child) => {
    if (child instanceof Mesh && child.name.toLowerCase().includes(meshName.toLowerCase())) {
      const material = child.material as MeshStandardMaterial
      if (material) {
        callback(child, material)
      }
    }
  })
}

/**
 * Karakter modeline glow efekti ekle
 */
export function addGlowEffect(
  model: Group | THREE.Object3D,
  color: string = '#00ffff',
  intensity: number = 0.5
) {
  model.traverse((child) => {
    if (child instanceof Mesh) {
      const material = child.material as MeshStandardMaterial
      if (material) {
        material.emissive.setHex(parseInt(color.replace('#', ''), 16))
        material.emissiveIntensity = intensity
        material.needsUpdate = true
      }
    }
  })
}

/**
 * Karakter modeline outline efekti ekle
 */
export function addOutlineEffect(
  model: Group | THREE.Object3D,
  color: string = '#ffffff',
  thickness: number = 0.01
) {
  // Bu özellik için @react-three/postprocessing veya benzeri bir kütüphane gerekir
  // Şimdilik basit bir glow efekti kullanıyoruz
  addGlowEffect(model, color, 0.3)
}
