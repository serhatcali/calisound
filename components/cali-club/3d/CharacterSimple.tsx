'use client'

import { useRef } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useCaliClubStore, Character as CharacterType } from '@/stores/cali-club-store'
import * as THREE from 'three'

interface CharacterSimpleProps {
  character: CharacterType
}

export function CharacterSimple({ character }: CharacterSimpleProps) {
  const groupRef = useRef<Group>(null)
  const { isPlaying, currentCharacter, setCurrentCharacter } = useCaliClubStore()

  const color = character.avatar_data?.color || '#ff6b35'
  const size = character.avatar_data?.size || 1
  const isCurrent = currentCharacter?.id === character.id

  // Smooth dance animation
  useFrame((state) => {
    if (groupRef.current && isPlaying) {
      const time = state.clock.elapsedTime
      const offset = character.id.length * 0.5
      
      // Subtle body movement
      groupRef.current.position.y = Math.sin(time * 2 + offset) * 0.02
      groupRef.current.rotation.y = Math.sin(time * 1.2 + offset) * 0.05
    }
  })

  const handleCharacterClick = (e: any) => {
    e.stopPropagation()
    setCurrentCharacter(character)
  }

  // Create a simple but better-looking character using basic shapes
  // This is a minimal, stylized approach that looks better than complex procedural
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
      {/* Head - Simple sphere with better proportions */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#fdbcb4"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Body - Simple rounded box shape */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.25]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Arms - Simple cylinders */}
      <mesh position={[-0.3, 0.8, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
        <meshStandardMaterial
          color="#fdbcb4"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.3, 0.8, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
        <meshStandardMaterial
          color="#fdbcb4"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Legs - Simple cylinders */}
      <mesh position={[-0.12, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.12, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

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
