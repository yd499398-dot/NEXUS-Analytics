import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { DecisionStep } from '../types';
import { motion } from 'framer-motion';

interface ThreeDecisionTreeProps {
  decisionPath: DecisionStep[];
  riskLevel: 'Low' | 'Medium' | 'High' | null;
  hoveredStepIndex?: number | null;
}

const NodeLabel = ({ step, outcome, highlighted }: { step: string; outcome: string; highlighted?: boolean }) => (
  <Html center distanceFactor={10}>
    <div className={`text-slate-900 dark:text-slate-100 p-2.5 rounded-lg border text-xs w-36 backdrop-blur-sm pointer-events-none shadow-md transition-all ${highlighted ? 'bg-indigo-50 border-indigo-400 scale-110 z-50' : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'}`}>
      <div className={`font-bold text-[9px] tracking-widest uppercase mb-1.5 ${highlighted ? 'text-indigo-700' : 'text-indigo-600'}`}>{step}</div>
      <div className={`leading-tight font-medium ${highlighted ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-200'}`}>{outcome}</div>
    </div>
  </Html>
);

const TreeGraph = ({ path, risk, hoveredStepIndex }: { path: DecisionStep[]; risk: string | null; hoveredStepIndex?: number | null }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  const nodes = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const len = path.length || 1;
    for (let i = 0; i < len; i++) {
      const x = (i % 2 === 0 ? 1 : -1) * (1.5 + Math.random());
      const y = 3 - i * 1.5;
      const z = (Math.random() - 0.5) * 2;
      points.push(new THREE.Vector3(x, y, z));
    }
    points.push(new THREE.Vector3(0, 3 - len * 1.5, 0));
    return points;
  }, [path]);

  const riskColor = risk === 'High' ? '#f43f5e' : risk === 'Medium' ? '#f59e0b' : '#34d399';

  return (
    <group ref={groupRef}>
      {/* Root Node */}
      <Sphere args={[0.3, 32, 32]} position={[0, 4.5, 0]}>
        <meshStandardMaterial color="#4f46e5" emissive="#6366f1" emissiveIntensity={0.8} />
        <Html center distanceFactor={10} position={[0, 0.6, 0]}>
          <div className="text-indigo-700 font-bold text-[10px] tracking-widest uppercase bg-indigo-50 px-2 py-1 rounded border border-indigo-200 backdrop-blur-sm shadow-sm">
            Root Genesis
          </div>
        </Html>
      </Sphere>

      <Line
        points={[new THREE.Vector3(0, 4.5, 0), nodes[0] || new THREE.Vector3(0,0,0)]}
        color="#6366f1"
        lineWidth={hoveredStepIndex === 0 ? 4 : 2}
        dashed
      />

      {path.map((step, idx) => {
        const isHovered = hoveredStepIndex === idx;
        const sphereRadius = isHovered ? 0.35 : 0.25;
        
        return (
          <React.Fragment key={idx}>
            <Sphere args={[sphereRadius, 32, 32]} position={nodes[idx]}>
              <meshStandardMaterial color={isHovered ? '#4f46e5' : '#818cf8'} wireframe={!isHovered} emissive={isHovered ? '#4f46e5' : '#000000'} emissiveIntensity={0.5} />
              <NodeLabel step={step.condition} outcome={step.outcome} highlighted={isHovered} />
            </Sphere>
            
            <Line
              points={[nodes[idx], nodes[idx + 1]]}
              color={idx === path.length - 1 ? riskColor : (hoveredStepIndex === idx + 1 ? '#4f46e5' : '#818cf8')}
              lineWidth={hoveredStepIndex === idx + 1 ? 4 : 2}
              opacity={hoveredStepIndex === idx + 1 ? 1 : 0.6}
              transparent
            />
          </React.Fragment>
        );
      })}

      {/* Final Risk Node */}
      {risk && (
        <Sphere args={[0.5, 32, 32]} position={nodes[nodes.length - 1]}>
          <meshStandardMaterial color={riskColor} emissive={riskColor} emissiveIntensity={0.6} />
          <Html center distanceFactor={8} position={[0, -0.9, 0]}>
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className={`text-white font-bold px-4 py-1.5 rounded-lg border shadow-[0_0_15px_rgba(0,0,0,0.5)] tracking-wide uppercase text-xs backdrop-blur-sm ${
                risk === 'High' ? 'bg-rose-500/20 border-rose-500' : 
                risk === 'Medium' ? 'bg-amber-500/20 border-amber-500' : 
                'bg-emerald-500/20 border-emerald-500'
              }`}
            >
              Terminal Node: {risk}
            </motion.div>
          </Html>
        </Sphere>
      )}
    </group>
  );
};

export default function ThreeDecisionTree({ decisionPath, riskLevel, hoveredStepIndex }: ThreeDecisionTreeProps) {
  return (
    <div className="w-full h-full min-h-[400px] relative rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 border border-transparent">
      <div className="absolute top-4 left-4 z-10 text-slate-500 text-[10px] uppercase tracking-widest font-mono flex items-center space-x-2 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
        <span>WebGL Node Graph Active</span>
      </div>
      
      {decisionPath.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs tracking-widest uppercase z-10 pointer-events-none">
          Standby for data injection...
        </div>
      ) : null}

      <Canvas camera={{ position: [0, 1, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#818cf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#34d399" />
        <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.3} />
        {decisionPath.length > 0 && <TreeGraph path={decisionPath} risk={riskLevel} hoveredStepIndex={hoveredStepIndex} />}
      </Canvas>
    </div>
  );
}
