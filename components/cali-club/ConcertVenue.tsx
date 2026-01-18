'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Stage } from './3d/Stage'
import { Characters } from './3d/Characters'
import { Lighting } from './3d/Lighting'
import { AtmosphericEffects } from './3d/AtmosphericEffects'

export function ConcertVenue() {
  return (
    <div className="h-full w-full">
      <Canvas
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        shadows
      >
        {/* Camera - Tomorrowland style wide view */}
        <PerspectiveCamera
          makeDefault
          position={[0, 12, 20]}
          fov={75}
        />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={40}
          minPolarAngle={Math.PI / 6} // 30 degrees
          maxPolarAngle={Math.PI / 2.2} // ~82 degrees
          target={[0, 2, -6]} // Look at center of stage
        />

        {/* Lighting */}
        <Lighting />

        {/* No Environment - Let the background be clear */}
        {/* Environment preset="night" was creating a wall effect */}

        {/* Stage */}
        <Stage />

        {/* Characters */}
        <Characters />

        {/* Atmospheric Effects */}
        <AtmosphericEffects />
      </Canvas>
    </div>
  )
}
