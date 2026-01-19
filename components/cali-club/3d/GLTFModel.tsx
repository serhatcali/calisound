'use client'

import React, { Suspense, useRef, useEffect } from 'react'
import { Group, AnimationMixer, Box3, Vector3, AnimationClip } from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { customizeCharacterMaterials } from './CharacterCustomizer'

interface GLTFModelProps {
  url: string
  onModelLoad?: (model: Group) => void
  onAnimationsLoad?: (animations: any, actions: any) => void
  isPlaying?: boolean
  customizations?: {
    hairColor?: string
    clothingColor?: string
    skinColor?: string
  }
}

function GLTFModelContent({ url, onModelLoad, onAnimationsLoad, isPlaying, customizations }: GLTFModelProps) {
  const groupRef = useRef<Group>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const currentActionRef = useRef<any>(null)
  const actionsRef = useRef<{ [key: string]: any }>({})
  
  // Load GLTF model
  const gltf = useGLTF(url, true)
  
  // Scale model to appropriate size (GLB models might be too small)
  // Default scale: 2.5x to make characters more visible and match FBX size
  const MODEL_SCALE = 2.5
  
  // Clone and prepare the model with scale and positioning
  // IMPORTANT: All hooks must be called before any early returns
  const scaledModel = React.useMemo(() => {
    if (!gltf?.scene) return null
    
    const cloned = gltf.scene.clone()
    
    // Apply scale to the model itself (like FBXModel does)
    cloned.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE)
    
    // Calculate bounding box to position model correctly (feet on ground)
    const box = new Box3().setFromObject(cloned)
    const minY = box.min.y
    
    // Position model so its feet are at y=0
    cloned.position.y = -minY
    
    console.log(`[GLTFModel] ✅ Scale ${MODEL_SCALE} applied to model`)
    console.log(`[GLTFModel] ✅ Model positioned: minY=${minY.toFixed(2)}, offset=${(-minY).toFixed(2)}`)
    
    return cloned
  }, [gltf?.scene, MODEL_SCALE])
  
  console.log(`[GLTFModel] Model loaded with ${gltf?.animations?.length || 0} animations`)
  if (gltf?.animations && gltf.animations.length > 0) {
    gltf.animations.forEach((clip: AnimationClip) => {
      console.log(`[GLTFModel] Animation: ${clip.name} (${clip.duration.toFixed(2)}s)`)
    })
  }
  
  // Notify parent about loaded model
  useEffect(() => {
    if (gltf?.scene && onModelLoad) {
      onModelLoad(gltf.scene)
    }
  }, [gltf, onModelLoad])
  
  // Customize materials
  useEffect(() => {
    if (gltf?.scene && customizations) {
      customizeCharacterMaterials(gltf.scene, {
        clothingColor: customizations.clothingColor,
        skinTone: customizations.skinColor,
        hairColor: customizations.hairColor,
      })
    }
  }, [gltf, customizations])
  
  // Initialize animation mixer with cloned model
  useEffect(() => {
    if (!scaledModel || !gltf?.animations || gltf.animations.length === 0) {
      return
    }
    
    // Create mixer with cloned model
    mixerRef.current = new AnimationMixer(scaledModel)
    console.log(`[GLTFModel] ✅ Animation mixer initialized with ${gltf.animations.length} animations`)
    
    // Create animation actions manually
    const actions: { [key: string]: any } = {}
    gltf.animations.forEach((clip: AnimationClip) => {
      const action = mixerRef.current!.clipAction(clip)
      actions[clip.name] = action
      console.log(`[GLTFModel] Created action for: ${clip.name}`)
    })
    
    actionsRef.current = actions
    
    // Notify parent about animations
    if (onAnimationsLoad) {
      onAnimationsLoad({ actions, mixer: mixerRef.current }, actions)
    }
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
    }
  }, [scaledModel, gltf, onAnimationsLoad])
  
  // Play animation - always play at least idle, or dance when music is playing
  // IMPORTANT: Never use TPose - always use idle or other natural poses
  useEffect(() => {
    if (!mixerRef.current || Object.keys(actionsRef.current).length === 0) {
      return
    }
    
    const actions = actionsRef.current
    
    // Find suitable animations - EXCLUDE TPose/T-Pose
    // Priority: idle > walk > dance (when playing) > any other (except TPose)
    const idleAction = actions['idle'] || actions['Idle'] || actions['idle_01'] || actions['Idle_01'] || 
                       actions['Idle_Standing'] || actions['idle_standing'] || actions['Standing_Idle']
    const walkAction = actions['walk'] || actions['Walk'] || actions['walking'] || actions['walk_01'] || 
                       actions['Walk_01'] || actions['Walking']
    const danceAction = actions['dance'] || actions['Dance'] || actions['Dancing'] || actions['dancing'] || 
                        actions['dance_01'] || actions['Dance_01']
    
    // Get all actions except TPose variants
    const allActions = Object.values(actions).filter((action: any) => {
      const name = action.getClip().name.toLowerCase()
      return !name.includes('tpose') && !name.includes('t-pose') && !name.includes('t_pose')
    })
    
    // Choose animation based on music state
    // NEVER use TPose - prefer idle, then walk, then dance, then any other
    let targetAction = null
    if (isPlaying && danceAction) {
      targetAction = danceAction
    } else if (idleAction) {
      targetAction = idleAction
    } else if (walkAction) {
      targetAction = walkAction
    } else if (allActions.length > 0) {
      targetAction = allActions[0] as any
    }
    
    if (targetAction) {
      // Stop current action
      if (currentActionRef.current && currentActionRef.current !== targetAction) {
        currentActionRef.current.fadeOut(0.2)
      }
      
      // Play target animation immediately (no fade in on first play)
      currentActionRef.current = targetAction
      const isFirstPlay = !currentActionRef.current.isRunning()
      if (isFirstPlay) {
        // Force immediate play - set weight to 1 and play
        targetAction.reset()
        targetAction.setEffectiveWeight(1)
        targetAction.setEffectiveTimeScale(1)
        targetAction.play()
        console.log(`[GLTFModel] ✅ Playing animation IMMEDIATELY: ${targetAction.getClip().name}`)
      } else {
        targetAction.reset().fadeIn(0.3).play()
        console.log(`[GLTFModel] ✅ Playing animation (fade in): ${targetAction.getClip().name}`)
      }
    } else {
      console.warn(`[GLTFModel] ⚠️ No suitable animation found (excluding TPose)`)
      console.log(`[GLTFModel] Available animations:`, Object.keys(actions))
    }
    
    return () => {
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.3)
      }
    }
  }, [scaledModel, isPlaying])
  
  // Update animation mixer
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })
  
  // Early returns AFTER all hooks
  if (!gltf?.scene) {
    console.warn(`[GLTFModel] ⚠️ Model not loaded: ${url}`)
    return (
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color="#ff6b35" />
        </mesh>
      </group>
    )
  }
  
  console.log(`[GLTFModel] ✅ Model loaded successfully: ${url}`)
  
  if (!scaledModel) {
    console.warn(`[GLTFModel] ⚠️ Scaled model not created`)
    return (
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color="#ff6b35" />
        </mesh>
      </group>
    )
  }
  
  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      <primitive object={scaledModel} />
    </group>
  )
}

export function GLTFModel({ url, onModelLoad, onAnimationsLoad, isPlaying, customizations }: GLTFModelProps) {
  return (
    <Suspense fallback={
      <group>
        <mesh>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color="#ff6b35" />
        </mesh>
      </group>
    }>
      <GLTFModelContent 
        url={url} 
        onModelLoad={onModelLoad}
        onAnimationsLoad={onAnimationsLoad}
        isPlaying={isPlaying}
        customizations={customizations}
      />
    </Suspense>
  )
}
