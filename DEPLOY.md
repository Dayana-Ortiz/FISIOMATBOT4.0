# Guía de despliegue — Base de datos y backend de FISIOMATHBOT

Este documento explica cómo ejecutar el modelo de base de datos y el backend en:

1. **Local, con XAMPP** (para desarrollo y pruebas).
2. **Railway** (para producción / demo en la nube).
3. Cómo **enlazar el frontend** (React + Vite) con esa base de datos a través del backend.

Archivos relacionados:
- [`database/schema.sql`](database/schema.sql) — estructura de tablas (DDL).
- [`database/seed.sql`](database/seed.sql) — datos de ejemplo.
- [`database/MODELO_RELACIONAL.md`](database/MODELO_RELACIONAL.md) — documentación completa del modelo.
- [`backend/`](backend) — API REST en Node.js/Express que conecta con la base de datos.

---

## 1. Desarrollo local con XAMPP

1. Instala/abre **XAMPP** y arranca los módulos **Apache** y **MySQL** desde el panel
   de control.
2. Abre `http://localhost/phpmyadmin`.
3. Ve a la pestaña **"Importar"** (no hace falta crear la base de datos antes: el
   script la crea con `CREATE DATABASE IF NOT EXISTS fisiomathbot`).
4. Selecciona el archivo [`database/schema.sql`](database/schema.sql) y pulsa
   **"Continuar"**. Esto crea la base `fisiomathbot` con las 18 tablas y las 3 vistas.
5. Repite el paso de importar con [`database/seed.sql`](database/seed.sql) si quieres
   datos de ejemplo (usuarios demo, módulos, quizzes, progreso).
6. Anota las credenciales de tu MySQL de XAMPP (por defecto: usuario `root`, sin
   contraseña, puerto `3306`).

> **Nota de compatibilidad:** los `CHECK` constraints (por ejemplo, que `grade` solo
> sea 9, 10 u 11) requieren MySQL 8.0.16+ o MariaDB 10.2+. Las versiones de MySQL que
> trae XAMPP por defecto ya cumplen esto. Si usas una versión más antigua, los `CHECK`
> se ignoran silenciosamente (no rompen la importación), y esa validación quedaría
> solo a cargo del backend.

### Backend apuntando a XAMPP

```bash
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=fisiomathbot
JWT_SECRET=una-clave-larga-y-aleatoria
CORS_ORIGIN=http://localhost:5173
```

```bash
npm run dev
```

Deberías ver en consola: `Conexión a MySQL verificada correctamente.` y
`API de FISIOMATHBOT escuchando en el puerto 4000`.

### Frontend apuntando al backend local

```bash
cd frontend
cp .env.example .env
```

Edita `frontend/.env`:

```
VITE_API_URL=http://localhost:4000/api
```

```bash
npm run dev
```

---

## 2. Despliegue en Railway (producción)

Railway permite tener, dentro de un mismo proyecto, un **plugin de MySQL** y tus
**servicios** (backend, y opcionalmente frontend) conectados entre sí por variables de
entorno.

### Paso 1 — Crear el proyecto y la base de datos

1. Entra a [railway.app](https://railway.app) e inicia sesión (puedes usar tu cuenta
   de GitHub).
2. **New Project → Provision MySQL**. Railway crea una instancia de MySQL y genera
   automáticamente las variables `MYSQL_URL`, `MYSQLHOST`, `MYSQLUSER`,
   `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`.
3. Abre la pestaña **"Data"** del plugin de MySQL: ahí puedes ejecutar una consulta
   SQL directamente (útil si quieres pegar `schema.sql` sin salir del navegador), o
   copiar la cadena de conexión pública (`MYSQL_PUBLIC_URL`) para conectarte con un
   cliente externo (MySQL Workbench, DBeaver, TablePlus, etc.) y ahí importar los
   archivos `schema.sql` y `seed.sql`.

### Paso 2 — Desplegar el backend

1. En el mismo proyecto de Railway: **New → GitHub Repo** y selecciona este
   repositorio (o **Empty Service** + `railway up` desde tu máquina si prefieres CLI).
