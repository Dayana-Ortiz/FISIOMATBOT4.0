const { pool } = require('../config/db');

/*
 * Quizzes por módulo.
 *  - Estudiantes: reciben las preguntas SIN la respuesta correcta; cada respuesta se corrige aquí.
 *  - Profesores y administradores: crean, editan, ordenan, activan/desactivan y eliminan preguntas.
 */

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const POINTS_PER_CORRECT = 10;

async function findModule(code) {
  const [rows] = await pool.query('SELECT id, code FROM modules WHERE code = ? LIMIT 1', [String(code || '')]);
  return rows[0] || null;
}

async function loadOptions(quizIds, { withAnswers }) {
  if (!quizIds.length) return new Map();
  const [rows] = await pool.query(
    `SELECT id, quiz_id AS quizId, option_text AS text, is_correct AS isCorrect
     FROM quiz_options WHERE quiz_id IN (?) ORDER BY display_order, id`,
    [quizIds]
  );
  const byQuiz = new Map();
  for (const row of rows) {
    const option = withAnswers
      ? { id: row.id, text: row.text, isCorrect: Boolean(row.isCorrect) }
      : { id: row.id, text: row.text };
    if (!byQuiz.has(row.quizId)) byQuiz.set(row.quizId, []);
    byQuiz.get(row.quizId).push(option);
  }
  return byQuiz;
}

// ---------------------------------------------------------------------------
// Estudiantes
// ---------------------------------------------------------------------------

// GET /api/quizzes/module/:code  -> preguntas activas, sin respuestas
async function getModuleQuiz(req, res) {
  const mod = await findModule(req.params.code);
  if (!mod) return res.status(404).json({ message: 'Módulo no encontrado.' });

  const [quizzes] = await pool.query(
    `SELECT id, question, difficulty FROM quizzes
     WHERE module_id = ? AND is_active = TRUE ORDER BY display_order, id`,
    [mod.id]
  );
  const options = await loadOptions(quizzes.map((q) => q.id), { withAnswers: false });
  // Solo preguntas que se pueden responder (con al menos 2 opciones)
  const questions = quizzes
    .map((q) => ({ ...q, options: options.get(q.id) || [] }))
    .filter((q) => q.options.length >= MIN_OPTIONS);

  res.json({ questions });
}

