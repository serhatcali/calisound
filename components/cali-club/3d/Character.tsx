'use client'

import { useRef } from 'react'
import { Mesh, Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { useCaliClubStore, Character as CharacterType } from '@/stores/cali-club-store'

interface CharacterProps {
  character: CharacterType
}

export function Character({ character }: CharacterProps) {
  const rootRef = useRef<Group>(null)
  const bodyGroupRef = useRef<Group>(null)
  const headGroupRef = useRef<Group>(null)
  const leftShoulderRef = useRef<Group>(null)
  const leftUpperArmRef = useRef<Group>(null)
  const leftElbowRef = useRef<Group>(null)
  const leftHandRef = useRef<Group>(null)
  const rightShoulderRef = useRef<Group>(null)
  const rightUpperArmRef = useRef<Group>(null)
  const rightElbowRef = useRef<Group>(null)
  const rightHandRef = useRef<Group>(null)
  const leftHipRef = useRef<Group>(null)
  const leftKneeRef = useRef<Group>(null)
  const leftAnkleRef = useRef<Group>(null)
  const rightHipRef = useRef<Group>(null)
  const rightKneeRef = useRef<Group>(null)
  const rightAnkleRef = useRef<Group>(null)
  const { currentSong, isPlaying, currentCharacter, setCurrentCharacter } = useCaliClubStore()

  const color = character.avatar_data.color || '#ff6b35'
  const size = character.avatar_data.size || 1
  const showSongInfo = isPlaying && currentSong
  const isFemale = character.gender === 'female'
  const isCurrent = currentCharacter?.id === character.id

  // Ultra-realistic human-like animation with natural physics, timing, and smooth interpolation
  useFrame((state) => {
    if (rootRef.current && isPlaying) {
      const time = state.clock.elapsedTime
      const offset = character.id.length * 0.5
      
      // Smooth easing functions for more natural movement
      const easeInOut = (t: number) => t * t * (3 - 2 * t)
      const smoothSin = (t: number, freq: number, phase: number = 0) => {
        const raw = Math.sin(t * freq + phase)
        return easeInOut((raw + 1) / 2) * 2 - 1
      }
      
      const beat = smoothSin(time, 2)
      const beat2 = smoothSin(time, 4)
      const beat3 = smoothSin(time, 6)
      const smoothBeat = smoothSin(time, 1.5)
      const microBeat = smoothSin(time, 8)
      
      // Root body movement - very subtle and natural with breathing effect and micro-movements
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = beat * 0.025 + beat2 * 0.005 + smoothBeat * 0.003 + microBeat * 0.001
        bodyGroupRef.current.rotation.z = smoothSin(time, 1.5, offset) * 0.008
        bodyGroupRef.current.rotation.x = smoothSin(time, 1.2, offset) * 0.006
      }
      
      // Head movement - natural and smooth with slight delay, breathing, and micro-expressions
      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = smoothSin(time, 1.2, offset) * 0.02 + smoothBeat * 0.005 + microBeat * 0.002
        headGroupRef.current.rotation.y = smoothSin(time, 1.5, offset) * 0.025 + microBeat * 0.003
        headGroupRef.current.rotation.z = smoothSin(time, 1.3, offset) * 0.01 + microBeat * 0.001
        // Natural head bob with breathing and micro-movements
        headGroupRef.current.position.y = beat * 0.008 + smoothBeat * 0.002 + microBeat * 0.001
      }
      
      // Left arm - natural dance movement with proper physics, momentum, and fluid transitions
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.x = smoothSin(time, 2.5, offset) * 0.18 + smoothSin(time, 1.2) * 0.05 + microBeat * 0.02
        leftShoulderRef.current.rotation.z = smoothSin(time, 2, offset) * 0.1 + microBeat * 0.01
        leftShoulderRef.current.rotation.y = smoothSin(time, 1.8, offset) * 0.05 + microBeat * 0.01
      }
      if (leftElbowRef.current) {
        leftElbowRef.current.rotation.x = smoothSin(time, 3, offset) * 0.25 + smoothSin(time, 2.5) * 0.08 + microBeat * 0.03
        leftElbowRef.current.rotation.z = smoothSin(time, 2.5, offset) * 0.04 + microBeat * 0.01
      }
      if (leftHandRef.current) {
        leftHandRef.current.rotation.z = smoothSin(time, 3.5, offset) * 0.06 + microBeat * 0.02
        leftHandRef.current.rotation.x = smoothSin(time, 3.2, offset) * 0.04 + microBeat * 0.015
        leftHandRef.current.rotation.y = smoothSin(time, 3.8, offset) * 0.03 + microBeat * 0.01
      }
      
      // Right arm - natural dance movement with opposite phase and fluid transitions
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x = smoothSin(time, 2.5, offset + Math.PI) * 0.18 + smoothSin(time, 1.2, Math.PI) * 0.05 + microBeat * 0.02
        rightShoulderRef.current.rotation.z = smoothSin(time, 2, offset + Math.PI) * 0.1 + microBeat * 0.01
        rightShoulderRef.current.rotation.y = smoothSin(time, 1.8, offset + Math.PI) * 0.05 + microBeat * 0.01
      }
      if (rightElbowRef.current) {
        rightElbowRef.current.rotation.x = smoothSin(time, 3, offset + Math.PI) * 0.25 + smoothSin(time, 2.5, Math.PI) * 0.08 + microBeat * 0.03
        rightElbowRef.current.rotation.z = smoothSin(time, 2.5, offset + Math.PI) * 0.04 + microBeat * 0.01
      }
      if (rightHandRef.current) {
        rightHandRef.current.rotation.z = smoothSin(time, 3.5, offset + Math.PI) * 0.06 + microBeat * 0.02
        rightHandRef.current.rotation.x = smoothSin(time, 3.2, offset + Math.PI) * 0.04 + microBeat * 0.015
        rightHandRef.current.rotation.y = smoothSin(time, 3.8, offset + Math.PI) * 0.03 + microBeat * 0.01
      }
      
      // Left leg - natural dance movement with weight shift and fluid transitions
      if (leftHipRef.current) {
        leftHipRef.current.rotation.x = smoothSin(time, 2, offset) * 0.08 + smoothSin(time, 1.5) * 0.03 + microBeat * 0.015
        leftHipRef.current.rotation.z = smoothSin(time, 1.8, offset) * 0.04 + microBeat * 0.01
      }
      if (leftKneeRef.current) {
        leftKneeRef.current.rotation.x = smoothSin(time, 2.5, offset) * 0.12 + smoothSin(time, 2) * 0.05 + microBeat * 0.02
      }
      if (leftAnkleRef.current) {
        leftAnkleRef.current.rotation.x = smoothSin(time, 2.8, offset) * 0.05 + microBeat * 0.01
        leftAnkleRef.current.rotation.z = smoothSin(time, 2.6, offset) * 0.03 + microBeat * 0.008
      }
      
      // Right leg - natural dance movement with opposite phase and fluid transitions
      if (rightHipRef.current) {
        rightHipRef.current.rotation.x = smoothSin(time, 2, offset + Math.PI) * 0.08 + smoothSin(time, 1.5, Math.PI) * 0.03 + microBeat * 0.015
        rightHipRef.current.rotation.z = smoothSin(time, 1.8, offset + Math.PI) * 0.04 + microBeat * 0.01
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = smoothSin(time, 2.5, offset + Math.PI) * 0.12 + smoothSin(time, 2, Math.PI) * 0.05 + microBeat * 0.02
      }
      if (rightAnkleRef.current) {
        rightAnkleRef.current.rotation.x = smoothSin(time, 2.8, offset + Math.PI) * 0.05 + microBeat * 0.01
        rightAnkleRef.current.rotation.z = smoothSin(time, 2.6, offset + Math.PI) * 0.03 + microBeat * 0.008
      }
      
      // Root rotation - very subtle body sway with natural rhythm and micro-movements
      rootRef.current.rotation.y = smoothSin(time, 1.2, offset) * 0.03 + smoothSin(time, 0.8) * 0.01 + microBeat * 0.005
    }
  })

  // Ultra-realistic skin tone and colors with natural variation and subsurface scattering effect
  const skinTone = isFemale ? '#fdbcb4' : '#d4a574'
  const skinToneDark = isFemale ? '#e8a99a' : '#c4955f'
  const skinToneLight = isFemale ? '#ffe0d6' : '#e8c99f'
  const clothingColor = color
  const hairColor = isFemale ? '#8b4513' : '#2c1810'
  const eyeColor = isFemale ? '#4a90e2' : '#2d5986'
  
  // Enhanced material properties for ultra-realism with advanced lighting and subsurface scattering
  const skinMaterial = {
    color: skinTone,
    roughness: 0.55, // More reflective for natural skin with subtle shine
    metalness: 0.01, // Very low metalness for organic material
    emissive: skinToneLight,
    emissiveIntensity: 0.05, // Enhanced subsurface scattering effect
    envMapIntensity: 1.5, // Better environment reflection
  }
  
  const clothingMaterial = {
    color: clothingColor,
    roughness: 0.6, // More reflective for better fabric appearance
    metalness: 0.1, // Enhanced metallic sheen for modern fabrics
    envMapIntensity: 1.2, // Environment reflection
    emissive: clothingColor,
    emissiveIntensity: 0.02, // Subtle fabric glow
  }
  
  const eyeMaterial = {
    color: '#ffffff',
    roughness: 0.1, // Very smooth and reflective for eyes
    metalness: 0.0,
    emissive: '#ffffff',
    emissiveIntensity: 0.15, // Brighter eyes
    envMapIntensity: 2.0, // Strong reflection
  }
  
  const irisMaterial = {
    color: eyeColor,
    roughness: 0.2, // Smooth iris surface
    metalness: 0.0,
    emissive: eyeColor,
    emissiveIntensity: 0.08, // More vibrant iris
    envMapIntensity: 1.5,
  }
  
  const hairMaterial = {
    color: hairColor,
    roughness: 0.88, // Matte hair
    metalness: 0.02, // Slight sheen
    envMapIntensity: 0.8,
  }

  const handleCharacterClick = (e: any) => {
    e.stopPropagation()
    setCurrentCharacter(character)
  }

  return (
    <group
      ref={rootRef}
      position={[character.position.x, character.position.y, character.position.z]}
      onClick={handleCharacterClick}
      onPointerEnter={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {/* Body Group - Ultra realistic with proper human proportions and anatomical accuracy */}
      <group ref={bodyGroupRef}>
        {/* Ribcage - More defined chest structure with realistic proportions and muscle definition */}
        <RoundedBox
          position={[0, 1.15 * size, 0]}
          args={[0.48 * size, 0.4 * size, 0.38 * size]}
          radius={0.16 * size}
          smoothness={16}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>
        
        {/* Pectoral muscles - More defined chest muscles */}
        <RoundedBox
          position={[-0.14 * size, 1.05 * size, 0.18 * size]}
          args={[0.18 * size, 0.22 * size, 0.12 * size]}
          radius={0.1 * size}
          smoothness={12}
          castShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>
        <RoundedBox
          position={[0.14 * size, 1.05 * size, 0.18 * size]}
          args={[0.18 * size, 0.22 * size, 0.12 * size]}
          radius={0.1 * size}
          smoothness={12}
          castShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>

        {/* Torso - More organic and realistic with proper proportions, tapering, and muscle definition */}
        <RoundedBox
          position={[0, 0.68 * size, 0]}
          args={[0.44 * size, 0.7 * size, 0.34 * size]}
          radius={0.14 * size}
          smoothness={16}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>
        
        {/* Abdominal muscles - More defined abs */}
        {[0, 1, 2, 3].map((i) => (
          <RoundedBox
            key={`abs-${i}`}
            position={[0, 0.85 * size - i * 0.08 * size, 0.16 * size]}
            args={[0.32 * size, 0.06 * size, 0.04 * size]}
            radius={0.02 * size}
            smoothness={8}
            castShadow
          >
            <meshStandardMaterial
              {...clothingMaterial}
            />
          </RoundedBox>
        ))}

        {/* Waist - More defined and tapered with realistic curves and natural narrowing */}
        <RoundedBox
          position={[0, 0.36 * size, 0]}
          args={[0.4 * size, 0.24 * size, 0.3 * size]}
          radius={0.12 * size}
          smoothness={16}
          castShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>
        
        {/* Waist curve - More organic transition */}
        <mesh position={[0, 0.36 * size, 0]} castShadow>
          <torusGeometry args={[0.38 * size, 0.02 * size, 16, 32, Math.PI]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </mesh>

        {/* Hip/Pelvis - More realistic with proper shape, connection to legs, and wider hips */}
        <RoundedBox
          position={[0, 0.12 * size, 0]}
          args={[0.46 * size, 0.3 * size, 0.36 * size]}
          radius={0.14 * size}
          smoothness={16}
          castShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>
        
        {/* Hip curves - More defined hip structure */}
        <RoundedBox
          position={[-0.18 * size, 0.12 * size, 0.15 * size]}
          args={[0.12 * size, 0.3 * size, 0.14 * size]}
          radius={0.08 * size}
          smoothness={12}
          castShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>
        <RoundedBox
          position={[0.18 * size, 0.12 * size, 0.15 * size]}
          args={[0.12 * size, 0.3 * size, 0.14 * size]}
          radius={0.08 * size}
          smoothness={12}
          castShadow
        >
          <meshStandardMaterial
            {...clothingMaterial}
          />
        </RoundedBox>

        {/* Shoulder muscles - More defined deltoids with better shape and connection */}
        <RoundedBox
          position={[-0.34 * size, 0.94 * size, 0]}
          args={[0.16 * size, 0.18 * size, 0.16 * size]}
          radius={0.1 * size}
          smoothness={14}
          castShadow
        >
          <meshStandardMaterial
            {...skinMaterial}
          />
        </RoundedBox>
        {/* Deltoid front - More defined shoulder cap */}
        <RoundedBox
          position={[-0.34 * size, 0.94 * size, 0.08 * size]}
          args={[0.16 * size, 0.18 * size, 0.1 * size]}
          radius={0.08 * size}
          smoothness={12}
          castShadow
        >
          <meshStandardMaterial
            {...skinMaterial}
          />
        </RoundedBox>
        <RoundedBox
          position={[0.34 * size, 0.94 * size, 0]}
          args={[0.16 * size, 0.18 * size, 0.16 * size]}
          radius={0.1 * size}
          smoothness={14}
          castShadow
        >
          <meshStandardMaterial
            {...skinMaterial}
          />
        </RoundedBox>
        {/* Deltoid front - More defined shoulder cap */}
        <RoundedBox
          position={[0.34 * size, 0.94 * size, 0.08 * size]}
          args={[0.16 * size, 0.18 * size, 0.1 * size]}
          radius={0.08 * size}
          smoothness={12}
          castShadow
        >
          <meshStandardMaterial
            {...skinMaterial}
          />
        </RoundedBox>

        {/* Neck - Smooth and realistic with proper length and connection to head */}
        <mesh
          position={[0, 1.32 * size, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.08 * size, 0.1 * size, 0.18 * size, 32]} />
          <meshStandardMaterial
            {...skinMaterial}
          />
        </mesh>
        {/* Neck base - More defined connection to torso */}
        <mesh position={[0, 1.24 * size, 0]} castShadow>
          <sphereGeometry args={[0.1 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...skinMaterial}
          />
        </mesh>

        {/* Head Group - Ultra realistic human head with proper proportions */}
        <group ref={headGroupRef} position={[0, 1.55 * size, 0]}>
          {/* Head - More organic ellipsoid with proper proportions and higher detail */}
          <mesh castShadow>
            <sphereGeometry args={[0.24 * size, 80, 80, 0, Math.PI * 2, 0, Math.PI]} />
            <meshStandardMaterial
              {...skinMaterial}
            />
          </mesh>

          {/* Head back - More detailed with higher resolution */}
          <mesh position={[0, 0, -0.18 * size]} castShadow>
            <sphereGeometry args={[0.24 * size, 80, 80, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial
              {...skinMaterial}
            />
          </mesh>
          
          {/* Cheekbones - More defined facial structure */}
          <RoundedBox
            position={[-0.12 * size, -0.02 * size, 0.18 * size]}
            args={[0.08 * size, 0.06 * size, 0.04 * size]}
            radius={0.02 * size}
            smoothness={8}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>
          <RoundedBox
            position={[0.12 * size, -0.02 * size, 0.18 * size]}
            args={[0.08 * size, 0.06 * size, 0.04 * size]}
            radius={0.02 * size}
            smoothness={8}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>
          
          {/* Jawline - More defined */}
          <RoundedBox
            position={[0, -0.12 * size, 0.15 * size]}
            args={[0.18 * size, 0.04 * size, 0.06 * size]}
            radius={0.015 * size}
            smoothness={8}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>

          {/* Hair - More realistic with layers and volume */}
          <mesh position={[0, 0.14 * size, 0]} castShadow>
            <sphereGeometry args={[0.26 * size, 80, 80]} />
            <meshStandardMaterial
              {...hairMaterial}
            />
          </mesh>
          
          {/* Hair front - More detailed and realistic */}
          <RoundedBox
            position={[0, 0.2 * size, 0.1 * size]}
            args={[0.42 * size, 0.14 * size, 0.1 * size]}
            radius={0.06 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...hairMaterial}
            />
          </RoundedBox>

          {/* Hair side layers - More realistic volume */}
          <RoundedBox
            position={[-0.17 * size, 0.12 * size, 0.07 * size]}
            args={[0.1 * size, 0.24 * size, 0.12 * size]}
            radius={0.04 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...hairMaterial}
            />
          </RoundedBox>
          <RoundedBox
            position={[0.17 * size, 0.12 * size, 0.07 * size]}
            args={[0.1 * size, 0.24 * size, 0.12 * size]}
            radius={0.04 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...hairMaterial}
            />
          </RoundedBox>
          
          {/* Hair texture layers - More realistic hair strands */}
          {[0, 1, 2, 3, 4].map((i) => (
            <RoundedBox
              key={`hair-strand-${i}`}
              position={[(i - 2) * 0.08 * size, 0.18 * size, 0.12 * size]}
              args={[0.03 * size, 0.08 * size, 0.02 * size]}
              radius={0.01 * size}
              smoothness={6}
              castShadow
            >
              <meshStandardMaterial
                {...hairMaterial}
              />
            </RoundedBox>
          ))}

          {/* Left Eye - Ultra realistic with all details and proper proportions */}
          <group position={[-0.085 * size, 0.06 * size, 0.21 * size]}>
            {/* Eye socket - More defined and realistic */}
            <mesh castShadow>
              <sphereGeometry args={[0.055 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color={skinToneDark}
                roughness={0.75}
                metalness={0.02}
                transparent
                opacity={0.4}
              />
            </mesh>
            {/* Eye white - More realistic with proper size */}
            <mesh position={[0, 0, 0.013 * size]} castShadow>
              <sphereGeometry args={[0.048 * size, 48, 48]} />
              <meshStandardMaterial {...eyeMaterial} />
            </mesh>
            {/* Iris - Colored and detailed with texture-like appearance */}
            <mesh position={[0, 0, 0.02 * size]} castShadow>
              <sphereGeometry args={[0.035 * size, 48, 48]} />
              <meshStandardMaterial {...irisMaterial} />
            </mesh>
            {/* Pupil - More realistic size */}
            <mesh position={[0, 0, 0.024 * size]} castShadow>
              <sphereGeometry args={[0.02 * size, 36, 36]} />
              <meshStandardMaterial color="#000000" roughness={0.1} />
            </mesh>
            {/* Eye shine - More realistic with multiple highlights */}
            <mesh position={[0.012 * size, 0.012 * size, 0.028 * size]} castShadow>
              <sphereGeometry args={[0.008 * size, 24, 24]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.8}
                transparent
                opacity={0.98}
              />
            </mesh>
            {/* Secondary eye shine for depth */}
            <mesh position={[-0.008 * size, 0.008 * size, 0.026 * size]} castShadow>
              <sphereGeometry args={[0.004 * size, 16, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.4}
                transparent
                opacity={0.7}
              />
            </mesh>
            {/* Upper eyelid - More defined and realistic */}
            <mesh position={[0, 0.03 * size, 0.2 * size]} castShadow>
              <RoundedBox args={[0.07 * size, 0.018 * size, 0.032 * size]} radius={0.005 * size} smoothness={6}>
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </RoundedBox>
            </mesh>
            {/* Lower eyelid - More defined and realistic */}
            <mesh position={[0, -0.02 * size, 0.2 * size]} castShadow>
              <RoundedBox args={[0.07 * size, 0.014 * size, 0.026 * size]} radius={0.005 * size} smoothness={6}>
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </RoundedBox>
            </mesh>
            {/* Eyelashes - More realistic with better distribution */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <mesh
                key={`left-lash-${i}`}
                position={[(i - 4) * 0.009 * size, 0.034 * size, 0.207 * size]}
                rotation={[0, 0, -0.3 - (i - 4) * 0.04]}
                castShadow
              >
                <boxGeometry args={[0.002 * size, 0.012 * size, 0.001 * size]} />
                <meshStandardMaterial color="#000000" roughness={0.9} />
              </mesh>
            ))}
          </group>
          
          {/* Right Eye - Ultra realistic with all details and proper proportions */}
          <group position={[0.085 * size, 0.06 * size, 0.21 * size]}>
            {/* Eye socket - More defined and realistic */}
            <mesh castShadow>
              <sphereGeometry args={[0.055 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color={skinToneDark}
                roughness={0.75}
                metalness={0.02}
                transparent
                opacity={0.4}
              />
            </mesh>
            {/* Eye white - More realistic with proper size */}
            <mesh position={[0, 0, 0.013 * size]} castShadow>
              <sphereGeometry args={[0.048 * size, 48, 48]} />
              <meshStandardMaterial {...eyeMaterial} />
            </mesh>
            {/* Iris - Colored and detailed with texture-like appearance */}
            <mesh position={[0, 0, 0.02 * size]} castShadow>
              <sphereGeometry args={[0.035 * size, 48, 48]} />
              <meshStandardMaterial {...irisMaterial} />
            </mesh>
            {/* Pupil - More realistic size */}
            <mesh position={[0, 0, 0.024 * size]} castShadow>
              <sphereGeometry args={[0.02 * size, 36, 36]} />
              <meshStandardMaterial color="#000000" roughness={0.1} />
            </mesh>
            {/* Eye shine - More realistic with multiple highlights */}
            <mesh position={[0.012 * size, 0.012 * size, 0.028 * size]} castShadow>
              <sphereGeometry args={[0.008 * size, 24, 24]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.8}
                transparent
                opacity={0.98}
              />
            </mesh>
            {/* Secondary eye shine for depth */}
            <mesh position={[-0.008 * size, 0.008 * size, 0.026 * size]} castShadow>
              <sphereGeometry args={[0.004 * size, 16, 16]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.4}
                transparent
                opacity={0.7}
              />
            </mesh>
            {/* Upper eyelid - More defined and realistic */}
            <mesh position={[0, 0.03 * size, 0.2 * size]} castShadow>
              <RoundedBox args={[0.07 * size, 0.018 * size, 0.032 * size]} radius={0.005 * size} smoothness={6}>
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </RoundedBox>
            </mesh>
            {/* Lower eyelid - More defined and realistic */}
            <mesh position={[0, -0.02 * size, 0.2 * size]} castShadow>
              <RoundedBox args={[0.07 * size, 0.014 * size, 0.026 * size]} radius={0.005 * size} smoothness={6}>
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </RoundedBox>
            </mesh>
            {/* Eyelashes - More realistic with better distribution */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <mesh
                key={`right-lash-${i}`}
                position={[(i - 4) * 0.009 * size, 0.034 * size, 0.207 * size]}
                rotation={[0, 0, 0.3 + (i - 4) * 0.04]}
                castShadow
              >
                <boxGeometry args={[0.002 * size, 0.012 * size, 0.001 * size]} />
                <meshStandardMaterial color="#000000" roughness={0.9} />
              </mesh>
            ))}
          </group>

          {/* Eyebrows - More realistic with proper shape and individual hairs */}
          <RoundedBox
            position={[-0.085 * size, 0.12 * size, 0.2 * size]}
            args={[0.08 * size, 0.018 * size, 0.022 * size]}
            radius={0.003 * size}
            smoothness={6}
            castShadow
          >
            <meshStandardMaterial {...hairMaterial} />
          </RoundedBox>
          <RoundedBox
            position={[0.085 * size, 0.12 * size, 0.2 * size]}
            args={[0.08 * size, 0.018 * size, 0.022 * size]}
            radius={0.003 * size}
            smoothness={6}
            castShadow
          >
            <meshStandardMaterial {...hairMaterial} />
          </RoundedBox>
          {/* Individual eyebrow hairs for more realism */}
          {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
            <mesh
              key={`left-brow-hair-${i}`}
              position={[-0.085 * size + i * 0.012 * size, 0.12 * size, 0.21 * size]}
              rotation={[0, 0, i * 0.1]}
              castShadow
            >
              <boxGeometry args={[0.008 * size, 0.002 * size, 0.001 * size]} />
              <meshStandardMaterial {...hairMaterial} />
            </mesh>
          ))}
          {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
            <mesh
              key={`right-brow-hair-${i}`}
              position={[0.085 * size + i * 0.012 * size, 0.12 * size, 0.21 * size]}
              rotation={[0, 0, -i * 0.1]}
              castShadow
            >
              <boxGeometry args={[0.008 * size, 0.002 * size, 0.001 * size]} />
              <meshStandardMaterial {...hairMaterial} />
            </mesh>
          ))}

          {/* Nose - More organic and realistic with proper shape */}
          <RoundedBox
            position={[0, 0.002 * size, 0.235 * size]}
            args={[0.035 * size, 0.07 * size, 0.04 * size]}
            radius={0.006 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>
          {/* Nose bridge - More defined */}
          <RoundedBox
            position={[0, 0.028 * size, 0.225 * size]}
            args={[0.022 * size, 0.05 * size, 0.025 * size]}
            radius={0.004 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>
          {/* Nostrils - More realistic with better detail */}
          <mesh position={[-0.013 * size, -0.015 * size, 0.24 * size]} castShadow>
            <sphereGeometry args={[0.012 * size, 24, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>
          <mesh position={[0.013 * size, -0.015 * size, 0.24 * size]} castShadow>
            <sphereGeometry args={[0.012 * size, 24, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>

          {/* Mouth - More realistic with proper shape */}
          <RoundedBox
            position={[0, -0.06 * size, 0.22 * size]}
            args={[0.075 * size, 0.025 * size, 0.018 * size]}
            radius={0.003 * size}
            smoothness={6}
            castShadow
          >
            <meshStandardMaterial color="#8b0000" roughness={0.55} />
          </RoundedBox>
          {/* Upper lip - More defined and realistic */}
          <RoundedBox
            position={[0, -0.048 * size, 0.22 * size]}
            args={[0.07 * size, 0.014 * size, 0.014 * size]}
            radius={0.003 * size}
            smoothness={6}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>
          {/* Lower lip - More defined and realistic with better material */}
          <RoundedBox
            position={[0, -0.072 * size, 0.22 * size]}
            args={[0.07 * size, 0.016 * size, 0.014 * size]}
            radius={0.003 * size}
            smoothness={6}
            castShadow
          >
            <meshStandardMaterial 
              color="#ff69b4" 
              roughness={0.4}
              metalness={0.1}
              emissive="#ff69b4"
              emissiveIntensity={0.05}
            />
          </RoundedBox>

          {/* Ears - More realistic organic shape with proper positioning and inner details */}
          <RoundedBox
            position={[-0.21 * size, 0.002 * size, 0.1 * size]}
            args={[0.05 * size, 0.1 * size, 0.05 * size]}
            radius={0.01 * size}
            smoothness={12}
            rotation={[0, 0.35, 0]}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>
          {/* Inner ear detail */}
          <mesh position={[-0.19 * size, 0.002 * size, 0.12 * size]} rotation={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.025 * size, 16, 16]} />
            <meshStandardMaterial
              color={skinToneDark}
              roughness={0.8}
              metalness={0.01}
            />
          </mesh>
          <RoundedBox
            position={[0.21 * size, 0.002 * size, 0.1 * size]}
            args={[0.05 * size, 0.1 * size, 0.05 * size]}
            radius={0.01 * size}
            smoothness={12}
            rotation={[0, -0.35, 0]}
            castShadow
          >
            <meshStandardMaterial
              {...skinMaterial}
            />
          </RoundedBox>
          {/* Inner ear detail */}
          <mesh position={[0.19 * size, 0.002 * size, 0.12 * size]} rotation={[0, -0.35, 0]} castShadow>
            <sphereGeometry args={[0.025 * size, 16, 16]} />
            <meshStandardMaterial
              color={skinToneDark}
              roughness={0.8}
              metalness={0.01}
            />
          </mesh>
        </group>

        {/* Left Shoulder - Ultra realistic with proper anatomy and seamless connection */}
        <group ref={leftShoulderRef} position={[-0.34 * size, 0.88 * size, 0]}>
          {/* Shoulder ball - More defined with smooth connection to deltoid */}
          <mesh castShadow>
            <sphereGeometry args={[0.11 * size, 32, 32]} />
            <meshStandardMaterial
              {...skinMaterial}
            />
          </mesh>
          
          {/* Shoulder connection blend - Smooth transition from shoulder to arm */}
          <mesh position={[0, -0.08 * size, 0]} castShadow>
            <sphereGeometry args={[0.105 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              {...skinMaterial}
            />
          </mesh>
          
          {/* Upper Arm - More organic with proper proportions and muscle definition */}
          <group ref={leftUpperArmRef} position={[0, -0.17 * size, 0]}>
            {/* Upper arm base - More organic with tapering */}
            <mesh castShadow>
              <cylinderGeometry args={[0.1 * size, 0.095 * size, 0.42 * size, 40]} />
              <meshStandardMaterial
                {...skinMaterial}
              />
            </mesh>
            
            {/* Bicep muscle - More defined and realistic */}
            <RoundedBox
              position={[-0.04 * size, 0.05 * size, 0]}
              args={[0.08 * size, 0.2 * size, 0.08 * size]}
              radius={0.05 * size}
              smoothness={12}
              castShadow
            >
              <meshStandardMaterial
                {...skinMaterial}
              />
            </RoundedBox>
            
            {/* Tricep muscle - More defined */}
            <RoundedBox
              position={[0.04 * size, 0.05 * size, 0]}
              args={[0.08 * size, 0.2 * size, 0.08 * size]}
              radius={0.05 * size}
              smoothness={12}
              castShadow
            >
              <meshStandardMaterial
                {...skinMaterial}
              />
            </RoundedBox>
            
            {/* Rounded ends with smooth connection */}
            <mesh position={[0, 0.21 * size, 0]} castShadow>
              <sphereGeometry args={[0.1 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                {...skinMaterial}
              />
            </mesh>
            <mesh position={[0, -0.21 * size, 0]} castShadow>
              <sphereGeometry args={[0.095 * size, 40, 40, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
              <meshStandardMaterial
                {...skinMaterial}
              />
            </mesh>
            
            {/* Elbow - More defined joint with smooth connection */}
            <group ref={leftElbowRef} position={[0, -0.21 * size, 0]}>
              {/* Elbow joint - More realistic */}
              <mesh castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Elbow connection blend */}
              <mesh position={[0, 0.01 * size, 0]} castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Forearm - More organic with tapering and muscle definition */}
              <mesh position={[0, -0.17 * size, 0]} castShadow>
                <cylinderGeometry args={[0.085 * size, 0.09 * size, 0.36 * size, 40]} />
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </mesh>
              
              {/* Forearm muscles - More defined */}
              <RoundedBox
                position={[-0.03 * size, -0.05 * size, 0]}
                args={[0.06 * size, 0.15 * size, 0.06 * size]}
                radius={0.04 * size}
                smoothness={10}
                castShadow
              >
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </RoundedBox>
              
              {/* Rounded ends with smooth connection */}
              <mesh position={[0, 0.01 * size, 0]} castShadow>
                <sphereGeometry args={[0.085 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </mesh>
              <mesh position={[0, -0.18 * size, 0]} castShadow>
                <sphereGeometry args={[0.09 * size, 40, 40, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </mesh>
              
              {/* Hand - More realistic organic shape with seamless wrist connection */}
              <group ref={leftHandRef} position={[0, -0.18 * size, 0]}>
                {/* Wrist connection - Smooth blend */}
                <mesh position={[0, 0.05 * size, 0]} castShadow>
                  <sphereGeometry args={[0.09 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </mesh>
                
                {/* Palm - More organic */}
                <RoundedBox
                  args={[0.11 * size, 0.13 * size, 0.09 * size]}
                  radius={0.018 * size}
                  smoothness={10}
                  castShadow
                >
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </RoundedBox>
                {/* Thumb - More realistic */}
                <mesh position={[-0.048 * size, -0.048 * size, 0.05 * size]} castShadow>
                  <cylinderGeometry args={[0.03 * size, 0.03 * size, 0.06 * size, 20]} />
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </mesh>
                <mesh position={[-0.048 * size, -0.075 * size, 0.055 * size]} castShadow>
                  <sphereGeometry args={[0.03 * size, 20, 20]} />
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </mesh>
                {/* Fingers - More realistic */}
                {[0, 1, 2, 3].map((i) => (
                  <group key={`left-finger-${i}`}>
                    <mesh
                      position={[(i - 1.5) * 0.026 * size, -0.28 * size, 0.014 * size]}
                      castShadow
                    >
                      <cylinderGeometry args={[0.022 * size, 0.022 * size, 0.08 * size, 20]} />
                      <meshStandardMaterial
                        color={skinTone}
                        roughness={0.7}
                        metalness={0.02}
                      />
                    </mesh>
                    <mesh
                      position={[(i - 1.5) * 0.026 * size, -0.34 * size, 0.014 * size]}
                      castShadow
                    >
                      <sphereGeometry args={[0.02 * size, 18, 18]} />
                      <meshStandardMaterial
                        color={skinTone}
                        roughness={0.7}
                        metalness={0.02}
                      />
                    </mesh>
                  </group>
                ))}
              </group>
            </group>
          </group>
        </group>

        {/* Right Shoulder - Ultra realistic with proper anatomy */}
        <group ref={rightShoulderRef} position={[0.34 * size, 0.88 * size, 0]}>
          {/* Shoulder ball */}
          <mesh castShadow>
            <sphereGeometry args={[0.11 * size, 32, 32]} />
            <meshStandardMaterial
              {...skinMaterial}
            />
          </mesh>
          
          {/* Shoulder connection blend */}
          <mesh position={[0, -0.08 * size, 0]} castShadow>
            <sphereGeometry args={[0.105 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              {...skinMaterial}
            />
          </mesh>
          
          {/* Upper Arm - More organic with proper proportions and muscle definition */}
          <group ref={rightUpperArmRef} position={[0, -0.17 * size, 0]}>
            {/* Upper arm base - More organic with tapering */}
            <mesh castShadow>
              <cylinderGeometry args={[0.1 * size, 0.095 * size, 0.42 * size, 40]} />
              <meshStandardMaterial
                {...skinMaterial}
              />
            </mesh>
            
            {/* Bicep muscle - More defined and realistic */}
            <RoundedBox
              position={[0.04 * size, 0.05 * size, 0]}
              args={[0.08 * size, 0.2 * size, 0.08 * size]}
              radius={0.05 * size}
              smoothness={12}
              castShadow
            >
              <meshStandardMaterial
                {...skinMaterial}
              />
            </RoundedBox>
            
            {/* Tricep muscle - More defined */}
            <RoundedBox
              position={[-0.04 * size, 0.05 * size, 0]}
              args={[0.08 * size, 0.2 * size, 0.08 * size]}
              radius={0.05 * size}
              smoothness={12}
              castShadow
            >
              <meshStandardMaterial
                {...skinMaterial}
              />
            </RoundedBox>
            
            {/* Rounded ends */}
            <mesh position={[0, 0.21 * size, 0]} castShadow>
              <sphereGeometry args={[0.1 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                {...skinMaterial}
              />
            </mesh>
            <mesh position={[0, -0.21 * size, 0]} castShadow>
              <sphereGeometry args={[0.095 * size, 40, 40, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
              <meshStandardMaterial
                {...skinMaterial}
              />
            </mesh>
            
            {/* Elbow - More defined joint */}
            <group ref={rightElbowRef} position={[0, -0.21 * size, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Elbow connection blend */}
              <mesh position={[0, 0.01 * size, 0]} castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Forearm - More organic with tapering and muscle definition */}
              <mesh position={[0, -0.17 * size, 0]} castShadow>
                <cylinderGeometry args={[0.085 * size, 0.09 * size, 0.36 * size, 40]} />
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </mesh>
              
              {/* Forearm muscles - More defined */}
              <RoundedBox
                position={[0.03 * size, -0.05 * size, 0]}
                args={[0.06 * size, 0.15 * size, 0.06 * size]}
                radius={0.04 * size}
                smoothness={10}
                castShadow
              >
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </RoundedBox>
              
              {/* Rounded ends */}
              <mesh position={[0, 0.01 * size, 0]} castShadow>
                <sphereGeometry args={[0.085 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </mesh>
              <mesh position={[0, -0.18 * size, 0]} castShadow>
                <sphereGeometry args={[0.09 * size, 40, 40, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                <meshStandardMaterial
                  {...skinMaterial}
                />
              </mesh>
              
              {/* Hand - More realistic organic shape */}
              <group ref={rightHandRef} position={[0, -0.18 * size, 0]}>
                {/* Wrist connection - Smooth blend */}
                <mesh position={[0, 0.05 * size, 0]} castShadow>
                  <sphereGeometry args={[0.09 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </mesh>
                
                {/* Palm - More organic */}
                <RoundedBox
                  args={[0.11 * size, 0.13 * size, 0.09 * size]}
                  radius={0.018 * size}
                  smoothness={10}
                  castShadow
                >
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </RoundedBox>
                {/* Thumb - More realistic */}
                <mesh position={[0.048 * size, -0.048 * size, 0.05 * size]} castShadow>
                  <cylinderGeometry args={[0.03 * size, 0.03 * size, 0.06 * size, 20]} />
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </mesh>
                <mesh position={[0.048 * size, -0.075 * size, 0.055 * size]} castShadow>
                  <sphereGeometry args={[0.03 * size, 20, 20]} />
                  <meshStandardMaterial
                    color={skinTone}
                    roughness={0.7}
                    metalness={0.02}
                  />
                </mesh>
                {/* Fingers - More realistic */}
                {[0, 1, 2, 3].map((i) => (
                  <group key={`right-finger-${i}`}>
                    <mesh
                      position={[(i - 1.5) * 0.026 * size, -0.28 * size, 0.014 * size]}
                      castShadow
                    >
                      <cylinderGeometry args={[0.022 * size, 0.022 * size, 0.08 * size, 20]} />
                      <meshStandardMaterial
                        color={skinTone}
                        roughness={0.7}
                        metalness={0.02}
                      />
                    </mesh>
                    <mesh
                      position={[(i - 1.5) * 0.026 * size, -0.34 * size, 0.014 * size]}
                      castShadow
                    >
                      <sphereGeometry args={[0.02 * size, 18, 18]} />
                      <meshStandardMaterial
                        color={skinTone}
                        roughness={0.7}
                        metalness={0.02}
                      />
                    </mesh>
                  </group>
                ))}
              </group>
            </group>
          </group>
        </group>

        {/* Left Hip - Ultra realistic with proper anatomy and seamless connection */}
        <group ref={leftHipRef} position={[-0.14 * size, 0.18 * size, 0]}>
          {/* Hip joint - More defined with smooth connection to pelvis */}
          <mesh castShadow>
            <sphereGeometry args={[0.12 * size, 32, 32]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Hip connection blend - Smooth transition from pelvis to thigh */}
          <mesh position={[0, -0.12 * size, 0]} castShadow>
            <sphereGeometry args={[0.12 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Thigh - More organic with proper proportions and muscle definition */}
          <mesh position={[0, -0.24 * size, 0]} castShadow>
            <cylinderGeometry args={[0.12 * size, 0.11 * size, 0.52 * size, 40]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Quadriceps - More defined thigh muscles */}
          <RoundedBox
            position={[0, -0.1 * size, 0.08 * size]}
            args={[0.1 * size, 0.3 * size, 0.1 * size]}
            radius={0.06 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...clothingMaterial}
            />
          </RoundedBox>
          
          {/* Hamstring - More defined back thigh muscle */}
          <RoundedBox
            position={[0, -0.1 * size, -0.08 * size]}
            args={[0.1 * size, 0.3 * size, 0.08 * size]}
            radius={0.05 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...clothingMaterial}
            />
          </RoundedBox>
          
          {/* Rounded ends with smooth connection */}
          <mesh position={[0, 0.02 * size, 0]} castShadow>
            <sphereGeometry args={[0.12 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          <mesh position={[0, -0.26 * size, 0]} castShadow>
            <sphereGeometry args={[0.11 * size, 40, 40, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Knee - More defined joint with smooth connection */}
          <group ref={leftKneeRef} position={[0, -0.26 * size, 0]}>
            {/* Knee cap - More realistic */}
            <mesh castShadow>
              <sphereGeometry args={[0.1 * size, 24, 24]} />
              <meshStandardMaterial
                color={skinTone}
                roughness={0.7}
                metalness={0.02}
              />
            </mesh>
            
            {/* Knee connection blend */}
            <mesh position={[0, 0.01 * size, 0]} castShadow>
              <sphereGeometry args={[0.1 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            
            {/* Shin - More organic with tapering */}
            <mesh position={[0, -0.24 * size, 0]} castShadow>
              <cylinderGeometry args={[0.1 * size, 0.095 * size, 0.46 * size, 32]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            {/* Rounded ends */}
            <mesh position={[0, 0.01 * size, 0]} castShadow>
              <sphereGeometry args={[0.1 * size, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            <mesh position={[0, -0.25 * size, 0]} castShadow>
              <sphereGeometry args={[0.095 * size, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            
            {/* Ankle - More defined joint with smooth connection */}
            <group ref={leftAnkleRef} position={[0, -0.25 * size, 0]}>
              {/* Ankle joint */}
              <mesh castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Ankle connection blend */}
              <mesh position={[0, 0.04 * size, 0]} castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Foot - More realistic organic shape with seamless ankle connection */}
              <RoundedBox
                position={[0, -0.07 * size, 0.1 * size]}
                args={[0.16 * size, 0.09 * size, 0.22 * size]}
                radius={0.025 * size}
                smoothness={10}
                castShadow
              >
                <meshStandardMaterial
                  color="#2a2a2a"
                  roughness={0.92}
                  metalness={0.05}
                />
              </RoundedBox>
              {/* Shoe sole - More realistic */}
              <RoundedBox
                position={[0, -0.08 * size, 0.13 * size]}
                args={[0.17 * size, 0.028 * size, 0.1 * size]}
                radius={0.012 * size}
                smoothness={4}
                castShadow
              >
                <meshStandardMaterial
                  color="#1a1a1a"
                  roughness={0.9}
                  metalness={0.08}
                />
              </RoundedBox>
              {/* Shoe laces - More realistic */}
              <RoundedBox
                position={[0, 0.018 * size, 0.16 * size]}
                args={[0.13 * size, 0.014 * size, 0.028 * size]}
                radius={0.003 * size}
                smoothness={4}
                castShadow
              >
                <meshStandardMaterial
                  color="#ffffff"
                  roughness={0.6}
                  metalness={0.3}
                />
              </RoundedBox>
              {/* Toes - More organic */}
              {[0, 1, 2, 3, 4].map((i) => (
                <mesh
                  key={`left-toe-${i}`}
                  position={[(i - 2) * 0.032 * size, 0.06 * size, 0.22 * size]}
                  castShadow
                >
                  <sphereGeometry args={[0.022 * size, 18, 18]} />
                  <meshStandardMaterial
                    color="#2a2a2a"
                    roughness={0.92}
                    metalness={0.05}
                  />
                </mesh>
              ))}
            </group>
          </group>
        </group>

        {/* Right Hip - Ultra realistic with proper anatomy */}
        <group ref={rightHipRef} position={[0.14 * size, 0.18 * size, 0]}>
          {/* Hip joint */}
          <mesh castShadow>
            <sphereGeometry args={[0.12 * size, 32, 32]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Hip connection blend */}
          <mesh position={[0, -0.12 * size, 0]} castShadow>
            <sphereGeometry args={[0.12 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Thigh - More organic with proper proportions and muscle definition */}
          <mesh position={[0, -0.24 * size, 0]} castShadow>
            <cylinderGeometry args={[0.12 * size, 0.11 * size, 0.52 * size, 40]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Quadriceps - More defined thigh muscles */}
          <RoundedBox
            position={[0, -0.1 * size, 0.08 * size]}
            args={[0.1 * size, 0.3 * size, 0.1 * size]}
            radius={0.06 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...clothingMaterial}
            />
          </RoundedBox>
          
          {/* Hamstring - More defined back thigh muscle */}
          <RoundedBox
            position={[0, -0.1 * size, -0.08 * size]}
            args={[0.1 * size, 0.3 * size, 0.08 * size]}
            radius={0.05 * size}
            smoothness={12}
            castShadow
          >
            <meshStandardMaterial
              {...clothingMaterial}
            />
          </RoundedBox>
          
          {/* Rounded ends */}
          <mesh position={[0, 0.02 * size, 0]} castShadow>
            <sphereGeometry args={[0.12 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          <mesh position={[0, -0.26 * size, 0]} castShadow>
            <sphereGeometry args={[0.11 * size, 40, 40, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
          </mesh>
          
          {/* Knee - More defined joint */}
          <group ref={rightKneeRef} position={[0, -0.26 * size, 0]}>
            {/* Knee cap */}
            <mesh castShadow>
              <sphereGeometry args={[0.1 * size, 24, 24]} />
              <meshStandardMaterial
                color={skinTone}
                roughness={0.7}
                metalness={0.02}
              />
            </mesh>
            
            {/* Knee connection blend */}
            <mesh position={[0, 0.01 * size, 0]} castShadow>
              <sphereGeometry args={[0.1 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            
            {/* Shin - More organic with tapering and muscle definition */}
            <mesh position={[0, -0.24 * size, 0]} castShadow>
              <cylinderGeometry args={[0.1 * size, 0.095 * size, 0.46 * size, 40]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            
            {/* Calf muscle - More defined */}
            <RoundedBox
              position={[0, -0.12 * size, 0.06 * size]}
              args={[0.08 * size, 0.25 * size, 0.08 * size]}
              radius={0.05 * size}
              smoothness={12}
              castShadow
            >
              <meshStandardMaterial
                {...clothingMaterial}
              />
            </RoundedBox>
            
            {/* Rounded ends */}
            <mesh position={[0, 0.01 * size, 0]} castShadow>
              <sphereGeometry args={[0.1 * size, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            <mesh position={[0, -0.25 * size, 0]} castShadow>
              <sphereGeometry args={[0.095 * size, 40, 40, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial
            {...clothingMaterial}
          />
            </mesh>
            
            {/* Ankle - More defined joint */}
            <group ref={rightAnkleRef} position={[0, -0.25 * size, 0]}>
              {/* Ankle joint */}
              <mesh castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Ankle connection blend */}
              <mesh position={[0, 0.04 * size, 0]} castShadow>
                <sphereGeometry args={[0.09 * size, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  color={skinTone}
                  roughness={0.7}
                  metalness={0.02}
                />
              </mesh>
              
              {/* Foot - More realistic organic shape */}
              <RoundedBox
                position={[0, -0.07 * size, 0.1 * size]}
                args={[0.16 * size, 0.09 * size, 0.22 * size]}
                radius={0.025 * size}
                smoothness={10}
                castShadow
              >
                <meshStandardMaterial
                  color="#2a2a2a"
                  roughness={0.92}
                  metalness={0.05}
                />
              </RoundedBox>
              {/* Shoe sole - More realistic */}
              <RoundedBox
                position={[0, -0.08 * size, 0.13 * size]}
                args={[0.17 * size, 0.028 * size, 0.1 * size]}
                radius={0.012 * size}
                smoothness={4}
                castShadow
              >
                <meshStandardMaterial
                  color="#1a1a1a"
                  roughness={0.9}
                  metalness={0.08}
                />
              </RoundedBox>
              {/* Shoe laces - More realistic */}
              <RoundedBox
                position={[0, 0.018 * size, 0.16 * size]}
                args={[0.13 * size, 0.014 * size, 0.028 * size]}
                radius={0.003 * size}
                smoothness={4}
                castShadow
              >
                <meshStandardMaterial
                  color="#ffffff"
                  roughness={0.6}
                  metalness={0.3}
                />
              </RoundedBox>
              {/* Toes - More organic */}
              {[0, 1, 2, 3, 4].map((i) => (
                <mesh
                  key={`right-toe-${i}`}
                  position={[(i - 2) * 0.032 * size, 0.06 * size, 0.22 * size]}
                  castShadow
                >
                  <sphereGeometry args={[0.022 * size, 18, 18]} />
                  <meshStandardMaterial
                    color="#2a2a2a"
                    roughness={0.92}
                    metalness={0.05}
                  />
                </mesh>
              ))}
            </group>
          </group>
        </group>
      </group>

      {/* Selection Indicator */}
      {isCurrent && (
        <>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5 * size, 0.6 * size, 32]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={1.2}
              transparent
              opacity={0.7}
            />
          </mesh>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
            <mesh
              key={`selection-line-${i}`}
              position={[
                Math.cos(angle) * 0.55 * size,
                0.1,
                Math.sin(angle) * 0.55 * size
              ]}
              rotation={[0, angle, 0]}
              castShadow
            >
              <boxGeometry args={[0.05, 0.3 * size, 0.05]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={1}
              />
            </mesh>
          ))}
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

      {/* Song Info */}
      {showSongInfo && (
        <Html
          position={[0, 2.9 * size, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.95), rgba(0, 255, 255, 0.95))',
              color: 'white',
              padding: '7px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              textShadow: '0 2px 6px rgba(0,0,0,0.9)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.7)',
              maxWidth: '220px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            🎵 {currentSong.title}
          </div>
        </Html>
      )}
    </group>
  )
}
