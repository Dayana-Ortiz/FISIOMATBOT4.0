-- =====================================================================
-- FISIOMATHBOT — Esquema relacional (MySQL 8.0+)
-- =====================================================================
-- Motor: InnoDB (soporte de llaves foráneas y transacciones)
-- Codificación: utf8mb4 (soporta tildes, ñ y emojis usados en la UI)
--
-- Cómo ejecutar este archivo:
--   - XAMPP / phpMyAdmin: pestaña "Importar" -> seleccionar este archivo.
--   - MySQL CLI:  mysql -u usuario -p nombre_bd < schema.sql
--   - Railway:    ver database/MODELO_RELACIONAL.md, sección "Despliegue en Railway".
--
-- Orden de las tablas: de "padres" (catálogos) a "hijos" (dependientes),
-- para que las llaves foráneas se puedan crear sin errores.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS fisiomathbot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fisiomathbot;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. INSTITUTIONS — colegios / instituciones educativas
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS institutions;
CREATE TABLE institutions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  city          VARCHAR(100) NULL,
  address       VARCHAR(200) NULL,
  phone         VARCHAR(30)  NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_institutions_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. USERS — estudiantes, profesores y administradores (superusuario)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,          -- bcrypt hash, nunca texto plano
  role            ENUM('student','teacher','admin') NOT NULL DEFAULT 'student',
  grade           TINYINT UNSIGNED NULL,           -- 9, 10 u 11 (solo aplica a role='student')
  institution_id  INT UNSIGNED NULL,
  avatar_url      VARCHAR(255) NULL,
  bio             TEXT NULL,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at   DATETIME NULL,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_institution
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_users_grade CHECK (grade IS NULL OR grade IN (9,10,11))
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_institution ON users(institution_id);

