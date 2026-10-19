-- FisioMathBot: catálogo de lecciones y actividades que cuentan para el progreso.
-- Cada fila corresponde a una lección del frontend (components/Modules/*Module.tsx) por su
-- lesson_key, más el quiz de cada módulo y la exploración del simulador.
-- El progreso de un módulo = actividades completadas / actividades con lesson_key del módulo.
-- Se puede ejecutar varias veces: actualiza en lugar de duplicar.
-- Requiere la columna sections.lesson_key (schema.sql o `npm run migrate -- --upgrade`).

-- Los módulos normalmente vienen de seed.sql; se aseguran por si no se cargaron los datos de ejemplo.
INSERT IGNORE INTO modules (code, title, description, color, icon, display_order) VALUES
  ('physics',     'Física',      'Explora las leyes que rigen el movimiento, la energía y la materia.', '#FD7B41', 'physics',     1),
  ('mathematics', 'Matemáticas', 'Fortalece álgebra, geometría y cálculo con ejercicios guiados.',       '#2E86AB', 'mathematics', 2),
  ('technology',  'Tecnología',  'Aprende lógica de programación y fundamentos de tecnología.',          '#6C63FF', 'technology',  3),
  ('simulator',   'Simulador',   'Simulaciones interactivas para experimentar con los conceptos.',       '#2ECC71', 'simulator',   4);

INSERT INTO sections (module_id, lesson_key, title, display_order)
SELECT m.id, l.lesson_key, l.title, l.display_order
FROM modules m
JOIN (
  SELECT 'physics' AS code, 'intro' AS lesson_key, 'Introducción a la Ciencia' AS title, 1 AS display_order
  UNION ALL SELECT 'physics',     'movement',    'Movimiento Rectilíneo',      2
  UNION ALL SELECT 'physics',     'forces',      'Leyes de Newton',            3
  UNION ALL SELECT 'physics',     'quiz',        'Quiz de Ciencia',            4
  UNION ALL SELECT 'mathematics', 'algebra',     'Álgebra Básica',             1
  UNION ALL SELECT 'mathematics', 'geometry',    'Geometría',                  2
  UNION ALL SELECT 'mathematics', 'calculus',    'Cálculo Diferencial',        3
  UNION ALL SELECT 'mathematics', 'quiz',        'Quiz de Matemáticas',        4
  UNION ALL SELECT 'technology',  'programming', 'Programación Básica',        1
  UNION ALL SELECT 'technology',  'robotics',    'Robótica Educativa',         2
  UNION ALL SELECT 'technology',  'networks',    'Redes y Comunicaciones',     3
  UNION ALL SELECT 'technology',  'quiz',        'Quiz de Tecnología',         4
  UNION ALL SELECT 'simulator',   'explore',     'Explorar la simulación 3D',  1
  UNION ALL SELECT 'simulator',   'quiz',        'Quiz del Simulador',         2
) l ON l.code = m.code
ON DUPLICATE KEY UPDATE title = VALUES(title), display_order = VALUES(display_order), is_active = TRUE;
