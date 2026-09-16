const { pool } = require('../config/db');

async function listModules(req, res) {
  const [modules] = await pool.query(
    'SELECT id, code, title, description, color, icon, display_order FROM modules WHERE is_active = TRUE ORDER BY display_order'
  );
  res.json({ modules });
}

async function getModuleDetail(req, res) {
  const { code } = req.params;

  const [modules] = await pool.query('SELECT * FROM modules WHERE code = ? AND is_active = TRUE', [code]);
  if (modules.length === 0) {
    return res.status(404).json({ message: 'Módulo no encontrado.' });
  }
  const module = modules[0];

  const [sections] = await pool.query(
    'SELECT id, title, content, display_order FROM sections WHERE module_id = ? AND is_active = TRUE ORDER BY display_order',
    [module.id]
  );

  const [quizzes] = await pool.query(
    'SELECT id, question, explanation, difficulty FROM quizzes WHERE module_id = ? AND is_active = TRUE ORDER BY display_order',
    [module.id]
  );

  for (const quiz of quizzes) {
    const [options] = await pool.query(
      'SELECT id, option_text, is_correct, display_order FROM quiz_options WHERE quiz_id = ? ORDER BY display_order',
      [quiz.id]
    );
    quiz.options = options;
  }

  const [simulations] = await pool.query(
    'SELECT id, title, description, type FROM simulations WHERE module_id = ? AND is_active = TRUE ORDER BY display_order',
    [module.id]
  );

  res.json({ module, sections, quizzes, simulations });
}

module.exports = { listModules, getModuleDetail };