2. En **Settings → Root Directory**, configura `backend` (para que Railway construya
   solo esa carpeta del monorepo).
3. En **Settings → Build/Start**:
   - Build command: `npm install`
   - Start command: `npm start`
4. En **Variables**, añade:
   - `DATABASE_URL` → pega el valor de `MYSQL_URL` que generó el plugin (Railway te
     deja "referenciar" la variable de otro servicio con el botón "Add Reference",
     así no la copias a mano y queda sincronizada si cambia).
   - `JWT_SECRET` → una cadena larga y aleatoria.
   - `CORS_ORIGIN` → la URL pública de tu frontend (Railway o Vercel/Netlify).
   - `PORT` → Railway ya inyecta su propio `PORT`; no hace falta que lo definas tú
     (el código ya usa `process.env.PORT`).
5. Antes del primer arranque (o vía **Railway CLI**, `railway run npm run migrate -- --seed`),
   ejecuta la migración para crear las tablas en la base de datos de Railway:

   ```bash
   # Desde tu máquina, con las variables de Railway cargadas:
   railway run --service backend npm run migrate -- --seed
   ```

   O simplemente pega el contenido de `schema.sql` (y `seed.sql`) en la pestaña
   **"Data"** del plugin de MySQL en la web de Railway.
6. Railway asigna una URL pública tipo `https://tu-backend.up.railway.app`. Verifica
   con `https://tu-backend.up.railway.app/api/health`.

### Paso 3 — Desplegar el frontend

Puedes desplegar el frontend como otro servicio dentro del mismo proyecto de Railway,
o en Vercel/Netlify (cualquiera sirve, solo es un sitio estático generado por Vite).

Si usas Railway:
1. **New → GitHub Repo** (mismo repo) → **Root Directory**: `frontend`.
2. Build command: `npm install && npm run build`.
3. Start command: usa un servidor estático, por ejemplo `npx serve -s dist -l $PORT`
   (agrega `serve` a `frontend/package.json` con `npm install -D serve`, o usa el
   plugin "Static Site" de Railway si está disponible).
4. Variable de entorno: `VITE_API_URL=https://tu-backend.up.railway.app/api`.

### Paso 4 — Confirmar el enlace end-to-end

1. Abre la URL pública del frontend.
2. Al iniciar sesión, la petición debe llegar a `VITE_API_URL/auth/login`, que a su
   vez consulta la tabla `users` en el MySQL de Railway (ver sección 4 para el
   detalle de cómo quedó conectado `Login.tsx`/`Register.tsx`).

---

## 3. Dónde enlazar el proyecto con la base de datos

El frontend **nunca** habla directo con MySQL (eso sería inseguro: expondría
credenciales en el navegador). El flujo real es:

```
Frontend (React)  --HTTP/JSON-->  Backend (Express)  --SQL-->  MySQL
```

Puntos de enlace ya preparados en este repo:

| Archivo | Qué hace | Qué falta para "encenderlo" |
|---|---|---|
| `frontend/src/services/api.ts` | Cliente HTTP base (usa `VITE_API_URL` + guarda el token JWT) | Nada, ya está listo |
| `frontend/src/services/authService.ts` | `login`, `register`, `logout`, `fetchCurrentUser` reales | ✅ Ya conectado: `Login.tsx` y `Register.tsx` llaman al backend (ver sección 4) |
| `frontend/src/services/contentService.ts` | Trae módulos/secciones/quizzes/simulaciones reales | Llamarlo desde `PhysicsPage.tsx`, `MathematicsPage.tsx`, etc. en vez de `frontend/src/data/modules.ts` |
| `frontend/src/services/progressService.ts` | Lee/actualiza progreso real | Llamarlo desde `ProgressContext`/`ProgressPage.tsx`/`ProfilePage.tsx` |
| `backend/src/routes/index.js` | Todos los endpoints disponibles | Ampliar con más endpoints a medida que se conecten más pantallas |

