# SYSTEM PROMPT: Desarrollo e Integración del Módulo Simulador 3D (FisioMathBot)

> **Instrucciones para el Agente IDE (Claude Code / Cursor / Windsurf):**
> Actúa como un **Arquitecto Senior de Software Gráfico y Desarrollador Full-Stack especializado en WebGL, Three.js / React Three Fiber y WebAssembly/Unity**. Tu objetivo es construir e integrar el nuevo **Módulo de Simulador Interactivo 3D de Física** dentro del ecosistema existente de **FisioMathBot** (Plataforma REDA construida en React, TypeScript y Vite).

---

## 1. CONTEXTO Y ARQUITECTURA DEL PROYECTO

- **Proyecto:** FisioMathBot - Recurso Educativo Digital Abierto (REDA) para el aprendizaje de Física (Energía Potencial, Cinética, Conservación de la Energía) y Robótica Educativa.
- **Stack Tecnológico Existente:** React + TypeScript + Vite + Tailwind CSS + Node.js/Python API REST.
- **Inspiración Visual/Funcional:** Ecosistema VEX VR (`https://vr.vex.com/`) - Matriz/Playground tridimensional con grilla de coordenadas, física en tiempo real, HUD de telemetría, biblioteca de objetos y consola de bloques/código.

---

## 2. ESPECIFICACIONES TÉCNICAS DEL SIMULADOR 3D

El simulador debe actuar como una matriz tridimensional de simulación física configurable en tiempo real.

### 2.1. Entorno Gráfico 3D (The Playground Grid)
1. **Matriz 3D Estilo VEX VR:**
   - Plano de piso reticulado (Grid/Matriz 3D) con coordenadas $(X, Y, Z)$ visibles y marcadores numéricos/métricos.
   - Paredes perimetrales opcionales o delimitadores visuales de la arena de prueba.
   - Sistema de iluminación ambiental, sombras suaves y renderizado PBR de alto rendimiento.
   - Iluminación y sombras optimizadas para rendimiento en navegadores web estándar (ISO/IEC 25010).

2. **Cámara e Interacción:**
   - **Cam Controls:** OrbitControls (Rotación, Pan, Zoom) con suave inercia.
   - **Vistas Predefinidas:** Vista Cenital (Top-Down), Vista Isométrica (VEX Style), Vista Seguimiento de Objeto (Follow Cam) y Vista de Primera Persona del Robot/Objeto.

### 2.2. Motor de Física y Atributos Dinámicos
1. **Motor Físico Integrado:**
   - Simulación física estricta empleando un motor rígido (Cannon.js / Rapier 3D / Unity PhysX exportado).
   - Cálculo en tiempo real de:
     - Energía Potencial: $E_p = m \cdot g \cdot h$
     - Energía Cinética: $E_k = \frac{1}{2} m \cdot v^2$
     - Trabajo, Fricción ($\mu_s, \mu_k$) y Fuerza Normal.

2. **Propiedades Modificables por Objeto/Entorno:**
   - **Parámetros del Entorno:** Gravedad ($g$, configurable entre $0$ m/s², $9.81$ m/s² [Tierra], $1.62$ m/s² [Luna], $3.71$ m/s² [Marte]), coeficientes de fricción del plano.
   - **Parámetros del Objeto/Figura:** Masa ($m$), Peso ($W$), Coeficiente de Restitución (Rebote), Inclinación de Planos ($\theta$).

### 2.3. Biblioteca de Componentes y Modificadores
El usuario debe poder instanciar y arrastrar/soltar (Drag & Drop en espacio 3D o vía menú GUI):
- **Formas Primitivas:** Cubos, Esferas, Cilindros, Esferas con diferente densidad.
- **Planos Inclinados Rígidos:** Rampas con ángulo ajustable ($\theta$) y longitud personalizable para experimentos de conservación de energía.
- **Kit Robotico / Agente Mobile:** Modelo del robot **FisioMathBot / Lego Spike Prime** con sensores de distancia, color y encoder de ruedas.
- **Sensores e Instrumentación Virtual:** Puertas fotoeléctricas (Photogates), velocímetros 3D, líneas trazadoras de trayectoria y vectores de fuerza visuales (Vectores de Velocidad $\vec{v}$ y Fuerza $\vec{F}$).

