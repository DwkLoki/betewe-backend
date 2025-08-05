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

module.exports = router;
