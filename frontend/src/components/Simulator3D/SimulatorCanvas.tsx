import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import PhysicsWorld from './PhysicsWorld';
import { usePhysicsStore } from '../../store/usePhysicsStore';
import { CameraViewMode } from '../../types/simulator3d';

const VIEW_PRESETS: Record<
  CameraViewMode,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  isometric: { position: [12, 10, 12], target: [0, 1, 0] },
  top: { position: [0, 18, 0.01], target: [0, 0, 0] },
};

type OrbitControlsRef = React.ElementRef<typeof OrbitControls>;

// Aplica el preset de vista activo (isométrica/cenital) a la cámara y a los
// OrbitControls cada vez que cambia en el store.
const CameraRig: React.FC<{ controlsRef: React.RefObject<OrbitControlsRef> }> = ({
  controlsRef,
}) => {
  const cameraView = usePhysicsStore((s) => s.cameraView);
  const { camera } = useThree();

  useEffect(() => {
    const preset = VIEW_PRESETS[cameraView];
    camera.position.set(...preset.position);
    camera.lookAt(...preset.target);
    const controls = controlsRef.current as unknown as {
      target: { set: (x: number, y: number, z: number) => void };
      update: () => void;
    } | null;
    controls?.target.set(...preset.target);
    controls?.update();
  }, [cameraView, camera, controlsRef]);

  return null;
};

const SimulatorCanvas: React.FC = () => {
  const controlsRef = useRef<OrbitControlsRef>(null);

  return (
    <Canvas shadows camera={{ position: VIEW_PRESETS.isometric.position, fov: 50 }}>
      <color attach="background" args={['#0b1b3a']} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Grid
        // Ligeramente por encima de y=0 para no competir en profundidad con
        // la cara superior del suelo físico (z-fighting: franjas/duplicados).
        position={[0, 0.005, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3b5680"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#FD7B41"
        fadeDistance={40}
        infiniteGrid
      />
      <Suspense fallback={null}>
        <PhysicsWorld />
      </Suspense>
      <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.1} />
      <CameraRig controlsRef={controlsRef} />
    </Canvas>
  );
};

export default SimulatorCanvas;
