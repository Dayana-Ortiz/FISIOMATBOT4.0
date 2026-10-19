-- FisioMathBot: preguntas iniciales de los quizzes (antes estaban fijas en QuizComponent.tsx).
-- Desde ahora los profesores las gestionan en la página "Gestionar quizzes".
-- Se puede ejecutar varias veces: cada pregunta solo se inserta si el módulo aún no la tiene.

-- Ciencia (physics)
INSERT INTO quizzes (module_id, question, explanation, difficulty, display_order)
SELECT m.id, '¿Qué representa la fórmula F = m × a?',
       'F = m × a es la Segunda Ley de Newton, que establece que la fuerza neta aplicada sobre un cuerpo es proporcional a la aceleración que adquiere.',
       'easy', 10
FROM modules m
WHERE m.code = 'physics'
  AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.module_id = m.id AND q.question = '¿Qué representa la fórmula F = m × a?');
SET @q = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
INSERT INTO quiz_options (quiz_id, option_text, is_correct, display_order)
SELECT @q, t.txt, t.ok, t.ord FROM (
  SELECT 'Ley de Gravitación Universal' AS txt, FALSE AS ok, 1 AS ord
  UNION ALL SELECT 'Segunda Ley de Newton', TRUE, 2
  UNION ALL SELECT 'Principio de Arquímedes', FALSE, 3
  UNION ALL SELECT 'Ley de Ohm', FALSE, 4
) t WHERE @q IS NOT NULL;

INSERT INTO quizzes (module_id, question, explanation, difficulty, display_order)
SELECT m.id, '¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional?',
       'La unidad de fuerza en el SI es el Newton (N), llamado así en honor a Isaac Newton.',
       'easy', 11
FROM modules m
WHERE m.code = 'physics'
  AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.module_id = m.id AND q.question = '¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional?');
SET @q = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
INSERT INTO quiz_options (quiz_id, option_text, is_correct, display_order)
SELECT @q, t.txt, t.ok, t.ord FROM (
  SELECT 'Joule' AS txt, FALSE AS ok, 1 AS ord
  UNION ALL SELECT 'Newton', TRUE, 2
  UNION ALL SELECT 'Watt', FALSE, 3
  UNION ALL SELECT 'Pascal', FALSE, 4
) t WHERE @q IS NOT NULL;

-- Matemáticas (mathematics)
INSERT INTO quizzes (module_id, question, explanation, difficulty, display_order)
SELECT m.id, '¿Cuál es el resultado de (x + 2)(x - 2)?',
       'Aplicando la diferencia de cuadrados: (x + 2)(x - 2) = x² - 4.',
       'medium', 10
FROM modules m
WHERE m.code = 'mathematics'
  AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.module_id = m.id AND q.question = '¿Cuál es el resultado de (x + 2)(x - 2)?');
SET @q = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
INSERT INTO quiz_options (quiz_id, option_text, is_correct, display_order)
SELECT @q, t.txt, t.ok, t.ord FROM (
  SELECT 'x² - 4' AS txt, TRUE AS ok, 1 AS ord
  UNION ALL SELECT 'x² + 4', FALSE, 2
  UNION ALL SELECT 'x² - 2x + 4', FALSE, 3
  UNION ALL SELECT 'x² + 2x - 4', FALSE, 4
) t WHERE @q IS NOT NULL;

-- Tecnología (technology)
INSERT INTO quizzes (module_id, question, explanation, difficulty, display_order)
SELECT m.id, '¿Qué lenguaje se usa principalmente para desarrollo web frontend?',
       'JavaScript es el lenguaje principal para desarrollo web frontend, aunque también se usa en backend con Node.js.',
       'easy', 10
FROM modules m
WHERE m.code = 'technology'
  AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.module_id = m.id AND q.question = '¿Qué lenguaje se usa principalmente para desarrollo web frontend?');
SET @q = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
INSERT INTO quiz_options (quiz_id, option_text, is_correct, display_order)
SELECT @q, t.txt, t.ok, t.ord FROM (
  SELECT 'Python' AS txt, FALSE AS ok, 1 AS ord
  UNION ALL SELECT 'Java', FALSE, 2
  UNION ALL SELECT 'JavaScript', TRUE, 3
  UNION ALL SELECT 'C++', FALSE, 4
) t WHERE @q IS NOT NULL;

-- Simulador (simulator)
INSERT INTO quizzes (module_id, question, explanation, difficulty, display_order)
SELECT m.id, 'Si un objeto cae desde cierta altura, ¿qué le pasa a su energía potencial mientras baja?',
       'Al bajar, la altura disminuye y con ella la energía potencial (Ep = m·g·h); esa energía se transforma en energía cinética. Puedes comprobarlo en la gráfica de energías del simulador.',
       'easy', 10
FROM modules m
WHERE m.code = 'simulator'
  AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.module_id = m.id AND q.question = 'Si un objeto cae desde cierta altura, ¿qué le pasa a su energía potencial mientras baja?');
SET @q = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), NULL);
INSERT INTO quiz_options (quiz_id, option_text, is_correct, display_order)
SELECT @q, t.txt, t.ok, t.ord FROM (
  SELECT 'Aumenta' AS txt, FALSE AS ok, 1 AS ord
  UNION ALL SELECT 'Disminuye y se transforma en energía cinética', TRUE, 2
  UNION ALL SELECT 'Se mantiene igual', FALSE, 3
  UNION ALL SELECT 'Desaparece sin transformarse', FALSE, 4
) t WHERE @q IS NOT NULL;
