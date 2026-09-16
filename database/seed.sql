-- =====================================================================
-- FISIOMATHBOT — Datos de ejemplo (seed)
-- =====================================================================
-- Ejecutar DESPUÉS de schema.sql. Reproduce los usuarios y módulos que
-- hoy están simulados en el frontend (frontend/src/data/users.ts y
-- frontend/src/pages/AdminPanel.tsx) para poder probar los tres roles.
--
-- NOTA SOBRE CONTRASEÑAS:
-- Los hashes de abajo corresponden a la contraseña "Password123" cifrada
-- con bcrypt (10 rounds). Cámbialos antes de usar en producción real.
-- Puedes generar los tuyos con: backend -> node src/scripts/hashPassword.js
-- =====================================================================

USE fisiomathbot;

-- ---------------------------------------------------------------------
-- Instituciones
-- ---------------------------------------------------------------------
INSERT INTO institutions (id, name, city) VALUES
  (1, 'Instituto Educativo Fisiomathbot', 'Bogotá'),
  (2, 'Colegio Nacional de Ciencias', 'Medellín');

-- ---------------------------------------------------------------------
-- Usuarios (1 de cada rol + usuarios de ejemplo del panel admin)
-- Password para todos: Password123
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, grade, institution_id, status) VALUES
  (1, 'Estudiante Demo',      'estudiante@fisiomatbot.com', '$2a$10$cLX9luIek.PNrGtOxJmk2.zubIQ75nx2KWbBXE3SZ7PxzqDJ4DAEi', 'student', 10, 1, 'active'),
  (2, 'Profesor Demo',        'profesor@fisiomatbot.com',   '$2a$10$cLX9luIek.PNrGtOxJmk2.zubIQ75nx2KWbBXE3SZ7PxzqDJ4DAEi', 'teacher', NULL, 1, 'active'),
  (3, 'Administrador Demo',   'admin@fisiomatbot.com',      '$2a$10$cLX9luIek.PNrGtOxJmk2.zubIQ75nx2KWbBXE3SZ7PxzqDJ4DAEi', 'admin',   NULL, NULL, 'active'),
  (4, 'María López',          'maria.lopez@fisiomatbot.com','$2a$10$cLX9luIek.PNrGtOxJmk2.zubIQ75nx2KWbBXE3SZ7PxzqDJ4DAEi', 'student', 9,  1, 'active'),
  (5, 'Juan Pérez',           'juan.perez@fisiomatbot.com', '$2a$10$cLX9luIek.PNrGtOxJmk2.zubIQ75nx2KWbBXE3SZ7PxzqDJ4DAEi', 'student', 10, 1, 'active'),
  (6, 'Camila Ríos',          'camila.rios@fisiomatbot.com','$2a$10$cLX9luIek.PNrGtOxJmk2.zubIQ75nx2KWbBXE3SZ7PxzqDJ4DAEi', 'student', 11, 2, 'inactive'),
  (7, 'Ana Torres',           'ana.torres@fisiomatbot.com', '$2a$10$cLX9luIek.PNrGtOxJmk2.zubIQ75nx2KWbBXE3SZ7PxzqDJ4DAEi', 'teacher', NULL, 2, 'active');

-- ---------------------------------------------------------------------
-- Grupo de ejemplo administrado por el profesor demo
-- ---------------------------------------------------------------------
INSERT INTO groups (id, institution_id, teacher_id, name, grade, school_year) VALUES
  (1, 1, 2, '10-A', 10, '2025-2026');

INSERT INTO group_members (group_id, student_id) VALUES
  (1, 1),
  (1, 4),
  (1, 5);

-- ---------------------------------------------------------------------
-- Módulos (coinciden con ModuleType del frontend)
-- ---------------------------------------------------------------------
INSERT INTO modules (id, code, title, description, color, icon, display_order) VALUES
  (1, 'physics',     'Física',        'Explora las leyes que rigen el movimiento, la energía y la materia.', '#FD7B41', 'physics',     1),
  (2, 'mathematics', 'Matemáticas',   'Fortalece álgebra, geometría y cálculo con ejercicios guiados.',       '#2E86AB', 'mathematics', 2),
  (3, 'technology',  'Tecnología',    'Aprende lógica de programación y fundamentos de tecnología.',          '#6C63FF', 'technology',  3),
  (4, 'simulator',   'Simulador',     'Simulaciones interactivas para experimentar con los conceptos.',       '#2ECC71', 'simulator',   4);

