const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const answerController = require('../controllers/answerController');

// Endpoint get semua jawaban (dengan query string support)
router.get('/', answerController.getAll);
// Endpoint tambah jawaban (hanya user login)
router.post('/', authenticateToken, answerController.create);
// Endpoint get jawaban milik user tertentu
router.get('/user/:userId', answerController.getByUser);
// Endpoint upvote dan downvote jawaban
router.post('/:id/upvote', authenticateToken, answerController.upvote);
router.post('/:id/downvote', authenticateToken, answerController.downvote);

module.exports = router;
