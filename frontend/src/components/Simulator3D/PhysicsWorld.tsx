import React, { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { usePhysicsStore } from '../../store/usePhysicsStore';
import { CubeObject, RampObject, SphereObject } from './SceneObjects';

const SAMPLE_INTERVAL = 0.1; // segundos entre muestras de telemetría

export type BodiesRefMap = Record<string, RapierRigidBody | null>;

// Recalcula Ep, Ek y Etotal del objeto seleccionado en cada frame (muestreado)
// y avanza el cronómetro de la simulación. Vive dentro de <Physics> para tener
// acceso a los RigidBody ya sincronizados en el frame actual.
const TelemetrySampler: React.FC<{ bodiesRef: React.MutableRefObject<BodiesRefMap> }> = ({
  bodiesRef,
}) => {
  const accumRef = useRef(0);

  useFrame((_, delta) => {
    const { isRunning } = usePhysicsStore.getState();
    if (!isRunning) return;

    usePhysicsStore.setState((state) => ({ simulationTime: state.simulationTime + delta }));

    accumRef.current += delta;
    if (accumRef.current < SAMPLE_INTERVAL) return;
    accumRef.current = 0;

    const { selectedObjectId, objects, worldSettings, simulationTime, pushTelemetrySample } =
      usePhysicsStore.getState();
    const objectDef = objects.find((o) => o.id === selectedObjectId);
    const body = selectedObjectId ? bodiesRef.current[selectedObjectId] : null;
    if (!body || !objectDef || objectDef.type === 'ramp') return;

    const translation = body.translation();
    const linvel = body.linvel();
    const mass = body.mass() || objectDef.mass;
    const groundOffset = objectDef.size / 2;
    const height = Math.max(0, translation.y - groundOffset);
    const speed = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
    const ep = mass * worldSettings.gravity * height;
    const ek = 0.5 * mass * speed ** 2;

    pushTelemetrySample({ t: simulationTime, height, speed, ep, ek, etotal: ep + ek });
  });

  return null;
};

const PhysicsWorld: React.FC = () => {
  const objects = usePhysicsStore((s) => s.objects);
  const selectedObjectId = usePhysicsStore((s) => s.selectedObjectId);
  const isRunning = usePhysicsStore((s) => s.isRunning);
  const gravity = usePhysicsStore((s) => s.worldSettings.gravity);
  const groundFriction = usePhysicsStore((s) => s.worldSettings.groundFriction);
  const groundRestitution = usePhysicsStore((s) => s.worldSettings.groundRestitution);
  const resetToken = usePhysicsStore((s) => s.resetToken);
  const selectObject = usePhysicsStore((s) => s.selectObject);

  const bodiesRef = useRef<BodiesRefMap>({});
  const makeRefSetter = useCallback(
    (id: string) => (body: RapierRigidBody | null) => {
      bodiesRef.current[id] = body;
    },
    []
  );

  const gravityVector = useMemo<[number, number, number]>(() => [0, -gravity, 0], [gravity]);

  return (
    <Physics gravity={gravityVector} paused={!isRunning}>
      <TelemetrySampler bodiesRef={bodiesRef} />

      {/* Suelo de la matriz 3D */}
      <RigidBody type="fixed" friction={groundFriction} restitution={groundRestitution}>
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[30, 0.1, 30]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </RigidBody>

      {objects.map((object) => {
        const key = `${object.id}-${resetToken}`;
        const isSelected = object.id === selectedObjectId;
        const commonProps = { object, isSelected, onSelect: selectObject };

        if (object.type === 'cube') {
          return <CubeObject key={key} ref={makeRefSetter(object.id)} {...commonProps} />;
        }
        if (object.type === 'sphere') {
          return <SphereObject key={key} ref={makeRefSetter(object.id)} {...commonProps} />;
        }
        return <RampObject key={key} ref={makeRefSetter(object.id)} {...commonProps} />;
      })}
    </Physics>
  );
};

export default PhysicsWorld;
