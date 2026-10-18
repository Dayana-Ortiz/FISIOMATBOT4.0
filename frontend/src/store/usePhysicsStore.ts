// Store global del Simulador 3D (ver prompt_simulador_3d_fisiomathbot.md, sección 4,
// Paso 2: "emite el estado al store global (usePhysicsStore)").

import { create } from 'zustand';
import {
  CameraViewMode,
  GRAVITY_PRESETS,
  GravityPresetId,
  ObjectType,
  PhysicalObjectProps,
  TelemetrySample,
  WorldSettings,
} from '../types/simulator3d';

const MAX_TELEMETRY_SAMPLES = 200;

const gravityValueFor = (id: GravityPresetId): number =>
  GRAVITY_PRESETS.find((preset) => preset.id === id)?.value ?? 9.81;

const createDefaultObjects = (): PhysicalObjectProps[] => [
  {
    id: 'ramp-1',
    type: 'ramp',
    label: 'Rampa',
    mass: 0,
    position: [-1.5, 0, 0],
    size: 4,
    friction: 0.4,
    restitution: 0.1,
    rampAngleDeg: 25,
  },
  {
    id: 'sphere-1',
    type: 'sphere',
    label: 'Esfera 1',
    mass: 2,
    position: [0, 6, 0],
    size: 0.5,
    friction: 0.3,
    restitution: 0.5,
  },
];

interface PhysicsStoreState {
  worldSettings: WorldSettings;
  objects: PhysicalObjectProps[];
  selectedObjectId: string | null;
  isRunning: boolean;
  simulationTime: number;
  cameraView: CameraViewMode;
  resetToken: number;
  telemetry: { current: TelemetrySample | null; history: TelemetrySample[] };

  setGravityPreset: (id: GravityPresetId) => void;
  setGroundFriction: (value: number) => void;
  setGroundRestitution: (value: number) => void;
  addObject: (type: Exclude<ObjectType, 'ramp'>) => void;
  updateObjectProps: (id: string, patch: Partial<PhysicalObjectProps>) => void;
  selectObject: (id: string | null) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSimulationTime: (time: number) => void;
  setCameraView: (view: CameraViewMode) => void;
  pushTelemetrySample: (sample: TelemetrySample) => void;
}

export const usePhysicsStore = create<PhysicsStoreState>((set) => ({
  worldSettings: {
    gravityPreset: 'earth',
    gravity: gravityValueFor('earth'),
    groundFriction: 0.5,
    groundRestitution: 0.2,
  },
  objects: createDefaultObjects(),
  selectedObjectId: 'sphere-1',
  isRunning: false,
  simulationTime: 0,
  cameraView: 'isometric',
  resetToken: 0,
  telemetry: { current: null, history: [] },

  setGravityPreset: (id) =>
    set((state) => ({
      worldSettings: { ...state.worldSettings, gravityPreset: id, gravity: gravityValueFor(id) },
    })),

  setGroundFriction: (value) =>
    set((state) => ({ worldSettings: { ...state.worldSettings, groundFriction: value } })),

  setGroundRestitution: (value) =>
    set((state) => ({ worldSettings: { ...state.worldSettings, groundRestitution: value } })),

  addObject: (type) =>
    set((state) => {
      const count = state.objects.filter((o) => o.type === type).length + 1;
      const id = `${type}-${Date.now()}`;
      const spawnX = (count % 4) * 1.2 - 1.8;
      const newObject: PhysicalObjectProps = {
        id,
        type,
        label: type === 'cube' ? `Cubo ${count}` : `Esfera ${count}`,
        mass: type === 'cube' ? 3 : 2,
        position: [spawnX, 6, 1.5],
        size: type === 'cube' ? 0.6 : 0.5,
        friction: 0.3,
        restitution: 0.4,
      };
      return { objects: [...state.objects, newObject], selectedObjectId: id };
    }),

  updateObjectProps: (id, patch) =>
    set((state) => ({
      objects: state.objects.map((obj) => (obj.id === id ? { ...obj, ...patch } : obj)),
    })),

  selectObject: (id) => set({ selectedObjectId: id }),

  play: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),

  // El objeto `position` de cada PhysicalObjectProps es su posición de origen
  // (solo se usa como prop inicial del RigidBody). Reiniciar solo necesita forzar
  // el remount de los RigidBody (vía resetToken) para que vuelvan a esa posición.
  reset: () =>
    set((state) => ({
      isRunning: false,
      simulationTime: 0,
      resetToken: state.resetToken + 1,
      telemetry: { current: null, history: [] },
    })),

  setSimulationTime: (time) => set({ simulationTime: time }),

  setCameraView: (view) => set({ cameraView: view }),

  pushTelemetrySample: (sample) =>
    set((state) => ({
      telemetry: {
        current: sample,
        history: [...state.telemetry.history, sample].slice(-MAX_TELEMETRY_SAMPLES),
      },
    })),
}));
