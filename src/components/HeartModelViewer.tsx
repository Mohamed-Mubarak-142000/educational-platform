import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import heartModelUrl from '@/assets/realistic_human_heart.glb';

function HeartModel() {
  const { scene } = useGLTF(heartModelUrl);
  return <primitive object={scene} scale={1.2} position={[0, -0.2, 0]} />;
}

export function HeartModelViewer() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0.6, 2.4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 2, 2]} intensity={1.1} />
        <directionalLight position={[-2, -1, 1]} intensity={0.6} />
        <Suspense fallback={null}>
          <HeartModel />
        </Suspense>
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(heartModelUrl);