-- ---------------------------------------------------------------------
-- Secciones (lecciones) de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO sections (id, module_id, title, content, display_order, created_by) VALUES
  (1, 1, 'Introducción a la cinemática', 'Contenido de la lección de cinemática...', 1, 2),
  (2, 1, 'Leyes de Newton',              'Contenido de la lección de leyes de Newton...', 2, 2),
  (3, 2, 'Ecuaciones lineales',          'Contenido de la lección de ecuaciones lineales...', 1, 2),
  (4, 3, 'Fundamentos de programación',  'Contenido de la lección de programación...', 1, 2);

-- ---------------------------------------------------------------------
-- Quizzes + opciones de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO quizzes (id, module_id, section_id, question, explanation, difficulty, created_by) VALUES
  (1, 1, 1, '¿Cuál es la unidad de medida de la velocidad en el SI?', 'La velocidad se mide en metros sobre segundo (m/s).', 'easy', 2),
  (2, 2, 3, '¿Cuál es la solución de 2x + 4 = 10?', 'Despejando x: 2x = 6, por lo tanto x = 3.', 'medium', 2);

INSERT INTO quiz_options (quiz_id, option_text, is_correct, display_order) VALUES
  (1, 'm/s',  TRUE,  1),
  (1, 'km/h', FALSE, 2),
  (1, 'N',    FALSE, 3),
  (1, 'J',    FALSE, 4),
  (2, 'x = 2', FALSE, 1),
  (2, 'x = 3', TRUE,  2),
  (2, 'x = 4', FALSE, 3),
  (2, 'x = 6', FALSE, 4);

-- ---------------------------------------------------------------------
-- Simulaciones de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO simulations (id, module_id, title, description, type, display_order) VALUES
  (1, 4, 'Tiro parabólico', 'Simula la trayectoria de un proyectil variando ángulo y velocidad.', 'physics', 1),
  (2, 4, 'Funciones cuadráticas', 'Visualiza cómo cambian los coeficientes de una parábola.', 'math', 2);

-- ---------------------------------------------------------------------
-- Logros (catálogo)
-- ---------------------------------------------------------------------
INSERT INTO achievements (id, code, title, description, icon, points) VALUES
  (1, 'FIRST_LOGIN',      'Primer ingreso',        'Iniciaste sesión por primera vez en la plataforma.', 'FaCircleCheck', 10),
  (2, 'FIRST_LESSON',     'Primera lección',       'Completaste tu primera lección.',                    'FaBookOpen',    20),
  (3, 'QUIZ_MASTER',      'Maestro del quiz',      'Respondiste correctamente 10 preguntas.',            'FaBolt',        50),
  (4, 'MODULE_COMPLETE',  'Módulo completado',     'Terminaste el 100% de un módulo.',                   'FaGraduationCap', 100);

-- ---------------------------------------------------------------------
-- Progreso de ejemplo para el estudiante demo (id = 1)
-- ---------------------------------------------------------------------
INSERT INTO user_module_progress (user_id, module_id, overall_progress, last_activity_at) VALUES
  (1, 1, 65.00, NOW()),
  (1, 2, 40.00, NOW()),
  (1, 3, 10.00, NOW()),
  (1, 4, 0.00,  NULL);

INSERT INTO user_section_progress (user_id, section_id, completed, completed_at) VALUES
  (1, 1, TRUE, NOW()),
  (1, 2, FALSE, NULL),
  (1, 3, TRUE, NOW());

INSERT INTO quiz_attempts (user_id, quiz_id, selected_option_id, is_correct, score) VALUES
  (1, 1, 1, TRUE, 10),
  (1, 2, 6, TRUE, 10);

INSERT INTO user_achievements (user_id, achievement_id) VALUES
  (1, 1),
  (1, 2);

-- ---------------------------------------------------------------------
-- Notificaciones de ejemplo
-- ---------------------------------------------------------------------
INSERT INTO notifications (user_id, title, message, kind, is_read) VALUES
  (1, 'Bienvenido a FISIOMATHBOT', 'Explora tus módulos y empieza a aprender.', 'info', FALSE),
  (1, 'Logro desbloqueado', 'Obtuviste el logro "Primera lección".', 'success', FALSE);