// POST /api/quizzes/:id/answer  { optionId }  -> corrige y guarda el intento
async function answerQuestion(req, res) {
  const userId = req.user.id;
  const quizId = Number(req.params.id);
  const optionId = Number(req.body && req.body.optionId);

  const [quizRows] = await pool.query(
    'SELECT id, explanation FROM quizzes WHERE id = ? AND is_active = TRUE LIMIT 1',
    [quizId]
  );
  const quiz = quizRows[0];
  if (!quiz) return res.status(404).json({ message: 'Pregunta no encontrada.' });

  const [options] = await pool.query('SELECT id, is_correct FROM quiz_options WHERE quiz_id = ?', [quizId]);
  const selected = options.find((o) => o.id === optionId);
  if (!selected) return res.status(400).json({ message: 'La opción elegida no pertenece a esta pregunta.' });

  const correct = options.find((o) => o.is_correct);
  const isCorrect = Boolean(selected.is_correct);

  // Los puntos solo se ganan la primera vez que se acierta cada pregunta (repetir el quiz no infla el puntaje).
  const [prev] = await pool.query(
    'SELECT 1 FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? AND is_correct = TRUE LIMIT 1',
    [userId, quizId]
  );
  const score = isCorrect && prev.length === 0 ? POINTS_PER_CORRECT : 0;

  await pool.query(
    `INSERT INTO quiz_attempts (user_id, quiz_id, selected_option_id, is_correct, score)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, quizId, optionId, isCorrect, score]
  );

  res.json({
    isCorrect,
    correctOptionId: correct ? correct.id : null,
    explanation: quiz.explanation,
    points: score,
  });
}

// ---------------------------------------------------------------------------
// Profesores y administradores
// ---------------------------------------------------------------------------

/** Valida y normaliza el cuerpo de crear/editar. Devuelve { error } o { data }. */
function parseQuizBody(body) {
  const b = body || {};
  const question = String(b.question || '').trim();
  const explanation = String(b.explanation || '').trim();
  const difficulty = String(b.difficulty || 'medium');
  const isActive = b.isActive === undefined ? true : Boolean(b.isActive);
  const rawOptions = Array.isArray(b.options) ? b.options : [];

  if (question.length < 5 || question.length > 1000) {
    return { error: 'La pregunta debe tener entre 5 y 1000 caracteres.' };
  }
  if (explanation.length > 1000) {
    return { error: 'La explicación no puede superar 1000 caracteres.' };
  }
  if (!DIFFICULTIES.includes(difficulty)) {
    return { error: 'La dificultad debe ser fácil, media o difícil.' };
  }

  const options = rawOptions.map((o) => ({
    text: String((o && o.text) || '').trim(),
    isCorrect: Boolean(o && o.isCorrect),
  }));
  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
    return { error: `La pregunta debe tener entre ${MIN_OPTIONS} y ${MAX_OPTIONS} opciones.` };
  }
  if (options.some((o) => !o.text || o.text.length > 500)) {
    return { error: 'Cada opción debe tener texto (máximo 500 caracteres).' };
  }
  const texts = options.map((o) => o.text.toLowerCase());
  if (new Set(texts).size !== texts.length) {
    return { error: 'Hay opciones repetidas.' };
  }
  if (options.filter((o) => o.isCorrect).length !== 1) {
    return { error: 'Marca exactamente una opción como la respuesta correcta.' };
  }

  return { data: { question, explanation, difficulty, isActive, options } };
}

async function replaceOptions(conn, quizId, options) {
  await conn.query('DELETE FROM quiz_options WHERE quiz_id = ?', [quizId]);
  const values = options.map((o, i) => [quizId, o.text, o.isCorrect, i + 1]);
  await conn.query('INSERT INTO quiz_options (quiz_id, option_text, is_correct, display_order) VALUES ?', [values]);
}

async function loadManagedQuiz(quizId) {
  const [rows] = await pool.query(
    `SELECT q.id, m.code AS moduleCode, q.question, q.explanation, q.difficulty,
            q.display_order AS displayOrder, q.is_active AS isActive, q.created_at AS createdAt,
            u.name AS authorName
     FROM quizzes q
     JOIN modules m ON m.id = q.module_id
     LEFT JOIN users u ON u.id = q.created_by
     WHERE q.id = ?`,
    [quizId]
  );
  const quiz = rows[0];
  if (!quiz) return null;
  const options = await loadOptions([quiz.id], { withAnswers: true });
  return { ...quiz, isActive: Boolean(quiz.isActive), options: options.get(quiz.id) || [] };
}

// GET /api/admin/quizzes/summary  -> preguntas por módulo
async function quizSummary(req, res) {
  const [rows] = await pool.query(
    `SELECT m.code, COUNT(q.id) AS total, COALESCE(SUM(q.is_active), 0) AS active
     FROM modules m LEFT JOIN quizzes q ON q.module_id = m.id
     GROUP BY m.id, m.code ORDER BY m.display_order`
  );
  res.json({ modules: rows.map((r) => ({ code: r.code, total: Number(r.total), active: Number(r.active) })) });
}

// GET /api/admin/quizzes?module=physics  -> todas las preguntas del módulo (con respuestas)
async function listQuizzes(req, res) {
  const mod = await findModule(req.query.module);
  if (!mod) return res.status(404).json({ message: 'Módulo no encontrado.' });

  const [quizzes] = await pool.query(
    `SELECT q.id, q.question, q.explanation, q.difficulty, q.display_order AS displayOrder,
            q.is_active AS isActive, q.created_at AS createdAt, u.name AS authorName
     FROM quizzes q LEFT JOIN users u ON u.id = q.created_by
     WHERE q.module_id = ? ORDER BY q.display_order, q.id`,
    [mod.id]
  );
  const options = await loadOptions(quizzes.map((q) => q.id), { withAnswers: true });
  res.json({
    quizzes: quizzes.map((q) => ({
      ...q,
      moduleCode: mod.code,
      isActive: Boolean(q.isActive),
      options: options.get(q.id) || [],
    })),
  });
}

// POST /api/admin/quizzes  { moduleCode, question, explanation, difficulty, isActive, options[] }
async function createQuiz(req, res) {
  const mod = await findModule(req.body && req.body.moduleCode);
  if (!mod) return res.status(400).json({ message: 'Elige un módulo válido.' });
  const { error, data } = parseQuizBody(req.body);
  if (error) return res.status(400).json({ message: error });

  const conn = await pool.getConnection();
  let quizId;
  try {
    await conn.beginTransaction();
    const [[{ nextOrder }]] = await conn.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 AS nextOrder FROM quizzes WHERE module_id = ?',
      [mod.id]
    );
    const [result] = await conn.query(
      `INSERT INTO quizzes (module_id, question, explanation, difficulty, display_order, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mod.id, data.question, data.explanation || null, data.difficulty, nextOrder, data.isActive, req.user.id]
    );
    quizId = result.insertId;
    await replaceOptions(conn, quizId, data.options);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  res.status(201).json({ quiz: await loadManagedQuiz(quizId) });
}