**Recomendación de migración incremental:** el login/registro ya quedó conectado al
backend real (bcrypt + JWT, sin credenciales mock). Sigue con `contentService`
(listar módulos reales en el Dashboard), y por último `progressService` y el panel de
administración (`adminController.js` ya tiene los endpoints que usa
`AdminPanel.tsx`: listar usuarios, cambiar rol, activar/desactivar, instituciones).

## 4. Login/Registro reales con XAMPP (sin credenciales "cualquiera")

Antes, `Login.tsx` aceptaba cualquier correo/contraseña (usaba un mock,
`frontend/src/data/users.ts`, ya eliminado). Ahora valida contra la tabla `users` de
MySQL con bcrypt + JWT. Pasos para dejarlo funcionando en tu XAMPP local:

1. **Importa el esquema** (si no lo has hecho): en phpMyAdmin, importa
   `database/schema.sql`. Si quieres partir con usuarios de prueba, importa también
   `database/seed.sql` (crea `estudiante@fisiomatbot.com`, `profesor@fisiomatbot.com`
   y `admin@fisiomatbot.com`, los tres con contraseña `Password123`).

2. **Configura y levanta el backend:**

   ```bash
   cd backend
   npm install
   cp .env.example .env   # ajusta DB_USER/DB_PASSWORD si tu XAMPP los tiene distintos
   npm run dev
   ```

   Confirma que responde: `http://localhost:4000/api/health` → `{"status":"ok"}`.

3. **Configura el frontend** para apuntar a ese backend:

   ```bash
   cd frontend
   cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
   npm run dev
   ```

4. **Prueba el flujo real:**
   - `/register` crea una fila real en `users` (rol `student` siempre; el backend no
     deja auto-asignarse `teacher`/`admin` desde el formulario público, por diseño).
   - `/login` ahora solo entra si el correo existe, la cuenta está `active` y la
     contraseña coincide con el hash bcrypt guardado. Cualquier otra combinación
     devuelve el error real que manda el backend ("Credenciales inválidas",
     "Ya existe una cuenta con ese correo", etc.), ya no hay usuario "invitado" de
     respaldo.

5. **Cómo crear un profesor o administrador** (el registro público solo crea
   estudiantes, a propósito — igual que roles reales en cualquier plataforma: nadie
   debería poder autoasignarse permisos de administrador llenando un formulario):
   - **Opción rápida (arranque en frío):** usa las cuentas de `seed.sql`
     (`profesor@fisiomatbot.com`, `admin@fisiomatbot.com`, password `Password123`)
     para tener ya un admin con el que entrar.
   - **Opción UI (recomendada una vez tengas un admin):** inicia sesión con esa
     cuenta admin → menú lateral **"Admin"** (`/admin`) → tabla "Usuarios de la
     plataforma" → cambia el valor del selector de rol de cualquier usuario
     registrado. Esto ya llama a `PATCH /api/admin/users/:id/role` y queda guardado
     en MySQL (antes solo actualizaba un mock en memoria; ya no).
   - **Opción manual (sin admin todavía):** genera un hash con
     `cd backend && npm run hash-password -- "laContraseñaQueQuieras"` y luego, en
     phpMyAdmin, inserta o edita la fila en `users` poniendo ese hash en
     `password_hash` y `teacher`/`admin` en `role`.

   El botón "Activar/Desactivar" de esa misma tabla también quedó conectado a
   `PATCH /api/admin/users/:id/status` (disponible para `teacher` y `admin`); solo el
   cambio de rol está restringido a `admin`, igual que en el backend.

6. **Cerrar sesión** ahora también invalida la sesión del lado del cliente: el botón
   "Cerrar sesión" del header borra tanto el usuario (`UserContext`) como el token JWT
   guardado (`localStorage: fmb_token`).

---

## 5. Comandos de referencia rápida

```bash
# Backend
cd backend
npm install
npm run migrate            # crea tablas
npm run migrate -- --seed  # crea tablas + datos de ejemplo
npm run dev                # desarrollo (nodemon)
npm start                  # producción

# Generar un hash bcrypt para crear un usuario manualmente
npm run hash-password -- "miContraseñaSegura"

# Frontend
cd frontend
npm install
npm run dev
npm run build
```
