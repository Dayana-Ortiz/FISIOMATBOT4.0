// Tipos del Módulo Simulador 3D (ver prompt_simulador_3d_fisiomathbot.md, sección 5:
// "TypeScript Estricto: Tipar todas las interfaces de propiedades físicas").

export type GravityPresetId = 'earth' | 'moon' | 'mars' | 'free';

export interface GravityPreset {
  id: GravityPresetId;
  label: string;
  value: number; // m/s^2
}

export const GRAVITY_PRESETS: GravityPreset[] = [
  { id: 'earth', label: 'Tierra', value: 9.81 },
  { id: 'moon', label: 'Luna', value: 1.62 },
  { id: 'mars', label: 'Marte', value: 3.71 },
  { id: 'free', label: 'Espacio libre', value: 0 },
];

export interface WorldSettings {
  gravityPreset: GravityPresetId;
  gravity: number; // m/s^2, derivado de gravityPreset
  groundFriction: number;
  groundRestitution: number;
}

export type ObjectType = 'cube' | 'sphere' | 'ramp';

export interface PhysicalObjectProps {
  id: string;
  type: ObjectType;
  label: string;
  mass: number; // kg
  position: [number, number, number];
  size: number; // lado del cubo o diámetro de la esfera, en metros
  friction: number;
  restitution: number;
  rampAngleDeg?: number; // solo aplica a type === 'ramp'
}

export type CameraViewMode = 'isometric' | 'top';

export interface TelemetrySample {
  t: number; // segundos desde el reset
  height: number; // m
  speed: number; // m/s
  ep: number; // Energía potencial, J
  ek: number; // Energía cinética, J
  etotal: number; // J
}

export interface TelemetryData {
  current: TelemetrySample | null;
  history: TelemetrySample[];
}