// PUT /api/admin/quizzes/:id  (mismo cuerpo que crear; el módulo no cambia)
async function updateQuiz(req, res) {
  const quizId = Number(req.params.id);
  const [existing] = await pool.query('SELECT id FROM quizzes WHERE id = ?', [quizId]);
  if (!existing.length) return res.status(404).json({ message: 'Pregunta no encontrada.' });
  const { error, data } = parseQuizBody(req.body);
  if (error) return res.status(400).json({ message: error });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE quizzes SET question = ?, explanation = ?, difficulty = ?, is_active = ? WHERE id = ?',
      [data.question, data.explanation || null, data.difficulty, data.isActive, quizId]
    );
    await replaceOptions(conn, quizId, data.options);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  res.json({ quiz: await loadManagedQuiz(quizId) });
}

// PATCH /api/admin/quizzes/:id/status  { isActive }
async function setQuizStatus(req, res) {
  const quizId = Number(req.params.id);
  const isActive = Boolean(req.body && req.body.isActive);
  const [result] = await pool.query('UPDATE quizzes SET is_active = ? WHERE id = ?', [isActive, quizId]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Pregunta no encontrada.' });
  res.json({ quiz: await loadManagedQuiz(quizId) });
}

// PATCH /api/admin/quizzes/:id/move  { direction: 'up' | 'down' }
async function moveQuiz(req, res) {
  const quizId = Number(req.params.id);
  const direction = req.body && req.body.direction === 'up' ? 'up' : 'down';
  const [rows] = await pool.query('SELECT id, module_id FROM quizzes WHERE id = ?', [quizId]);
  if (!rows.length) return res.status(404).json({ message: 'Pregunta no encontrada.' });

  // Se renumera el módulo completo (1..n) para que el orden quede consistente aunque haya empates.
  const [list] = await pool.query(
    'SELECT id FROM quizzes WHERE module_id = ? ORDER BY display_order, id',
    [rows[0].module_id]
  );
  const ids = list.map((q) => q.id);
  const index = ids.indexOf(quizId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target >= 0 && target < ids.length) {
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await Promise.all(ids.map((id, i) => pool.query('UPDATE quizzes SET display_order = ? WHERE id = ?', [i + 1, id])));
  }
  res.json({ message: 'Orden actualizado.' });
}

// DELETE /api/admin/quizzes/:id
async function deleteQuiz(req, res) {
  const [result] = await pool.query('DELETE FROM quizzes WHERE id = ?', [Number(req.params.id)]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Pregunta no encontrada.' });
  res.json({ message: 'Pregunta eliminada.' });
}

module.exports = {
  getModuleQuiz,
  answerQuestion,
  quizSummary,
  listQuizzes,
  createQuiz,
  updateQuiz,
  setQuizStatus,
  moveQuiz,
  deleteQuiz,
  parseQuizBody,
};
