'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SpotLight } from 'three'
import { useCaliClubStore } from '@/stores/cali-club-store'

export function Lighting() {
  const spotLight1Ref = useRef<SpotLight>(null)
  const spotLight2Ref = useRef<SpotLight>(null)
  const spotLight3Ref = useRef<SpotLight>(null)
  const spotLight4Ref = useRef<SpotLight>(null)
  const spotLight5Ref = useRef<SpotLight>(null)
  const { isPlaying } = useCaliClubStore()

  // Animate lights in sync with music - more realistic
  useFrame((state) => {
    if (isPlaying) {
      const time = state.clock.elapsedTime
      
      // Color cycling for spotlights - smoother transitions
      if (spotLight1Ref.current) {
        const hue1 = (time * 0.12) % 1
        spotLight1Ref.current.color.setHSL(hue1, 0.95, 0.55)
        // Intensity pulsing with beat
        spotLight1Ref.current.intensity = 6 + Math.sin(time * 4) * 1.5
      }
      if (spotLight2Ref.current) {
        const hue2 = (time * 0.12 + 0.25) % 1
        spotLight2Ref.current.color.setHSL(hue2, 0.95, 0.55)
        spotLight2Ref.current.intensity = 5 + Math.sin(time * 4 + 0.5) * 1.5
      }
      if (spotLight3Ref.current) {
        const hue3 = (time * 0.12 + 0.5) % 1
        spotLight3Ref.current.color.setHSL(hue3, 0.95, 0.55)
        spotLight3Ref.current.intensity = 5 + Math.sin(time * 4 + 1) * 1.5
      }
      if (spotLight4Ref.current) {
        const hue4 = (time * 0.12 + 0.75) % 1
        spotLight4Ref.current.color.setHSL(hue4, 0.95, 0.55)
        spotLight4Ref.current.intensity = 4 + Math.sin(time * 4 + 1.5) * 1.5
      }
      if (spotLight5Ref.current) {
        const hue5 = (time * 0.12 + 0.4) % 1
        spotLight5Ref.current.color.setHSL(hue5, 0.95, 0.55)
        spotLight5Ref.current.intensity = 4.5 + Math.sin(time * 4 + 0.75) * 1.5
      }
    }
  })

  return (
    <>
      {/* Ambient Light - Lower for more dramatic effect */}
      <ambientLight intensity={0.25} />

      {/* Main Stage Spotlight - Center - More realistic */}
      <spotLight
        ref={spotLight1Ref}
        position={[0, 18, -8]}
        angle={0.5}
        penumbra={0.5}
        intensity={6}
        color="#00ffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
        target-position={[0, 0, -12]}
      />

      {/* Stage Left Spotlight - More realistic */}
      <spotLight
        ref={spotLight2Ref}
        position={[-10, 15, -6]}
        angle={0.6}
        penumbra={0.4}
        intensity={5}
        color="#ff00ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        target-position={[-4, 0, -12]}
      />

      {/* Stage Right Spotlight - More realistic */}
      <spotLight
        ref={spotLight3Ref}
        position={[10, 15, -6]}
        angle={0.6}
        penumbra={0.4}
        intensity={5}
        color="#00ff00"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        target-position={[4, 0, -12]}
      />

      {/* Dance Floor Center Spotlight - More realistic */}
      <spotLight
        ref={spotLight4Ref}
        position={[0, 12, 8]}
        angle={1.1}
        penumbra={0.6}
        intensity={4}
        color="#ffaa00"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        target-position={[0, 0, 0]}
      />

      {/* Back Spotlight - More realistic */}
      <spotLight
        ref={spotLight5Ref}
        position={[0, 10, 12]}
        angle={1.0}
        penumbra={0.5}
        intensity={4.5}
        color="#8888ff"
        castShadow
        target-position={[0, 2, 0]}
      />

      {/* Side Lasers - Left - More realistic with distance */}
      <pointLight
        position={[-18, 10, -4]}
        intensity={3.5}
        color="#00ffff"
        castShadow
        distance={35}
        decay={2}
      />
      <pointLight
        position={[-18, 8, 2]}
        intensity={3.5}
        color="#ff00ff"
        castShadow
        distance={35}
        decay={2}
      />
      <pointLight
        position={[-18, 6, 8]}
        intensity={3}
        color="#00ff00"
        castShadow
        distance={35}
        decay={2}
      />

      {/* Side Lasers - Right - More realistic */}
      <pointLight
        position={[18, 10, -4]}
        intensity={3.5}
        color="#00ff00"
        castShadow
        distance={35}
        decay={2}
      />
      <pointLight
        position={[18, 8, 2]}
        intensity={3.5}
        color="#ffaa00"
        castShadow
        distance={35}
        decay={2}
      />
      <pointLight
        position={[18, 6, 8]}
        intensity={3}
        color="#ff00ff"
        castShadow
        distance={35}
        decay={2}
      />

      {/* Dance Floor Accent Lights - Grid pattern */}
      {[-6, -3, 0, 3, 6].map((x) => 
        [-6, -3, 0, 3, 6].map((z) => (
          <pointLight
            key={`dance-${x}-${z}`}
            position={[x, 2.5, z]}
            intensity={2}
            color={x % 2 === 0 ? '#ff00ff' : '#00ffff'}
            distance={15}
            decay={2.5}
          />
        ))
      )}

      {/* Stage Accent Lights - More realistic */}
      <pointLight
        position={[-6, 2, -10]}
        intensity={2.5}
        color="#00ffff"
        distance={20}
        decay={2}
      />
      <pointLight
        position={[6, 2, -10]}
        intensity={2.5}
        color="#ff00ff"
        distance={20}
        decay={2}
      />
      <pointLight
        position={[0, 2, -14]}
        intensity={2}
        color="#00ff00"
        distance={18}
        decay={2}
      />

      {/* Back Fill Lights - More realistic */}
      <pointLight
        position={[0, 8, 18]}
        intensity={2.5}
        color="#ffffff"
        distance={40}
        decay={2}
      />
      <pointLight
        position={[-12, 6, 15]}
        intensity={2}
        color="#8888ff"
        distance={35}
        decay={2}
      />
      <pointLight
        position={[12, 6, 15]}
        intensity={2}
        color="#ff88ff"
        distance={35}
        decay={2}
      />

      {/* Rim Lights - For character separation */}
      <pointLight
        position={[-20, 5, 0]}
        intensity={1.5}
        color="#ffffff"
        distance={30}
        decay={2}
      />
      <pointLight
        position={[20, 5, 0]}
        intensity={1.5}
        color="#ffffff"
        distance={30}
        decay={2}
      />
    </>
  )
}
