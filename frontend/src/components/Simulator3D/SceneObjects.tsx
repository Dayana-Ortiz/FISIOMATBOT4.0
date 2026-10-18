import React, { forwardRef, useMemo } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { PhysicalObjectProps } from '../../types/simulator3d';

interface SceneObjectProps {
  object: PhysicalObjectProps;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const SELECTED_COLOR = '#FD7B41';

export const CubeObject = forwardRef<RapierRigidBody, SceneObjectProps>(
  ({ object, isSelected, onSelect }, ref) => (
    <RigidBody
      ref={ref}
      colliders="cuboid"
      position={object.position}
      mass={object.mass}
      friction={object.friction}
      restitution={object.restitution}
    >
      <mesh
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect(object.id);
        }}
      >
        <boxGeometry args={[object.size, object.size, object.size]} />
        <meshStandardMaterial color={isSelected ? SELECTED_COLOR : '#3b82f6'} />
      </mesh>
    </RigidBody>
  )
);
CubeObject.displayName = 'CubeObject';

export const SphereObject = forwardRef<RapierRigidBody, SceneObjectProps>(
  ({ object, isSelected, onSelect }, ref) => (
    <RigidBody
      ref={ref}
      colliders="ball"
      position={object.position}
      mass={object.mass}
      friction={object.friction}
      restitution={object.restitution}
    >
      <mesh
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect(object.id);
        }}
      >
        <sphereGeometry args={[object.size / 2, 32, 32]} />
        <meshStandardMaterial color={isSelected ? SELECTED_COLOR : '#22c55e'} />
      </mesh>
    </RigidBody>
  )
);
SphereObject.displayName = 'SphereObject';

// Rampa: cuerpo físico fijo, rotado según el ángulo configurado en el inspector.
export const RampObject = forwardRef<RapierRigidBody, SceneObjectProps>(
  ({ object, isSelected, onSelect }, ref) => {
    const angleRad = useMemo(
      () => ((object.rampAngleDeg ?? 0) * Math.PI) / 180,
      [object.rampAngleDeg]
    );
    const length = object.size;
    const thickness = 0.2;

    return (
      <RigidBody
        ref={ref}
        type="fixed"
        colliders="cuboid"
        position={object.position}
        rotation={[0, 0, angleRad]}
        friction={object.friction}
        restitution={object.restitution}
      >
        <mesh
          castShadow
          receiveShadow
          onClick={(event) => {
            event.stopPropagation();
            onSelect(object.id);
          }}
        >
          <boxGeometry args={[length, thickness, 2]} />
          <meshStandardMaterial color={isSelected ? SELECTED_COLOR : '#94a3b8'} />
        </mesh>
      </RigidBody>
    );
  }
);
RampObject.displayName = 'RampObject';
