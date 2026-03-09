# FISIOMATHBOT

Plataforma web educativa enfocada en áreas STEM para estudiantes de grados 9, 10 y 11.  
Actualmente el foco principal está en el diseño visual, la navegación y la experiencia de usuario; el contenido específico de los módulos se añadirá más adelante.

---

## Tecnologías principales

- **React + TypeScript**
- **React Router** para navegación entre vistas
- **CSS modular** (archivos por componente/página)
- **Bootstrap 5** (vía CDN) para grid, dropdowns y utilidades responsivas

---

## Estructura general del frontend

- `public/index.html`
  - Página base de la aplicación.
  - Incluye:
    - `<meta name="viewport" content="width=device-width, initial-scale=1" />` para diseño responsive.
    - CSS y JS de **Bootstrap 5** desde CDN.

- `src/index.tsx`
  - Punto de entrada de React.
  - Renderiza `App` en `#root`.
  - Importa estilos globales desde `src/styles/globals.css`.

- `src/App.tsx`
  - Define la navegación principal con `react-router-dom`:
    - `/` y `/dashboard` → `Dashboard` (pantalla principal).
    - `/physics` → `PhysicsPage`.
    - `/mathematics` → `MathematicsPage`.
    - `/technology` → `TechnologyPage`.
    - `/simulator` → `SimulatorPage`.
    - `/progress` → `ProgressPage` (pantalla dedicada al progreso).
  - Todas las rutas están envueltas por el layout principal `Layout`.

---

## Layout y componentes de estructura

### Layout principal (`src/components/Layout/Layout.tsx`)

Responsabilidades:
- Mostrar la barra lateral (`Sidebar`).
- Incluir el header superior (`Header`).
- Renderizar el contenido de cada página dentro de una tarjeta blanca central.
- Incluir el footer (`Footer`).

Detalles:
- El contenido se renderiza dentro de:
  - `<main className="content-wrapper" role="main">`
    - `<article className="main-view">` con `<Outlet />`.
- Se eliminó el `aside` fijo con `ProgressTracker` del layout global.  
  Ahora el panel de progreso solo aparece en la página `/progress`.

Estilos asociados (`src/components/Layout/Layout.css`):
- `.layout`:
  - `display: flex; min-height: 100vh; background-color: var(--light-gray); overflow-x: hidden;`.
  - `overflow-x: hidden` evita scroll horizontal no deseado.
- `.content-wrapper`:
  - Contenedor central con `max-width: 1200px; margin: 0 auto;`.
- `.main-view`:
  - Tarjeta blanca con borde redondeado y sombra suave.

### Sidebar (`src/components/Layout/Sidebar.tsx` / `.css`)

- Componente de navegación lateral implementado como:
  - `<nav className="sidebar ..." aria-label="Navegación principal de módulos">`
  - Lista `<ul>` con enlaces `NavLink` a cada módulo.
- Soporta modo abierto/cerrado vía `isOpen` y `onToggle` (controlados desde el header).
- Enlaces actuales:
  - Inicio, Física, Matemáticas, Tecnología, Simulador, Progreso, Perfil, Admin.

Mejoras recientes:
- Se eliminó el botón redondo interno de colapso (para evitar duplicar la funcionalidad con el botón de menú del header).
- Solo el botón de tres líneas en el header abre/cierra el sidebar.
- Estilo más minimalista:
  - Fondo blanco, texto gris y módulo activo en naranja (`var(--accent-orange)`).
  - Botones tipo píldora con mayor área clicable.
  - Comportamiento tipo panel fijo con sombra en móviles.

### Header (`src/components/Layout/header.tsx` / `.css`)

Funciones:
- Botón de menú (icono de tres líneas) que controla la apertura/cierre del sidebar.
- Formulario de búsqueda (`<form role="search">` con `input type="search"`).
- Botón de notificaciones con badge.
- Menú de usuario como dropdown de **Bootstrap** (Perfil, Configuración, Cerrar sesión).

Mejoras recientes:
- Aumento del área clicable (hitbox) de botones.
- Estados `hover` y `focus-visible` con feedback visual suave (fondos naranjas claros).
- El buscador es minimalista, con bordes redondeados tipo pill y sombras al enfocar.
- En móviles se oculta el buscador para ganar espacio.

### Footer (`src/components/Layout/Footer.tsx` / `.css`)

Estructura:
- `<footer className="footer">`
  - `<div className="footer-content container">` con tres secciones:
    - Información general de PGC OFI.
    - Lista de módulos.
    - Bloque de contacto.
  - `<div className="footer-bottom">` con el texto de derechos y un icono de corazón.

