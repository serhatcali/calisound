'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points } from 'three'
import { useCaliClubStore } from '@/stores/cali-club-store'

export function AtmosphericEffects() {
  const smokeRef = useRef<Points>(null)
  const confettiRef = useRef<Points>(null)
  const { isPlaying } = useCaliClubStore()

  // Smoke particles
  const smokeParticles = useMemo(() => {
    const count = 200
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Start from pyrotechnic launchers
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = Math.random() * 2
      positions[i3 + 2] = -8 + Math.random() * 2
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = Math.random() * 0.05 + 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
    }
    
    return { positions, velocities }
  }, [])

  // Confetti particles
  const confettiParticles = useMemo(() => {
    const count = 500
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    const colorPalette = [
      [1, 0, 1], // Magenta
      [0, 1, 1], // Cyan
      [0, 1, 0], // Green
      [1, 0.67, 0], // Orange
      [1, 1, 0], // Yellow
    ]
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Start from above stage
      positions[i3] = (Math.random() - 0.5) * 25
      positions[i3 + 1] = 8 + Math.random() * 5
      positions[i3 + 2] = -12 + Math.random() * 10
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.1
      velocities[i3 + 1] = -Math.random() * 0.15 - 0.05
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1
      
      // Random colors
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color[0]
      colors[i3 + 1] = color[1]
      colors[i3 + 2] = color[2]
    }
    
    return { positions, velocities, colors }
  }, [])

  // Animate particles
  useFrame((state) => {
    if (smokeRef.current && isPlaying) {
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array
      const velocities = smokeParticles.velocities
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]
        
        // Reset if too high
        if (positions[i + 1] > 15) {
          positions[i] = (Math.random() - 0.5) * 20
          positions[i + 1] = Math.random() * 2
          positions[i + 2] = -8 + Math.random() * 2
        }
      }
      
      smokeRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    if (confettiRef.current && isPlaying) {
      const positions = confettiRef.current.geometry.attributes.position.array as Float32Array
      const velocities = confettiParticles.velocities
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]
        
        // Reset if too low
        if (positions[i + 1] < -5) {
          positions[i] = (Math.random() - 0.5) * 25
          positions[i + 1] = 8 + Math.random() * 5
          positions[i + 2] = -12 + Math.random() * 10
        }
      }
      
      confettiRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Smoke Particles */}
      {isPlaying && (
        <points ref={smokeRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={smokeParticles.positions.length / 3}
              array={smokeParticles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.3}
            color="#888888"
            transparent
            opacity={0.4}
            sizeAttenuation={true}
          />
        </points>
      )}

      {/* Confetti Particles */}
      {isPlaying && (
        <points ref={confettiRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={confettiParticles.positions.length / 3}
              array={confettiParticles.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={confettiParticles.colors.length / 3}
              array={confettiParticles.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            vertexColors={true}
            transparent
            opacity={0.8}
            sizeAttenuation={true}
          />
        </points>
      )}
    </group>
  )
}
