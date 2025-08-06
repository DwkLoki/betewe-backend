const { Answer, Question, User, sequelize, AnswerVote } = require('../models');

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { content, question_id } = req.body;
    
    // Validasi input
    if (!content || !question_id) {
      await t.rollback();
      return res.status(400).json({ error: 'content and question_id are required' });
    }

    // Pastikan pertanyaan ada
    const question = await Question.findByPk(question_id, { transaction: t });
    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Question not found' });
    }

    // Buat jawaban
    const answer = await Answer.create({
      content,
      question_id,
      user_id: req.userId,
      vote: 0
    }, { transaction: t });

    // Ambil data user untuk response
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil'],
      transaction: t
    });

    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    await t.commit();
    res.status(201).json({
      id: answer.id,
      content: answer.content,
      vote: answer.vote,
      created_at: answer.created_at,
      updated_at: answer.updated_at,
      user
    });
  } catch (error) {
    console.error('ERROR CREATE ANSWER:', error);
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.userId) {
      where.user_id = req.query.userId;
    }
    const answers = await Answer.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil']
        },
        {
          model: Question,
          attributes: ['id', 'title', 'content']
        }
      ]
    });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const answers = await Answer.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil']
        },
        {
          model: Question,
          attributes: ['id', 'title', 'content']
        }
      ]
    });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tambah fungsi upvote jawaban
exports.upvote = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const answerId = req.params.id;
    const answer = await Answer.findByPk(answerId, { transaction: t });
    if (!answer) {
      await t.rollback();
      return res.status(404).json({ error: 'Answer not found' });
    }
    let vote = await AnswerVote.findOne({ where: { user_id: userId, answer_id: answerId }, transaction: t });
    if (!vote) {
      // Belum pernah vote, tambahkan upvote
      await AnswerVote.create({ user_id: userId, answer_id: answerId, vote_type: 'up' }, { transaction: t });
      answer.vote += 1;
      await answer.save({ transaction: t });
      await t.commit();
      return res.json({ id: answer.id, vote: answer.vote, message: 'Upvoted' });
    } else if (vote.vote_type === 'up') {
      await t.rollback();
      return res.status(400).json({ error: 'You have already upvoted this answer' });
    } else {
      // Sudah downvote, ganti ke upvote
      vote.vote_type = 'up';
      await vote.save({ transaction: t });
      answer.vote += 2; // dari -1 ke +1
      await answer.save({ transaction: t });
      await t.commit();
      return res.json({ id: answer.id, vote: answer.vote, message: 'Changed vote to upvote' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Tambah fungsi downvote jawaban
exports.downvote = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const answerId = req.params.id;
    const answer = await Answer.findByPk(answerId, { transaction: t });
    if (!answer) {
      await t.rollback();
      return res.status(404).json({ error: 'Answer not found' });
    }
    let vote = await AnswerVote.findOne({ where: { user_id: userId, answer_id: answerId }, transaction: t });
    if (!vote) {
      // Belum pernah vote, tambahkan downvote
      await AnswerVote.create({ user_id: userId, answer_id: answerId, vote_type: 'down' }, { transaction: t });
      answer.vote -= 1;
      await answer.save({ transaction: t });
      await t.commit();
      return res.json({ id: answer.id, vote: answer.vote, message: 'Downvoted' });
    } else if (vote.vote_type === 'down') {
      await t.rollback();
      return res.status(400).json({ error: 'You have already downvoted this answer' });
    } else {
      // Sudah upvote, ganti ke downvote
      vote.vote_type = 'down';
      await vote.save({ transaction: t });
      answer.vote -= 2; // dari +1 ke -1
      await answer.save({ transaction: t });
      await t.commit();
      return res.json({ id: answer.id, vote: answer.vote, message: 'Changed vote to downvote' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
