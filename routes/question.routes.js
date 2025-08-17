const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const questionController = require('../controllers/questionController');

// Endpoint tambah pertanyaan
router.post('/', authenticateToken, questionController.create);
// Endpoint get semua pertanyaan
router.get('/', questionController.getAll);
// Endpoint get pertanyaan milik user tertentu
router.get('/user/:userId', questionController.getByUser);
// Endpoint get detail pertanyaan berdasarkan id
router.get('/:id', questionController.getById);
// Endpoint upvote dan downvote pertanyaan
router.post('/:id/upvote', authenticateToken, questionController.upvote);
router.post('/:id/downvote', authenticateToken, questionController.downvote);

// Endpoint hapus pertanyaan
router.delete('/:id', authenticateToken, questionController.delete);

module.exports = router;
