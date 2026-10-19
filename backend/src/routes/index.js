const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const authController = require('../controllers/authController');
const moduleController = require('../controllers/moduleController');
const progressController = require('../controllers/progressController');
const adminController = require('../controllers/adminController');
const notificationController = require('../controllers/notificationController');
const profileController = require('../controllers/profileController');
const quizController = require('../controllers/quizController');
const chatRoutes = require('./chat');

// Envuelve controladores async para que sus errores lleguen al middleware de errores.
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- Autenticación (pública) ---
router.post('/auth/register', wrap(authController.register));
router.post('/auth/login', wrap(authController.login));
router.get('/auth/me', authenticate, wrap(authController.me));

// --- Perfil del usuario autenticado ---
router.get('/profile/me', authenticate, wrap(profileController.getMyProfile));
router.put('/profile/me', authenticate, wrap(profileController.updateMyProfile));

// --- Módulos y contenido (lectura para cualquier usuario autenticado) ---
router.get('/modules', authenticate, wrap(moduleController.listModules));
router.get('/modules/:code', authenticate, wrap(moduleController.getModuleDetail));

// --- Progreso del usuario autenticado (estudiantes) ---
router.get('/progress/me', authenticate, wrap(progressController.getMyProgress));
router.post('/progress/lessons/complete', authenticate, wrap(progressController.completeLesson));
router.post('/progress/sections/:sectionId/complete', authenticate, wrap(progressController.completeSection));
router.put('/progress/modules/:moduleId', authenticate, wrap(progressController.upsertModuleProgress));
router.post('/progress/quizzes/:quizId/attempt', authenticate, wrap(progressController.submitQuizAttempt));

// --- Quizzes para estudiantes (sin respuestas; cada respuesta se corrige en el servidor) ---
router.get('/quizzes/module/:code', authenticate, wrap(quizController.getModuleQuiz));
router.post('/quizzes/:id/answer', authenticate, wrap(quizController.answerQuestion));

// --- Gestión de quizzes (profesores y administradores) ---
const canManageQuizzes = [authenticate, requireRole('teacher', 'admin')];
router.get('/admin/quizzes/summary', ...canManageQuizzes, wrap(quizController.quizSummary));
router.get('/admin/quizzes', ...canManageQuizzes, wrap(quizController.listQuizzes));
router.post('/admin/quizzes', ...canManageQuizzes, wrap(quizController.createQuiz));
router.put('/admin/quizzes/:id', ...canManageQuizzes, wrap(quizController.updateQuiz));
router.patch('/admin/quizzes/:id/status', ...canManageQuizzes, wrap(quizController.setQuizStatus));
router.patch('/admin/quizzes/:id/move', ...canManageQuizzes, wrap(quizController.moveQuiz));
router.delete('/admin/quizzes/:id', ...canManageQuizzes, wrap(quizController.deleteQuiz));

// --- Notificaciones ---
router.get('/notifications/me', authenticate, wrap(notificationController.listMyNotifications));
router.post('/notifications/me/read-all', authenticate, wrap(notificationController.markAllRead));

// --- Chat tutor (requiere sesión; ver routes/chat.js) ---
router.use('/chat', chatRoutes);

// --- Administración (solo teacher/admin; algunas acciones solo admin) ---
router.get('/admin/users', authenticate, requireRole('teacher', 'admin'), wrap(adminController.listUsers));
router.get('/admin/stats', authenticate, requireRole('teacher', 'admin'), wrap(adminController.getStats));
router.patch('/admin/users/:id/role', authenticate, requireRole('admin'), wrap(adminController.changeUserRole));
router.patch('/admin/users/:id/status', authenticate, requireRole('teacher', 'admin'), wrap(adminController.toggleUserStatus));
router.get('/admin/institutions', authenticate, requireRole('admin'), wrap(adminController.listInstitutions));
router.post('/admin/institutions', authenticate, requireRole('admin'), wrap(adminController.createInstitution));

module.exports = router;
