import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────────────────────────
// Internal 3-D model loader (subject-agnostic)
// ─────────────────────────────────────────────────────────────────

interface ModelProps {
  url: string;
  scale?: number;
}

function GenericModel({ url, scale = 1 }: ModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={scale} position={[0, -0.2, 0]} />;
}

// ─────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────

export type MediaType = 'video' | 'pdf' | 'image' | 'audio' | 'model' | 'none';

interface MediaViewerProps {
  videoUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  /** URL to a .glb / .gltf 3-D model file */
  modelUrl?: string;
  modelScale?: number;
  /** Short description shown below the 3-D model */
  modelExplanation?: string;
  /** Which tab to open first; defaults to the first available media */
  defaultTab?: MediaType;
  className?: string;
}

export function MediaViewer({
  videoUrl,
  pdfUrl,
  imageUrl,
  audioUrl,
  modelUrl,
  modelScale = 1,
  modelExplanation,
  defaultTab,
  className = '',
}: MediaViewerProps) {
  const { t } = useTranslation();
  
  const TABS: { key: MediaType; label: string }[] = [
    { key: 'video', label: t('mediaVideo') },
    { key: 'pdf', label: t('mediaPdf') },
    { key: 'image', label: t('mediaImage') },
    { key: 'audio', label: t('mediaAudio') },
    { key: 'model', label: t('mediaModel3d') },
  ];

  const available = TABS.filter(({ key }) => {
    if (key === 'video') return !!videoUrl;
    if (key === 'pdf') return !!pdfUrl;
    if (key === 'image') return !!imageUrl;
    if (key === 'audio') return !!audioUrl;
    if (key === 'model') return !!modelUrl;
    return false;
  });

  const initialTab = defaultTab && available.some((t) => t.key === defaultTab)
    ? defaultTab
    : available[0]?.key ?? 'none';

  const [activeTab, setActiveTab] = useState<MediaType>(initialTab);

  if (available.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground ${className}`}>
        {t('noMediaAvailable')}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Tab bar — only shown if more than one media type exists */}
      {available.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {available.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="rounded-xl overflow-hidden bg-muted">
        {activeTab === 'video' && videoUrl && (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={videoUrl}
              title={t('videoLabel')}
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {activeTab === 'pdf' && pdfUrl && (
          <div className="relative w-full" style={{ paddingBottom: '100%' }}>
            <iframe
              src={pdfUrl}
              title={t('mediaPdf')}
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        )}

        {activeTab === 'image' && imageUrl && (
          <img
            src={imageUrl}
            alt={t('lessonMedia')}
            className="w-full h-auto max-h-[600px] object-contain"
          />
        )}

        {activeTab === 'audio' && audioUrl && (
          <div className="flex items-center justify-center p-6">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls src={audioUrl} className="w-full max-w-lg" />
          </div>
        )}

        {activeTab === 'model' && modelUrl && (
          <div className="flex flex-col gap-2">
            <div className="w-full h-[400px]">
              <Canvas camera={{ position: [0, 0.6, 2.4], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[2, 2, 2]} intensity={1.1} />
                <directionalLight position={[-2, -1, 1]} intensity={0.6} />
                <Suspense fallback={null}>
                  <GenericModel url={modelUrl} scale={modelScale} />
                </Suspense>
                <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
              </Canvas>
            </div>
            {modelExplanation && (
              <p className="px-4 pb-4 text-sm text-muted-foreground">{modelExplanation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
