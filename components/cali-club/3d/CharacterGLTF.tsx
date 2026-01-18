'use client'

import React, { useRef, Suspense, useEffect } from 'react'
import { Group, AnimationMixer } from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useCaliClubStore, Character as CharacterType } from '@/stores/cali-club-store'
import { customizeCharacterMaterials } from './CharacterCustomizer'
import { FBXModel } from './FBXModel'
import { GLTFModel } from './GLTFModel'
import * as THREE from 'three'

interface CharacterGLTFProps {
  character: CharacterType
  modelUrl?: string
}

// Default model URL - You can replace this with your own GLTF or FBX model
// Free realistic character models available at:
// - https://www.mixamo.com (Adobe's free character models - RECOMMENDED)
//   * Sign in with Adobe account (free)
//   * Choose a character
//   * Add animation (dance, idle, etc.)
//   * Export as FBX Binary format (GLTF yok!)
//   * Place in public/models/ folder
// - https://sketchfab.com (search for "rigged human character")
// - https://polyhaven.com/models

// Model URL priority:
// 1. character.avatar_data.modelUrl (if set) - ÖZEL MODEL
// 2. Character name-based (C1.fbx, C2.fbx, etc.) - İSİM BAZLI
// 3. Gender-based default (character-male.fbx or character-female.fbx)
// 4. DEFAULT_MODEL_URL fallback
// Supports both .glb/.gltf and .fbx formats
const DEFAULT_MODEL_URL = '/models/character.fbx'
const DEFAULT_MALE_MODEL = '/models/character-male.fbx'
const DEFAULT_FEMALE_MODEL = '/models/character-female.fbx'

// Character name to model mapping (C1, C2, C3, C4, etc.)
function getModelByCharacterName(characterName: string): string | null {
  // Check if character name matches pattern like "C1", "C2", etc.
  // Case-insensitive match
  const match = characterName.match(/^C(\d+)$/i)
  if (match) {
    const number = match[1]
    const modelPath = `/models/C${number}.fbx`
    console.log(`[CharacterGLTF] Character name "${characterName}" → Model: ${modelPath}`)
    return modelPath
  }
  return null
}

