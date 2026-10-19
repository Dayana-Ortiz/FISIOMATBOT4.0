const { pool } = require('../config/db');
const achievements = require('../services/achievementService');

const percent = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

/**
 * Progreso real del usuario. Las actividades que cuentan son las secciones con lesson_key
 * (ver database/lessons.sql): lecciones de cada módulo, sus quizzes y la exploración del simulador.
 */
async function buildProgress(userId) {
  const [catalog] = await pool.query(
    `SELECT m.id AS moduleId, m.code, s.lesson_key AS lessonKey
     FROM modules m
     LEFT JOIN sections s ON s.module_id = m.id AND s.lesson_key IS NOT NULL AND s.is_active = TRUE
     WHERE m.is_active = TRUE
     ORDER BY m.display_order, s.display_order`
  );
  const [done] = await pool.query(
    `SELECT s.module_id AS moduleId, s.lesson_key AS lessonKey
     FROM user_section_progress usp
     JOIN sections s ON s.id = usp.section_id
     WHERE usp.user_id = ? AND usp.completed = TRUE AND s.lesson_key IS NOT NULL AND s.is_active = TRUE`,
    [userId]
  );
  const [activity] = await pool.query(
    'SELECT module_id AS moduleId, last_activity_at AS lastActivity FROM user_module_progress WHERE user_id = ?',
    [userId]
  );

  const modules = [];
  const byId = new Map();
  for (const row of catalog) {
    let mod = byId.get(row.moduleId);
    if (!mod) {
      mod = { code: row.code, total: 0, completed: 0, percent: 0, completedLessons: [], lastActivity: null };
      byId.set(row.moduleId, mod);
      modules.push(mod);
    }
    if (row.lessonKey) mod.total += 1;
  }
  for (const row of done) {
    const mod = byId.get(row.moduleId);
    if (mod) mod.completedLessons.push(row.lessonKey);
  }
  for (const row of activity) {
    const mod = byId.get(row.moduleId);
    if (mod) mod.lastActivity = row.lastActivity;
  }
  for (const mod of modules) {
    mod.completed = mod.completedLessons.length;
    mod.percent = percent(mod.completed, mod.total);
  }

  const total = modules.reduce((s, m) => s + m.total, 0);
  const completed = modules.reduce((s, m) => s + m.completed, 0);

  const [[score]] = await pool.query('SELECT total_score FROM v_user_profile_stats WHERE user_id = ?', [userId]);
  const [[ach]] = await pool.query(
    `SELECT (SELECT COUNT(*) FROM user_achievements WHERE user_id = ?) AS earned,
            (SELECT COUNT(*) FROM achievements) AS total`,
    [userId]
  );
  const [[week]] = await pool.query(
    `SELECT COUNT(*) AS n FROM user_section_progress
     WHERE user_id = ? AND completed = TRUE AND YEARWEEK(completed_at, 1) = YEARWEEK(CURDATE(), 1)`,
    [userId]
  );

  return {
    overall: { completed, total, percent: percent(completed, total) },
    modules,
    stats: {
      completedActivities: completed,
      activitiesThisWeek: Number(week.n),
      totalScore: Number((score && score.total_score) || 0),
      achievements: Number(ach.earned),
      achievementsTotal: Number(ach.total),
    },
  };
}

// GET /api/progress/me
async function getMyProgress(req, res) {
  res.json(await buildProgress(req.user.id));
}

// POST /api/progress/lessons/complete  { moduleCode, lessonKey }
async function completeLesson(req, res) {
  const userId = req.user.id;
  const moduleCode = String((req.body && req.body.moduleCode) || '');
  const lessonKey = String((req.body && req.body.lessonKey) || '');

  const [rows] = await pool.query(
    `SELECT s.id AS sectionId, s.module_id AS moduleId
     FROM sections s JOIN modules m ON m.id = s.module_id
     WHERE m.code = ? AND s.lesson_key = ? AND s.is_active = TRUE
     LIMIT 1`,
    [moduleCode, lessonKey]
  );
  const lesson = rows[0];
  if (!lesson) {
    return res.status(404).json({ message: 'Lección no encontrada.' });
  }

  await pool.query(
    `INSERT INTO user_section_progress (user_id, section_id, completed, completed_at)
     VALUES (?, ?, TRUE, NOW())
     ON DUPLICATE KEY UPDATE completed_at = IF(completed, completed_at, NOW()), completed = TRUE`,
    [userId, lesson.sectionId]
  );

  const progress = await buildProgress(userId);
  const mod = progress.modules.find((m) => m.code === moduleCode);

  // Se guarda también en user_module_progress (lo usan las vistas de administración)
  await pool.query(
    `INSERT INTO user_module_progress (user_id, module_id, overall_progress, last_activity_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE overall_progress = VALUES(overall_progress), last_activity_at = NOW()`,
    [userId, lesson.moduleId, mod ? mod.percent : 0]
  );

  const newAchievements = [];
  const first = await achievements.award(userId, 'FIRST_LESSON');
  if (first) newAchievements.push(first);
  if (mod && mod.percent === 100) {
    const complete = await achievements.award(userId, 'MODULE_COMPLETE');
    if (complete) newAchievements.push(complete);
  }

  // Se reconstruye para reflejar la última actividad y los logros recién obtenidos
  res.json({ ...(await buildProgress(userId)), newAchievements });
}

async function completeSection(req, res) {
  const userId = req.user.id;
  const { sectionId } = req.params;

  await pool.query(
    `INSERT INTO user_section_progress (user_id, section_id, completed, completed_at)
     VALUES (?, ?, TRUE, NOW())
     ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()`,
    [userId, sectionId]
  );

  res.json({ message: 'Sección marcada como completada.' });
}

async function upsertModuleProgress(req, res) {
  const userId = req.user.id;
  const { moduleId } = req.params;
  const { overallProgress } = req.body;

  if (overallProgress === undefined || overallProgress < 0 || overallProgress > 100) {
    return res.status(400).json({ message: 'overallProgress debe estar entre 0 y 100.' });
  }

  await pool.query(
    `INSERT INTO user_module_progress (user_id, module_id, overall_progress, last_activity_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE overall_progress = VALUES(overall_progress), last_activity_at = NOW()`,
    [userId, moduleId, overallProgress]
  );

  res.json({ message: 'Progreso del módulo actualizado.' });
}

async function submitQuizAttempt(req, res) {
  const userId = req.user.id;
  const { quizId } = req.params;
  const { selectedOptionId } = req.body;

  const [options] = await pool.query('SELECT id, is_correct FROM quiz_options WHERE quiz_id = ?', [quizId]);
  const selected = options.find((o) => o.id === selectedOptionId);
  const isCorrect = Boolean(selected?.is_correct);
  const score = isCorrect ? 10 : 0;

  await pool.query(
    `INSERT INTO quiz_attempts (user_id, quiz_id, selected_option_id, is_correct, score)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, quizId, selectedOptionId, isCorrect, score]
  );

  res.json({ isCorrect, score });
}

module.exports = { getMyProgress, completeLesson, completeSection, upsertModuleProgress, submitQuizAttempt };
