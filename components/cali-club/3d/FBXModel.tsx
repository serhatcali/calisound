'use client'

import React, { Suspense, useRef, useEffect, useState } from 'react'
import { Group, AnimationMixer, Box3, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useFBX, useAnimations } from '@react-three/drei'

interface FBXModelProps {
  url: string
  onModelLoad?: (model: Group) => void
  onAnimationsLoad?: (animations: any, actions: any) => void
  isPlaying?: boolean
}

function FBXModelContent({ url, onModelLoad, onAnimationsLoad, isPlaying }: FBXModelProps) {
  const groupRef = useRef<Group>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const [calculatedScale, setCalculatedScale] = useState<number>(0.01)
  
  const fbx = useFBX(url)
  
  // Calculate scale based on model bounding box
  useEffect(() => {
    if (fbx) {
      const box = new Box3().setFromObject(fbx)
      const size = box.getSize(new Vector3())
      const height = size.y
      
      // Target height for a character (approximately 2.5 units - larger for visibility)
      // Mixamo models are typically 180 units tall, we want them to be ~2.5 units
      const targetHeight = 2.5
      const scale = targetHeight / height
      
      console.log(`[FBXModel] Model height: ${height.toFixed(2)}, target: ${targetHeight}, calculated scale: ${scale.toFixed(4)}`)
      setCalculatedScale(scale)
    }
  }, [fbx])
  
  // Store actions for later use
  const actionsRef = useRef<{ [key: string]: any }>({})
  const currentActionRef = useRef<any>(null)
  
  // Log animations when model loads
  useEffect(() => {
    if (fbx?.animations && fbx.animations.length > 0) {
      console.log(`[FBXModel] Model has ${fbx.animations.length} animations:`)
      fbx.animations.forEach((clip: any) => {
        console.log(`[FBXModel]   - ${clip.name} (${clip.duration.toFixed(2)}s)`)
      })
    }
  }, [fbx])
  
  // Notify parent about loaded model
  useEffect(() => {
    if (fbx && onModelLoad) {
      onModelLoad(fbx)
    }
  }, [fbx, onModelLoad])
  
  // Play animation - always play at least idle, or dance when music is playing
  // IMPORTANT: Never use TPose - always use idle or other natural poses
  useEffect(() => {
    if (!mixerRef.current || Object.keys(actionsRef.current).length === 0) {
      return
    }
    
    const actions = actionsRef.current
    
    // Find suitable animations - EXCLUDE TPose/T-Pose
    const idleAction = actions['idle'] || actions['Idle'] || actions['idle_01'] || actions['Idle_01'] || 
                       actions['Idle_Standing'] || actions['idle_standing'] || actions['Standing_Idle']
    const danceAction = actions['dance'] || actions['Dance'] || actions['Dancing'] || actions['dancing'] || 
                        actions['dance_01'] || actions['Dance_01']
    const walkAction = actions['walk'] || actions['Walk'] || actions['walking'] || actions['walk_01'] || 
                       actions['Walk_01'] || actions['Walking']
    
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
        console.log(`[FBXModel] ✅ Playing animation IMMEDIATELY: ${targetAction.getClip().name}`)
      } else {
        targetAction.reset().fadeIn(0.3).play()
        console.log(`[FBXModel] ✅ Playing animation (fade in): ${targetAction.getClip().name}`)
      }
    } else {
      console.warn(`[FBXModel] ⚠️ No suitable animation found (excluding TPose)`)
      console.log(`[FBXModel] Available actions:`, Object.keys(actions))
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
  
  // Use calculated scale or fallback to a small value
  // The calculated scale should be around 0.01-0.014 for Mixamo models (180 units -> 2.5 units)
  const FBX_SCALE = calculatedScale > 0 ? calculatedScale : 0.01
  
  // Apply scale to the model - use object scale, not geometry scale (simpler and more reliable)
  // Use useMemo to avoid recreating the model on every render
  const scaledModel = React.useMemo(() => {
    if (!fbx) return null
    
    const cloned = fbx.clone()
    
    // Apply scale to the object itself (not geometry - this is simpler and more reliable)
    cloned.scale.set(FBX_SCALE, FBX_SCALE, FBX_SCALE)
    
    // Calculate bounding box to position model correctly (feet on ground)
    const box = new Box3().setFromObject(cloned)
    const minY = box.min.y
    // Move model up so its bottom (minY) is at y=0
    cloned.position.y = -minY
    
    console.log(`[FBXModel] ✅ Scale ${FBX_SCALE.toFixed(4)} applied to model`)
    console.log(`[FBXModel] ✅ Model positioned: minY=${minY.toFixed(2)}, offset=${(-minY).toFixed(2)}`)
    console.log(`[FBXModel] ✅ Model bounding box:`, box.min, box.max)
    console.log(`[FBXModel] ✅ Model children count:`, cloned.children.length)
    return cloned
  }, [fbx, FBX_SCALE])
  
  // Initialize animation mixer with cloned model (CRITICAL: must use scaledModel, not groupRef)
  useEffect(() => {
    if (!scaledModel || !fbx?.animations || fbx.animations.length === 0) {
      return
    }
    
    // Create mixer with cloned model (this is the key fix!)
    mixerRef.current = new AnimationMixer(scaledModel)
    console.log(`[FBXModel] ✅ Animation mixer initialized with ${fbx.animations.length} animations`)
    
    // Create animation actions manually on the cloned model
    const actions: { [key: string]: any } = {}
    fbx.animations.forEach((clip: any) => {
      const action = mixerRef.current!.clipAction(clip)
      actions[clip.name] = action
      console.log(`[FBXModel] Created action for: ${clip.name}`)
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
  }, [scaledModel, fbx, onAnimationsLoad])
  
  // Also ensure group scale is applied
  useEffect(() => {
    if (groupRef.current && calculatedScale > 0) {
      groupRef.current.scale.set(1, 1, 1) // Reset to 1 since we scale the model directly
      console.log(`[FBXModel] ✅ Group scale reset to 1 (model is pre-scaled)`)
    }
  }, [calculatedScale])
  
  // Log when model is rendered (must be before early returns)
  useEffect(() => {
    if (scaledModel) {
      console.log(`[FBXModel] ✅ Rendering model with scale ${FBX_SCALE.toFixed(4)}`)
      console.log(`[FBXModel] ✅ Model position:`, scaledModel.position)
      console.log(`[FBXModel] ✅ Model scale:`, scaledModel.scale)
    }
  }, [scaledModel, FBX_SCALE])
  
  // Show placeholder if model not loaded
  if (!fbx) {
    console.warn(`[FBXModel] ⚠️ Model not loaded: ${url}`)
    return (
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color="#ff6b35" />
        </mesh>
      </group>
    )
  }
  
  if (!scaledModel) {
    console.warn(`[FBXModel] ⚠️ Scaled model not created`)
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
    <group ref={groupRef}>
      <primitive object={scaledModel} />
    </group>
  )
}

export function FBXModel({ url, onModelLoad, onAnimationsLoad, isPlaying }: FBXModelProps) {
  return (
    <Suspense fallback={null}>
      <FBXModelContent 
        url={url} 
        onModelLoad={onModelLoad}
        onAnimationsLoad={onAnimationsLoad}
        isPlaying={isPlaying}
      />
    </Suspense>
  )
}
