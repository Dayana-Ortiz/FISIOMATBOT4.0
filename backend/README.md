# FISIOMATHBOT — Backend (API REST)

API en Node.js + Express + MySQL (`mysql2`) que implementa el modelo relacional
documentado en [`../database/MODELO_RELACIONAL.md`](../database/MODELO_RELACIONAL.md).

## Requisitos

- Node.js 18+
- Una base de datos MySQL accesible (XAMPP en local, o el plugin MySQL de Railway).

## Puesta en marcha local

```bash
cd backend
npm install
cp .env.example .env      # y completa tus credenciales de MySQL
npm run migrate           # crea las tablas (schema.sql)
npm run migrate -- --seed # (opcional) además carga datos de ejemplo (seed.sql)
npm run dev                # levanta la API en http://localhost:4000
```

Verifica que quedó arriba:

```bash
curl http://localhost:4000/api/health
```

## Variables de entorno (`.env`)

Ver [`.env.example`](.env.example). Lo esencial:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: conexión a MySQL en
  local/XAMPP. En Railway se reemplazan por una sola `DATABASE_URL`.
- `JWT_SECRET`: clave para firmar los tokens de sesión (cámbiala en producción).
- `CORS_ORIGIN`: URL(s) del frontend permitidas para hacer peticiones a la API.

## Estructura

```
backend/
  src/
    config/db.js          -> pool de conexión MySQL
    middleware/auth.js     -> verificación de JWT y de rol
    controllers/           -> lógica de cada recurso (auth, módulos, progreso, admin, notificaciones)
    routes/index.js        -> mapeo de endpoints /api/...
    scripts/migrate.js     -> ejecuta database/schema.sql (+ seed.sql opcional)
    scripts/hashPassword.js-> genera un hash bcrypt para crear usuarios manualmente
    app.js                 -> configuración de Express (cors, json, rutas, errores)
    server.js               -> punto de entrada (arranca el servidor HTTP)
```

## Endpoints principales

| Método | Ruta | Rol requerido | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | público | Crea una cuenta de estudiante |
| POST | `/api/auth/login` | público | Inicia sesión, devuelve `{ token, user }` |
| GET | `/api/auth/me` | autenticado | Devuelve el usuario del token actual |
| GET | `/api/modules` | autenticado | Lista los 4 módulos |
| GET | `/api/modules/:code` | autenticado | Detalle: secciones, quizzes (con opciones), simulaciones |
| GET | `/api/progress/me` | autenticado | Progreso por módulo + estadísticas de perfil |
| POST | `/api/progress/sections/:sectionId/complete` | autenticado | Marca una lección como completada |
| PUT | `/api/progress/modules/:moduleId` | autenticado | Actualiza el % de avance de un módulo |
| POST | `/api/progress/quizzes/:quizId/attempt` | autenticado | Registra la respuesta a un quiz |
| GET | `/api/notifications/me` | autenticado | Últimas notificaciones del usuario |
| POST | `/api/notifications/me/read-all` | autenticado | Marca todas como leídas |
| GET | `/api/admin/users` | teacher/admin | Lista usuarios (para `AdminPanel.tsx`) |
| GET | `/api/admin/stats` | teacher/admin | Conteos por rol/estado |
| PATCH | `/api/admin/users/:id/role` | admin | Cambia el rol de un usuario |
| PATCH | `/api/admin/users/:id/status` | teacher/admin | Activa/desactiva una cuenta |
| GET/POST | `/api/admin/institutions` | admin | Lista / crea instituciones |

Todas las rutas autenticadas requieren el header `Authorization: Bearer <token>`
obtenido en `/api/auth/login`.

## Notas de diseño

- Este backend es un **punto de partida funcional**, no la implementación final de
  cada regla de negocio del frontend. Su objetivo es demostrar que el modelo
  relacional compila, conecta y responde con datos reales, y dejar la estructura
  (controladores/rutas/middleware) lista para ampliarse pantalla por pantalla.
- Las contraseñas se guardan con `bcryptjs` (nunca en texto plano).
- La autorización por rol se hace con `requireRole('teacher','admin')`, reflejando
  la tabla de permisos de `database/MODELO_RELACIONAL.md`.