-- ---------------------------------------------------------------------
-- 3. GROUPS — grupos/cursos que un profesor administra (p.ej. "10-A")
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS groups;
CREATE TABLE groups (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id  INT UNSIGNED NULL,
  teacher_id      INT UNSIGNED NOT NULL,
  name            VARCHAR(100) NOT NULL,           -- "10-A", "Física 9°"...
  grade           TINYINT UNSIGNED NULL,
  school_year     VARCHAR(9) NULL,                 -- "2025-2026"
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_groups_institution
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_groups_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_groups_grade CHECK (grade IS NULL OR grade IN (9,10,11))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. GROUP_MEMBERS — estudiantes matriculados en un grupo (N:M)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members (
  group_id    INT UNSIGNED NOT NULL,
  student_id  INT UNSIGNED NOT NULL,
  joined_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, student_id),
  CONSTRAINT fk_gm_group
    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_gm_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. MODULES — Física, Matemáticas, Tecnología, Simulador
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS modules;
CREATE TABLE modules (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code           ENUM('physics','mathematics','technology','simulator') NOT NULL,
  title          VARCHAR(100) NOT NULL,
  description    TEXT NULL,
  color          VARCHAR(7) NULL,        -- código hex, p.ej. #FD7B41
  icon           VARCHAR(50) NULL,
  display_order  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_modules_code (code)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. SECTIONS — lecciones/secciones de contenido dentro de un módulo
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS sections;
CREATE TABLE sections (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module_id      INT UNSIGNED NOT NULL,
  title          VARCHAR(150) NOT NULL,
  content        MEDIUMTEXT NULL,        -- texto/HTML de la lección
  display_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_by     INT UNSIGNED NULL,      -- profesor/admin autor
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sections_module
    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sections_author
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_sections_module ON sections(module_id);

-- ---------------------------------------------------------------------
-- 7. QUIZZES — preguntas de evaluación dentro de un módulo/sección
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS quizzes;
CREATE TABLE quizzes (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module_id      INT UNSIGNED NOT NULL,
  section_id     INT UNSIGNED NULL,
  question       TEXT NOT NULL,
  explanation    TEXT NULL,
  difficulty     ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  display_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_by     INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quizzes_module
    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_quizzes_section
    FOREIGN KEY (section_id) REFERENCES sections(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_quizzes_author
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_quizzes_module ON quizzes(module_id);

-- ---------------------------------------------------------------------
-- 8. QUIZ_OPTIONS — opciones de respuesta de cada quiz (normaliza el
--    arreglo `options[]` + `correctAnswer` del frontend)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS quiz_options;
CREATE TABLE quiz_options (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quiz_id        INT UNSIGNED NOT NULL,
  option_text    VARCHAR(500) NOT NULL,
  is_correct     BOOLEAN NOT NULL DEFAULT FALSE,
  display_order  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_options_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_options_quiz ON quiz_options(quiz_id);

-- ---------------------------------------------------------------------
-- 9. SIMULATIONS — simulaciones interactivas por módulo
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS simulations;
CREATE TABLE simulations (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module_id      INT UNSIGNED NOT NULL,
  title          VARCHAR(150) NOT NULL,
  description    TEXT NULL,
  type           ENUM('physics','math','tech') NOT NULL,
  config_json    JSON NULL,               -- parámetros/config del simulador
  display_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_simulations_module
    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_simulations_module ON simulations(module_id);

-- ---------------------------------------------------------------------
-- 10. USER_MODULE_PROGRESS — avance general del usuario por módulo
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS user_module_progress;
CREATE TABLE user_module_progress (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id            INT UNSIGNED NOT NULL,
  module_id          INT UNSIGNED NOT NULL,
  overall_progress   DECIMAL(5,2) NOT NULL DEFAULT 0.00,  -- 0.00 a 100.00
  last_activity_at   DATETIME NULL,
  UNIQUE KEY uq_user_module (user_id, module_id),
  CONSTRAINT fk_ump_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ump_module
    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_ump_progress CHECK (overall_progress BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. USER_SECTION_PROGRESS — secciones/lecciones completadas
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS user_section_progress;
CREATE TABLE user_section_progress (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  section_id     INT UNSIGNED NOT NULL,
  completed      BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   DATETIME NULL,
  UNIQUE KEY uq_user_section (user_id, section_id),
  CONSTRAINT fk_usp_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_usp_section
    FOREIGN KEY (section_id) REFERENCES sections(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. QUIZ_ATTEMPTS — intentos/respuestas de un usuario a un quiz
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS quiz_attempts;
CREATE TABLE quiz_attempts (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  quiz_id             INT UNSIGNED NOT NULL,
  selected_option_id  INT UNSIGNED NULL,
  is_correct          BOOLEAN NOT NULL DEFAULT FALSE,
  score               SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  attempted_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_qa_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qa_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_qa_option
    FOREIGN KEY (selected_option_id) REFERENCES quiz_options(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_qa_user_quiz ON quiz_attempts(user_id, quiz_id);

-- ---------------------------------------------------------------------
-- 13. SIMULATION_ATTEMPTS — intentos de un usuario en una simulación
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS simulation_attempts;
CREATE TABLE simulation_attempts (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  simulation_id   INT UNSIGNED NOT NULL,
  result_json     JSON NULL,
  score           SMALLINT UNSIGNED NULL,
  attempted_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sa_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sa_simulation
    FOREIGN KEY (simulation_id) REFERENCES simulations(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_sa_user_sim ON simulation_attempts(user_id, simulation_id);

-- ---------------------------------------------------------------------
-- 14. ACHIEVEMENTS — catálogo de logros/medallas
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS achievements;
CREATE TABLE achievements (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(50) NOT NULL,
  title          VARCHAR(100) NOT NULL,
  description    VARCHAR(255) NULL,
  icon           VARCHAR(50) NULL,
  points         INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_achievements_code (code)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 15. USER_ACHIEVEMENTS — logros obtenidos por cada usuario (N:M)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS user_achievements;
CREATE TABLE user_achievements (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  achievement_id   INT UNSIGNED NOT NULL,
  earned_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_achievement (user_id, achievement_id),
  CONSTRAINT fk_ua_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ua_achievement
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 16. NOTIFICATIONS — notificaciones internas (campana del header)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(150) NOT NULL,
  message     VARCHAR(500) NOT NULL,
  kind        ENUM('info','success','warning') NOT NULL DEFAULT 'info',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ---------------------------------------------------------------------
-- 17. PASSWORD_RESET_TOKENS — flujo de "olvidé mi contraseña"
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS password_reset_tokens;
CREATE TABLE password_reset_tokens (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  token_hash    VARCHAR(255) NOT NULL,
  expires_at    DATETIME NOT NULL,
  used_at       DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prt_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 18. AUDIT_LOGS — trazabilidad de acciones administrativas
--     (cambios de rol, activar/desactivar cuentas, gestión de instituciones)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id         INT UNSIGNED NULL,      -- quién ejecuta la acción (admin/profesor)
  action           VARCHAR(100) NOT NULL,  -- 'ROLE_CHANGE', 'STATUS_TOGGLE', 'INSTITUTION_UPDATE', ...
  target_user_id   INT UNSIGNED NULL,      -- sobre quién se ejecuta (si aplica)
  details_json     JSON NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor
    FOREIGN KEY (actor_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_audit_target
    FOREIGN KEY (target_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- VISTAS — agregados listos para las pantallas del frontend
-- =====================================================================

-- Estadísticas de perfil (ProfilePage.tsx: lecciones completadas,
-- puntos totales y logros).
CREATE OR REPLACE VIEW v_user_profile_stats AS
SELECT
  u.id AS user_id,
  COALESCE(sp.completed_lessons, 0)   AS completed_lessons,
  COALESCE(qa.quiz_points, 0) + COALESCE(sa.sim_points, 0) AS total_score,
  COALESCE(ach.achievements_count, 0) AS achievements_count
FROM users u
LEFT JOIN (
  SELECT user_id, COUNT(*) AS completed_lessons
  FROM user_section_progress
  WHERE completed = TRUE
  GROUP BY user_id
) sp ON sp.user_id = u.id
LEFT JOIN (
  SELECT user_id, SUM(score) AS quiz_points
  FROM quiz_attempts
  GROUP BY user_id
) qa ON qa.user_id = u.id
LEFT JOIN (
  SELECT user_id, SUM(score) AS sim_points
  FROM simulation_attempts
  GROUP BY user_id
) sa ON sa.user_id = u.id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS achievements_count
  FROM user_achievements
  GROUP BY user_id
) ach ON ach.user_id = u.id;

-- Resumen de progreso por módulo (Dashboard.tsx / ProgressTracker.tsx)
CREATE OR REPLACE VIEW v_user_module_progress_summary AS
SELECT
  ump.user_id,
  m.code AS module_code,
  m.title AS module_title,
  ump.overall_progress,
  ump.last_activity_at
FROM user_module_progress ump
JOIN modules m ON m.id = ump.module_id;

-- Resumen para AdminPanel.tsx (conteo de usuarios por rol y estado)
CREATE OR REPLACE VIEW v_admin_user_stats AS
SELECT
  SUM(role = 'student') AS students,
  SUM(role = 'teacher') AS teachers,
  SUM(role = 'admin')   AS admins,
  SUM(status = 'active') AS active
FROM users;
