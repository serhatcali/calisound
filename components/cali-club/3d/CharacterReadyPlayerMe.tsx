'use client'

import React, { useRef, Suspense, useEffect, useState } from 'react'
import { Group, AnimationMixer } from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useCaliClubStore, Character as CharacterType } from '@/stores/cali-club-store'
import { getCharacterAvatarUrl } from '@/lib/ready-player-me'

interface CharacterReadyPlayerMeProps {
  character: CharacterType
}

// Separate component for loading GLTF model to avoid hook conditional issues
function AvatarModel({ url, groupRef }: { url: string; groupRef: React.RefObject<Group> }) {
  const gltf = useGLTF(url, true)
  const animations = useAnimations(gltf.animations || [], groupRef)
  
  return <primitive object={gltf.scene.clone()} />
}

export function CharacterReadyPlayerMe({ character }: CharacterReadyPlayerMeProps) {
  const groupRef = useRef<Group>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const { isPlaying, currentCharacter, setCurrentCharacter } = useCaliClubStore()
  const [modelUrl, setModelUrl] = useState<string>('/models/character.glb') // Default fallback
  const [error, setError] = useState(false)
  
  const color = character.avatar_data?.color || '#ff6b35'
  const size = character.avatar_data?.size || 1
  const isCurrent = currentCharacter?.id === character.id

  // Generate avatar URL using Ready Player Me helper
  useEffect(() => {
    try {
      const url = getCharacterAvatarUrl(character)
      setModelUrl(url)
    } catch (err) {
      console.error('Error generating avatar URL:', err)
      setError(true)
    }
  }, [character])

  // Note: Animation mixer initialization would need to be done inside AvatarModel component
  // For now, we'll use simple body movement animations

  // Animation for dance movements
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
    
    if (groupRef.current && isPlaying) {
      const time = state.clock.elapsedTime
      const offset = character.id.length * 0.5
      
      // Subtle body movement synchronized with music
      groupRef.current.position.y = Math.sin(time * 2 + offset) * 0.02
      groupRef.current.rotation.y = Math.sin(time * 1.2 + offset) * 0.02
    }
  })

  const handleCharacterClick = (e: any) => {
    e.stopPropagation()
    setCurrentCharacter(character)
  }

  // If error occurred, show a placeholder
  if (error) {
    return (
      <group
        ref={groupRef}
        position={[character.position.x, character.position.y, character.position.z]}
        scale={size}
        onClick={handleCharacterClick}
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
      <Suspense fallback={null}>
        <AvatarModel url={modelUrl} groupRef={groupRef} />
      </Suspense>

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

      {/* Name Tag */}
      <Html
        position={[0, 2.3 * size, 0]}
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
          {character.name}
        </div>
      </Html>
    </group>
  )
}
