const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const questionRoutes = require('./routes/question.routes');
const answerRoutes = require('./routes/answer.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;