const { Answer, Question, User, sequelize } = require('../models');

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
