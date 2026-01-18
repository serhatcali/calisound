'use client'

import { useRef } from 'react'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { useCaliClubStore } from '@/stores/cali-club-store'

interface DJBoothProps {
  position: [number, number, number]
}

export function DJBooth({ position }: DJBoothProps) {
  const boothRef = useRef<Mesh>(null)
  const caliLettersRef = useRef<Mesh[]>([])
  const turntableLeftRef = useRef<Mesh>(null)
  const turntableRightRef = useRef<Mesh>(null)
  const { isPlaying } = useCaliClubStore()

  // Animate CALI text blinking and turntables rotating
  useFrame((state) => {
    // Blinking effect - faster when playing
    const blinkSpeed = isPlaying ? 3 : 1
    const intensity = Math.sin(state.clock.elapsedTime * blinkSpeed) * 0.5 + 0.5
    
    caliLettersRef.current.forEach((letter, index) => {
      if (letter && letter.material) {
        const material = letter.material as any
        // Stagger the blinking for each letter
        const letterIntensity = Math.sin(state.clock.elapsedTime * blinkSpeed + index * 0.5) * 0.5 + 0.5
        material.emissiveIntensity = letterIntensity * 2
      }
    })

    // Rotate turntables when playing
    if (isPlaying) {
      if (turntableLeftRef.current) {
        turntableLeftRef.current.rotation.y += 0.02
      }
      if (turntableRightRef.current) {
        turntableRightRef.current.rotation.y -= 0.02
      }
    }
  })

  return (
    <group position={position}>
      {/* DJ Table Base - More realistic with texture details */}
      <mesh
        ref={boothRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[8, 0.4, 4]} />
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.6}
          metalness={0.4}
          emissive="#0a0a0a"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Table Top Surface - More realistic */}
      <mesh
        position={[0, 0.2, 0]}
        receiveShadow
      >
        <boxGeometry args={[8.1, 0.05, 4.1]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* DJ Table Front Edge - LED strip with glow */}
      <mesh
        position={[0, 0.25, 2.2]}
        castShadow
      >
        <boxGeometry args={[8.2, 0.08, 0.15]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Side LED strips */}
      <mesh
        position={[-4.1, 0.25, 0]}
        castShadow
      >
        <boxGeometry args={[0.15, 0.08, 4.2]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1}
        />
      </mesh>
      <mesh
        position={[4.1, 0.25, 0]}
        castShadow
      >
        <boxGeometry args={[0.15, 0.08, 4.2]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Turntable Left - More realistic with platter and tonearm */}
      <group position={[-2, 0.5, 0]}>
        {/* Turntable Base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        {/* Platter - Rotating */}
        <mesh ref={turntableLeftRef} castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.05, 32]} />
          <meshStandardMaterial
            color="#0a0a0a"
            roughness={0.1}
            metalness={0.95}
            emissive="#333333"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Center Spindle */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        {/* Tonearm */}
        <mesh position={[0.6, 0.08, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.5, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#555555"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
      </group>

      {/* Turntable Right - More realistic */}
      <group position={[2, 0.5, 0]}>
        {/* Turntable Base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        {/* Platter - Rotating */}
        <mesh ref={turntableRightRef} castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.05, 32]} />
          <meshStandardMaterial
            color="#0a0a0a"
            roughness={0.1}
            metalness={0.95}
            emissive="#333333"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Center Spindle */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        {/* Tonearm */}
        <mesh position={[0.6, 0.08, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.5, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#555555"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
      </group>

      {/* Mixer - More realistic with detailed controls */}
      <group position={[0, 0.5, 0]}>
        {/* Mixer Base */}
        <mesh castShadow>
          <boxGeometry args={[3.8, 0.4, 1.8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        
        {/* Mixer Face Plate */}
        <mesh position={[0, 0.2, 0.4]} castShadow>
          <boxGeometry args={[3.6, 0.35, 0.1]} />
          <meshStandardMaterial
            color="#0a0a0a"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Channel Strips - Left */}
        <mesh position={[-1.2, 0.25, 0.45]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.05]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        <mesh position={[-1.2, 0.15, 0.45]} castShadow>
          <boxGeometry args={[0.4, 0.2, 0.05]} />
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Channel Strips - Center */}
        <mesh position={[0, 0.25, 0.45]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.05]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        <mesh position={[0, 0.15, 0.45]} castShadow>
          <boxGeometry args={[0.4, 0.2, 0.05]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Channel Strips - Right */}
        <mesh position={[1.2, 0.25, 0.45]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.05]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
        <mesh position={[1.2, 0.15, 0.45]} castShadow>
          <boxGeometry args={[0.4, 0.2, 0.05]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Faders */}
        <mesh position={[-1.2, 0.05, 0.45]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.5}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0, 0.05, 0.45]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.5}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[1.2, 0.05, 0.45]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.5}
            metalness={0.6}
          />
        </mesh>
      </group>

      {/* Speaker Left - More realistic with grille details */}
      <group position={[-5, 1.5, 0]}>
        {/* Speaker Cabinet */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 3, 1.8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        {/* Speaker Grille */}
        <mesh position={[0, 0, 0.91]} castShadow>
          <boxGeometry args={[1.7, 2.9, 0.02]} />
          <meshStandardMaterial
            color="#0a0a0a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        {/* Woofer */}
        <mesh position={[0, -0.5, 0.92]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.01, 32]} />
          <meshStandardMaterial
            color="#000000"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
        {/* Tweeter */}
        <mesh position={[0, 0.8, 0.92]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
          <meshStandardMaterial
            color="#000000"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Speaker Right - More realistic */}
      <group position={[5, 1.5, 0]}>
        {/* Speaker Cabinet */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 3, 1.8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        {/* Speaker Grille */}
        <mesh position={[0, 0, 0.91]} castShadow>
          <boxGeometry args={[1.7, 2.9, 0.02]} />
          <meshStandardMaterial
            color="#0a0a0a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        {/* Woofer */}
        <mesh position={[0, -0.5, 0.92]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.01, 32]} />
          <meshStandardMaterial
            color="#000000"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
        {/* Tweeter */}
        <mesh position={[0, 0.8, 0.92]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
          <meshStandardMaterial
            color="#000000"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* CALI Text - Blinking LED sign in front */}
      <group position={[0, 1.8, 2.6]}>
        {/* Back glow effect */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[6, 1.8]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.4}
            transparent
            opacity={0.25}
          />
        </mesh>

        {/* C */}
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[0] = el }}
          position={[-1.8, 0, 0]} 
          castShadow
        >
          <boxGeometry args={[0.35, 1.2, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[1] = el }}
          position={[-1.5, 0.5, 0]} 
          castShadow
        >
          <boxGeometry args={[0.7, 0.35, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[2] = el }}
          position={[-1.5, -0.5, 0]} 
          castShadow
        >
          <boxGeometry args={[0.7, 0.35, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>

        {/* A */}
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[3] = el }}
          position={[-0.6, 0, 0]} 
          castShadow
        >
          <boxGeometry args={[0.35, 1.2, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[4] = el }}
          position={[0.6, 0, 0]} 
          castShadow
        >
          <boxGeometry args={[0.35, 1.2, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[5] = el }}
          position={[0, 0.4, 0]} 
          castShadow
        >
          <boxGeometry args={[1.3, 0.35, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[6] = el }}
          position={[0, -0.25, 0]} 
          castShadow
        >
          <boxGeometry args={[1.3, 0.35, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>

        {/* L */}
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[7] = el }}
          position={[1.2, 0, 0]} 
          castShadow
        >
          <boxGeometry args={[0.35, 1.2, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[8] = el }}
          position={[1.5, -0.5, 0]} 
          castShadow
        >
          <boxGeometry args={[0.7, 0.35, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>

        {/* I */}
        <mesh 
          ref={(el) => { if (el) caliLettersRef.current[9] = el }}
          position={[2.4, 0, 0]} 
          castShadow
        >
          <boxGeometry args={[0.35, 1.2, 0.12]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
    </group>
  )
}