export function CharacterGLTF({ character, modelUrl }: CharacterGLTFProps) {
  const groupRef = useRef<Group>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const { currentSong, isPlaying, currentCharacter, setCurrentCharacter } = useCaliClubStore()
  
  // Determine model URL based on character data
  const getModelUrl = (): string => {
    // Priority 1: Character's selected characterModel (new system - highest priority)
    if (character.avatar_data?.characterModel) {
      const modelPath = `/models/characters/${character.avatar_data.characterModel}.glb`
      console.log(`[CharacterGLTF] Using characterModel: ${modelPath}`)
      return modelPath
    }
    
    // Priority 2: Explicit modelUrl prop (only if no characterModel)
    if (modelUrl && !character.avatar_data?.characterModel) {
      console.log(`[CharacterGLTF] Using explicit modelUrl prop: ${modelUrl}`)
      return modelUrl
    }
    
    // Priority 3: Character's avatar_data.modelUrl (özel model - only if no characterModel)
    if (character.avatar_data?.modelUrl && !character.avatar_data?.characterModel) {
      console.log(`[CharacterGLTF] Using avatar_data.modelUrl: ${character.avatar_data.modelUrl}`)
      return character.avatar_data.modelUrl
    }
    
    // Priority 4: Character name-based (C1, C2, C3, C4, etc.) - Legacy support
    const nameBasedModel = getModelByCharacterName(character.name)
    if (nameBasedModel) {
      console.log(`[CharacterGLTF] Using name-based model: ${nameBasedModel}`)
      return nameBasedModel
    }
    
    // Priority 5: Try to infer from character index (fallback if name not fixed yet)
    // This helps when CharacterNameFixer hasn't run yet
    const characterIndex = character.name.match(/C(\d+)/i)?.[1]
    if (characterIndex) {
      const fallbackModel = `/models/C${characterIndex}.fbx`
      console.log(`[CharacterGLTF] Using index-based fallback: ${fallbackModel}`)
      return fallbackModel
    }
    
    // Priority 6: Use C1.fbx as default for any character (since we have C1-C4 files)
    // This prevents looking for character-female.fbx which doesn't exist
    console.log(`[CharacterGLTF] Using default model: /models/C1.fbx`)
    return '/models/C1.fbx'
  }
  
  const finalModelUrl = getModelUrl()
  
  // Debug logging
  useEffect(() => {
    console.log(`[CharacterGLTF] Character: ${character.name} (${character.id})`)
    console.log(`[CharacterGLTF] characterModel: ${character.avatar_data?.characterModel || 'none'}`)
    console.log(`[CharacterGLTF] modelUrl: ${character.avatar_data?.modelUrl || 'none'}`)
    console.log(`[CharacterGLTF] Final Model URL: ${finalModelUrl}`)
    console.log(`[CharacterGLTF] Character name: "${character.name}"`)
  }, [character.name, finalModelUrl, character.avatar_data?.characterModel, character.avatar_data?.modelUrl])
  
  const color = character.avatar_data.color || '#ff6b35'
  const size = character.avatar_data.size || 1
  const isCurrent = currentCharacter?.id === character.id
  
  // Check file extension to determine format
  const isFBX = finalModelUrl.toLowerCase().endsWith('.fbx')
  const isGLTF = finalModelUrl.toLowerCase().endsWith('.gltf') || finalModelUrl.toLowerCase().endsWith('.glb')
  
  // For GLTF models, we'll use a separate component wrapped in Suspense (like FBX)
  // This avoids conditional hook calls and handles loading errors properly
  
  // Log model loading status
  useEffect(() => {
    if (isFBX) {
      console.log(`[CharacterGLTF] ✅ FBX model will be loaded by FBXModel component: ${finalModelUrl}`)
    } else if (isGLTF) {
      console.log(`[CharacterGLTF] ✅ GLTF model will be loaded by GLTFModel component: ${finalModelUrl}`)
    }
  }, [finalModelUrl, isFBX, isGLTF])

  // Animation mixer for dance movements (only for subtle body movement, animations handled by model components)
  useFrame((state, delta) => {
    // Animations are handled by FBXModel and GLTFModel components
    // This is just for any additional subtle movement if needed
  })

  const handleCharacterClick = (e: any) => {
    e.stopPropagation()
    setCurrentCharacter(character)
  }

  // If model is not available (models load separately in FBXModel/GLTFModel components)
  // This check is no longer needed as models load in separate components
  const showPlaceholder = false // Models load in FBXModel/GLTFModel components
  if (showPlaceholder) {
    return (
      <group
        ref={groupRef}
        position={[character.position.x, character.position.y, character.position.z]}
        scale={size}
        onClick={handleCharacterClick}
        onPointerEnter={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerLeave={() => {
          document.body.style.cursor = 'default'
        }}
      >
        {/* Fallback: Simple placeholder character */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Name Tag */}
        <Html
          position={[0, 1.3, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.85), rgba(255, 0, 255, 0.85))',
              color: 'white',
              padding: '5px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {character.name}
          </div>
        </Html>
      </group>
    )
  }

  // FBX models from Mixamo are typically very large, but scale is handled in FBXModel component
  // For GLTF models, use the character's size
  const finalScale = isFBX ? 1 : size // FBX scale is applied in FBXModel component (0.001), don't scale here
  
  // Character position is already snapped to grid by Characters.tsx
  // Use the position directly, but ensure y is 0
  const snappedPosition = {
    x: character.position.x, // Already snapped to grid center by Characters.tsx
    y: 0, // Always on the dance floor
    z: character.position.z // Already snapped to grid center by Characters.tsx
  }
  
  return (
    <group
      ref={groupRef}
      position={[snappedPosition.x, snappedPosition.y, snappedPosition.z]}
      scale={finalScale}
      rotation={[0, -Math.PI / 2, 0]} // Rotate -90 degrees to face forward (towards camera)
      onClick={handleCharacterClick}
      onPointerEnter={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {isFBX ? (
        <FBXModel 
          url={finalModelUrl}
          isPlaying={isPlaying}
          onModelLoad={(loadedModel) => {
            // Store model reference for material customization
            if (loadedModel) {
              const customizations = character.avatar_data?.customizations
              customizeCharacterMaterials(loadedModel, {
                clothingColor: customizations?.clothingColor || character.avatar_data?.color,
                skinTone: customizations?.skinColor,
                hairColor: customizations?.hairColor,
              })
            }
          }}
        />
      ) : isGLTF ? (
        <GLTFModel 
          url={finalModelUrl}
          isPlaying={isPlaying}
          customizations={{
            hairColor: character.avatar_data?.customizations?.hairColor,
            clothingColor: character.avatar_data?.customizations?.clothingColor || character.avatar_data?.color,
            skinColor: character.avatar_data?.customizations?.skinColor,
          }}
        />
      ) : (
        <mesh>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {/* Selection Indicator */}
      {isCurrent && (
        <>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1.2}
              transparent
              opacity={0.7}
            />
          </mesh>
        </>
      )}

      {/* Name Tag - Position based on model type */}
      <Html
        position={[0, isGLTF ? 3.5 : 2.3 * size, 0]} // GLTF models are scaled 2.5x, so name tag needs to be higher
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: isCurrent
              ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.95), rgba(255, 0, 255, 0.95))'
              : 'linear-gradient(135deg, rgba(0, 255, 255, 0.85), rgba(255, 0, 255, 0.85))',
            color: 'white',
            padding: '5px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
            border: isCurrent ? '3px solid rgba(255, 255, 255, 0.6)' : '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: isCurrent
              ? '0 8px 16px rgba(0,255,255,0.6)'
              : '0 6px 12px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s ease',
          }}
        >
          {character.name || 'Unnamed'}
        </div>
      </Html>
    </group>
  )
}

// Preload default models for better performance
// Note: Only preload if models exist
// FBX models are loaded on-demand, no preload needed
