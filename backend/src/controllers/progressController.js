const { pool } = require('../config/db');

async function getMyProgress(req, res) {
  const userId = req.user.id;

  const [moduleProgress] = await pool.query(
    `SELECT m.code AS moduleCode, m.title AS moduleTitle, ump.overall_progress AS overallProgress,
            ump.last_activity_at AS lastActivity
     FROM user_module_progress ump
     JOIN modules m ON m.id = ump.module_id
     WHERE ump.user_id = ?`,
    [userId]
  );

  const [stats] = await pool.query('SELECT * FROM v_user_profile_stats WHERE user_id = ?', [userId]);

  res.json({ moduleProgress, stats: stats[0] || { completed_lessons: 0, total_score: 0, achievements_count: 0 } });
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

module.exports = { getMyProgress, completeSection, upsertModuleProgress, submitQuizAttempt };
