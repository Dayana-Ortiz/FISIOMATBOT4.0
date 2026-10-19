'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate, getUserId } = require('../services/chatDeps');
const chat = require('../controllers/chatController');

const router = express.Router();

// Todas las rutas del chat requieren sesión (JWT)
router.use(authenticate);

// Límite por usuario autenticado: 20 peticiones por minuto
router.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `chat-user-${getUserId(req)}`,
    validate: { keyGeneratorIpFallback: false },
    message: { message: 'Demasiadas solicitudes. Espera un momento.', code: 'RATE_LIMIT' },
  })
);

router.get('/status', chat.status);
router.post('/conversations', chat.openConversation);
router.get('/conversations/:id', chat.getConversation);
router.post('/conversations/:id/messages', chat.sendMessage);

module.exports = router;