---

## 3. COMPONENTES DE LA INTERFAZ DE USUARIO (UI / HUD)

La interfaz alrededor del lienzo 3D debe replicar el orden y pulcritud de VEX VR:

1. **Top Bar (Barra Superior de Control):**
   - Play / Pause / Reset / Step-by-Step Simulation.
   - Selector de Gravedad Presets (Tierra, Luna, Marte, Espacio Libre).
   - Contador de Tiempo Transcurrido ($t$) y FPS Monitor.
   - Botón de alternancia entre Vista 3D Completa, Split Screen con Bloques (UBlockly), y Telemetría.

2. **Sidebar / Inspector de Propiedades (RigidBody Inspector):**
   - Panel flotante o colapsable que al seleccionar un objeto en la matriz 3D permita cambiar mediante sliders e inputs numéricos:
     - `Masa (kg)`
     - `Posición (X, Y, Z)`
     - `Inclinación (º)`
     - `Fricción Estática / Dinámica`
     - `Restitución / Elasticidad`

3. **Dashboard de Telemetría en Tiempo Real:**
   - Gráficos dinámicos interactivos (Chart.js / Recharts) integrados al viewport:
     - Curva de $E_p$ vs $E_k$ vs $E_{total}$.
     - Gráfica Posición-Tiempo y Velocidad-Tiempo.

4. **Integración con Programación por Bloques (UBlockly):**
   - Panel de código por bloques para programar eventos en la matriz (e.g., `Mover robot X pasos`, `Establecer gravedad a 9.81`, `Aplicar fuerza impulso de N Newtons`).

---

## 4. TAREAS Y PASOS DE IMPLEMENTACIÓN (ROADMAP PARA EL IDE)

Por favor, genera el código modular para integrar este simulador siguiendo estos pasos:

### Paso 1: Componente de Lienzo 3D (`SimulatorCanvas.tsx`)
- Configurar la escena con `@react-three/fiber` o `@react-three/drei` (o contenedor iframe/WebGL de Unity si se compila en WebGL).
- Crear la retícula tridimensional (`Grid` / `Plane`) estilo VEX VR con textura o líneas vectoriales limpias.

### Paso 2: Integración del Motor de Física (`PhysicsWorld.tsx`)
- Configurar el mundo físico (`@react-three/cannon` o `@dimforge/rapier3d-compat`).
- Implementar el loop de simulación que recalcula las magnitudes físicas en cada frame y emite el estado al store global (`usePhysicsStore`).

### Paso 3: Inspector de Propiedades e Interfaz UI (`PhysicsInspector.tsx` & `TelemetryHUD.tsx`)
- Crear componentes UI responsivos usando Tailwind CSS para modificar masa, gravedad, fricción y observar métricas en tiempo real.

### Paso 4: Sistema de Exportación/Sincronización de Datos con FisioMathBot
- Conectar los eventos de prueba con la API REST existente de FisioMathBot para almacenar intentos, calcular el error relativo ($E_{exp}$ vs $E_{teorico}$) y evaluar el progreso del estudiante.

---

## 5. RESTRICCIONES Y ESTÁNDARES DE CÓDIGO

- **TypeScript Estricto:** Tipar todas las interfaces de propiedades físicas (`PhysicalObjectProps`, `WorldSettings`, `TelemetryData`).
- **Rendimiento:** Mantener el renderizado por encima de 60 FPS en navegadores convencionales.
- **Diseño Responsivo:** Adaptable a pantallas de equipos de cómputo institucional y dispositivos móviles.
- **Soberanía Tecnológica:** Priorizar bibliotecas de código abierto sin licencias cerradas.