'use client'

import { useRef } from 'react'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { DJBooth } from './DJBooth'
import { DanceFloorGrid } from './DanceFloorGrid'
import { useCaliClubStore } from '@/stores/cali-club-store'

export function Stage() {
  const stageRef = useRef<Mesh>(null)
  const ledScreenRef = useRef<Mesh>(null)
  const danceFloorRef = useRef<Mesh>(null)
  const { isPlaying } = useCaliClubStore()

  // Animate LED screen colors and dance floor
  useFrame((state) => {
    if (ledScreenRef.current && isPlaying) {
      const material = ledScreenRef.current.material as any
      const time = state.clock.elapsedTime
      // Cycle through colors: blue, purple, green, orange
      const hue = (time * 0.1) % 1
      material.emissive.setHSL(hue, 0.8, 0.5)
    }

    // Animate dance floor LED pattern
    if (danceFloorRef.current && isPlaying) {
      const material = danceFloorRef.current.material as any
      const time = state.clock.elapsedTime
      const intensity = Math.sin(time * 2) * 0.3 + 0.5
      material.emissiveIntensity = intensity
    }
  })

  return (
    <group>
      {/* Main Dance Floor Base - More realistic with texture */}
      <mesh
        ref={stageRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50, 20, 20]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* LED Dance Floor - Grid pattern with individual tiles */}
      <mesh
        ref={danceFloorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 40, 20, 20]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.7}
          metalness={0.4}
          emissive="#16213e"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Interactive Grid System */}
      <DanceFloorGrid />

      {/* Dance Floor Grid Lines */}
      {Array.from({ length: 21 }).map((_, i) => {
        const pos = (i - 10) * 2
        return (
          <group key={`grid-${i}`}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[pos, 0.025, 0]}
            >
              <boxGeometry args={[0.05, 40, 0.05]} />
              <meshStandardMaterial
                color="#000000"
                emissive="#00ffff"
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
              position={[0, 0.025, pos]}
            >
              <boxGeometry args={[0.05, 40, 0.05]} />
              <meshStandardMaterial
                color="#000000"
                emissive="#00ffff"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        )
      })}

      {/* Massive Stage Platform - More realistic with details */}
      <group position={[0, 0.3, -12]}>
        {/* Stage Base */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[20, 0.6, 8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.7}
            metalness={0.3}
            emissive="#0a0a0a"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Stage Surface - More realistic material */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <boxGeometry args={[20.1, 0.1, 8.1]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Stage Edge Details */}
        <mesh position={[0, 0.35, 4.05]} castShadow>
          <boxGeometry args={[20.2, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#444444"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Stage Front Edge - Glowing LED strip with depth */}
      <group position={[0, 0.6, -8]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[20.2, 0.15, 0.3]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[20.2, 0.08, 0.1]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>

      {/* Massive LED Screen Backdrop - More realistic with frame details */}
      <group position={[0, 6, -16]}>
        {/* LED Screen */}
        <mesh
          ref={ledScreenRef}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[22, 12, 0.5]} />
          <meshStandardMaterial
            color="#000033"
            roughness={0.05}
            metalness={0.95}
            emissive="#0066ff"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Screen Bezel - Top */}
        <mesh position={[0, 6.25, -0.1]} castShadow>
          <boxGeometry args={[22.5, 0.6, 0.7]} />
          <meshStandardMaterial
            color="#222222"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Screen Bezel - Bottom */}
        <mesh position={[0, -6.25, -0.1]} castShadow>
          <boxGeometry args={[22.5, 0.6, 0.7]} />
          <meshStandardMaterial
            color="#222222"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Screen Bezel - Left */}
        <mesh position={[-11.25, 0, -0.1]} castShadow>
          <boxGeometry args={[0.6, 12.5, 0.7]} />
          <meshStandardMaterial
            color="#222222"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Screen Bezel - Right */}
        <mesh position={[11.25, 0, -0.1]} castShadow>
          <boxGeometry args={[0.6, 12.5, 0.7]} />
          <meshStandardMaterial
            color="#222222"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Screen Support Structure - Left */}
        <mesh position={[-11.5, 0, -1]} castShadow>
          <boxGeometry args={[0.3, 13, 1]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>

        {/* Screen Support Structure - Right */}
        <mesh position={[11.5, 0, -1]} castShadow>
          <boxGeometry args={[0.3, 13, 1]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.4}
            metalness={0.7}
          />
        </mesh>
      </group>

      {/* Side LED Panels - More realistic */}
      <group position={[-12, 4, -10]}>
        <mesh castShadow>
          <boxGeometry args={[2, 8, 0.4]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[1.8, 7.8, 0.1]} />
          <meshStandardMaterial
            color="#000033"
            emissive="#ff00ff"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      <group position={[12, 4, -10]}>
        <mesh castShadow>
          <boxGeometry args={[2, 8, 0.4]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[1.8, 7.8, 0.1]} />
          <meshStandardMaterial
            color="#000033"
            emissive="#00ff00"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Pyrotechnic Launchers - More realistic */}
      {[-8, -4, 4, 8].map((x, i) => (
        <group key={`pyro-${i}`} position={[x, 1, -8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} />
            <meshStandardMaterial
              color="#333333"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.25, 0.1, 16]} />
            <meshStandardMaterial
              color="#555555"
              roughness={0.1}
              metalness={0.95}
            />
          </mesh>
        </group>
      ))}

      {/* DJ Booth - On the stage platform */}
      <DJBooth position={[0, 0.9, -12]} />

      {/* Stage Side Structures - More detailed */}
      <group position={[-10, 3, -10]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
        {/* Decorative LED strips */}
        <mesh position={[0, 2, 0.61]} castShadow>
          <boxGeometry args={[1, 0.1, 0.05]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh position={[0, -2, 0.61]} castShadow>
          <boxGeometry args={[1, 0.1, 0.05]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={1}
          />
        </mesh>
      </group>

      <group position={[10, 3, -10]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
        {/* Decorative LED strips */}
        <mesh position={[0, 2, 0.61]} castShadow>
          <boxGeometry args={[1, 0.1, 0.05]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={1}
          />
        </mesh>
        <mesh position={[0, -2, 0.61]} castShadow>
          <boxGeometry args={[1, 0.1, 0.05]} />
          <meshStandardMaterial
            color="#ffaa00"
            emissive="#ffaa00"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
    </group>
  )
}
