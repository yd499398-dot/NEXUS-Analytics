import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function SpinningCore({ hovered }: { hovered: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (coreRef.current) {
      // Rotate core
      coreRef.current.rotation.x = time * (hovered ? 0.8 : 0.4);
      coreRef.current.rotation.y = -time * (hovered ? 0.6 : 0.3);
      // Pulsing scale
      const scale = 0.85 + Math.sin(time * 2) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (outerRef.current) {
      // Rotate outer shell opposite direction
      outerRef.current.rotation.x = -time * (hovered ? 0.4 : 0.2);
      outerRef.current.rotation.y = time * (hovered ? 0.5 : 0.25);
      outerRef.current.rotation.z = time * (hovered ? 0.3 : 0.1);
    }
  });

  return (
    <group>
      {/* Outer Wireframe Octahedron */}
      <mesh ref={outerRef}>
        <octahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial 
          color={hovered ? '#6366f1' : '#4f46e5'} 
          emissive={hovered ? '#818cf8' : '#6366f1'} 
          emissiveIntensity={hovered ? 1.0 : 0.6}
          wireframe 
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner Glowing 20-sided Crystal Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial 
          color={hovered ? '#818cf8' : '#3b82f6'} 
          emissive={hovered ? '#4f46e5' : '#1d4ed8'}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

export default function Interactive3DLogo() {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="w-10 h-10 select-none cursor-pointer rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-250/20 dark:border-slate-700/30 flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Interactive Neural Node Graph Core"
    >
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <pointLight position={[5, 5, 5]} intensity={1.8} color="#818cf8" />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#38bdf8" />
        <SpinningCore hovered={hovered} />
      </Canvas>
    </div>
  );
}
