import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.2} position={[0, -0.2, 0]} />;
}

export default function LessonModelViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0.6, 2.4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 2, 2]} intensity={1.1} />
        <directionalLight position={[-2, -1, 1]} intensity={0.6} />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}