Mejoras recientes:
- Antes: footer oscuro y más pesado visualmente.
- Ahora:
  - Fondo blanco, borde superior gris suave, tipografía ligera.
  - Alineación de texto ordenada:
    - Izquierda en escritorio.
    - Centrado en móviles.

---

## Páginas principales

### Dashboard (`src/pages/Dashboard.tsx` / `.css`)

Responsabilidades:
- Pantalla de bienvenida al estudiante.
- Tarjetas de estadísticas (progreso total, logros, sesiones, lecciones).
- Grilla de módulos con barra de progreso y botón “Continuar”.

Estructura:
- `<section className="dashboard">`
  - `<header className="welcome-section">` con título y subtítulo.
  - `<section className="stats-cards">` → varias `<article className="stat-card">`.
  - `<section className="modules-section">`:
    - Cabecera con título “Tus módulos” y pequeños filtros visuales.
    - Grilla de `<article>` envueltos en un `Link` a cada módulo.

Estilos:
- Grids responsivos con `repeat(auto-fit, minmax(...))` para adaptar tarjetas y módulos.
- Tarjetas blancas con sombras suaves y animación ligera al hacer hover.

### Módulos de contenido

Los cuatro módulos principales (`PhysicsModule`, `MathematicsModule`, `TechnologyModule`, `SimulatorModule`) comparten una estructura visual común:

- Encabezado centrado:
  - Título tipo “Módulo de Física / Matemáticas / Tecnología / Simulador”.
  - Descripción corta del enfoque del módulo.
- `article` de introducción (`.module-intro`):
  - Tarjeta centrada que explica de forma general cómo usar el módulo y qué encontrará el estudiante.
- Zona inferior en dos columnas (`.module-content`):
  - Columna izquierda: lista de lecciones o simulaciones (botones) y acciones secundarias.
  - Columna derecha: caja de contenido interactivo (`Card` o área de simulación) donde se muestran explicaciones, ejemplos, gráficos o controles.

### Progreso (`src/pages/ProgressPage.tsx`)

Objetivo:
- Centralizar toda la información de progreso del estudiante.

Estructura:
- `<section aria-labelledby="progress-page-title">`
  - `<header>` con título “Tu progreso” y descripción corta.
  - Layout de dos columnas con utilidades de Bootstrap:
    - Columna principal (`col-12 col-lg-8`) para resumen/historial.
    - `aside` (`col-12 col-lg-4`) con el componente `ProgressTracker` dentro de una tarjeta blanca.

### Panel de progreso (`src/components/Layout/ProgressTracker.tsx` / `.css`)

- Muestra progreso general y por módulo (Física, Matemáticas, Tecnología, Simulador).
- Usa barras de progreso con diferentes colores.
- Actualmente **solo se utiliza** en la página `/progress`.

---

## Estilos globales y paleta

- Archivo: `src/styles/globals.css`
- Incluye:
  - Reset básico (`* { margin: 0; padding: 0; box-sizing: border-box; }`).
  - Variables de color:
    - Naranja principal: `--primary-blue` / `--accent-orange` (`#FD7B41`).
    - Otros acentos y grises (`--secondary-blue`, `--accent-green`, `--accent-purple`, `--light-gray`, `--medium-gray`, `--dark-gray`).
  - Estilos base para `body`, enlaces, botones y scrollbar personalizado.

---

## Resumen de cambios realizados (sesión actual)

1. Integración de **Bootstrap 5** en `public/index.html`.
2. Rediseño semántico y minimalista del **layout** y del **dashboard**.
3. Creación de la nueva página **`ProgressPage`** y uso exclusivo de `ProgressTracker` en esa ruta.
4. Mejora del **Header** (menú, buscador, dropdown de usuario, hitboxes).
5. Mejora del **Sidebar** (nav semántico, estilo limpio, eliminación del botón redondo).
6. Reestructuración del **Footer** (texto alineado, estilo ligero, responsive).
7. Ajustes de responsividad y eliminación de overflow horizontal.

---

## Cómo seguir documentando cambios

Para futuras sesiones se recomienda:

- Añadir nuevas secciones al final de este archivo bajo un bloque como:
  - `## Historial de cambios`  
  - `### YYYY-MM-DD` seguido de una lista de cambios.
- Mantener la documentación en **español** y enfocada tanto en la intención del cambio (por qué) como en la ubicación del código (dónde).

