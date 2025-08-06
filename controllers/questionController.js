const { Question, User, Category, Answer, sequelize, QuestionVote } = require('../models');

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, content, category_ids } = req.body;
    if (!title || !content || !Array.isArray(category_ids) || category_ids.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'title, content, and category_ids (array) are required' });
    }

    // Pastikan semua kategori valid
    const categories = await Category.findAll({ where: { id: category_ids }, transaction: t });
    if (categories.length !== category_ids.length) {
      await t.rollback();
      return res.status(404).json({ error: 'One or more categories not found' });
    }

    // Buat pertanyaan
    const question = await Question.create({
      title,
      content,
      user_id: req.userId
    }, { transaction: t });

    console.log('Sebelum setCategories');
    // Hubungkan ke banyak kategori
    await question.setCategories(category_ids, { transaction: t });
    console.log('setCategories success');
    
    // Ambil data user dan kategori untuk response
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil'],
      transaction: t
    });
    
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }
    const categoriesData = categories.map(cat => ({ id: cat.id, name: cat.name }));

    await t.commit();
    res.status(201).json({
      id: question.id,
      title: question.title,
      content: question.content,
      vote: question.vote,
      created_at: question.created_at,
      updated_at: question.updated_at,
      user,
      categories: categoriesData
    });
  } catch (error) {
    console.error('ERROR CREATE QUESTION:', error); // log error detail ke terminal
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
    const questions = await Question.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const questions = await Question.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await Question.findByPk(questionId, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Answer,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'nama_lengkap', 'jurusan', 'foto_profil']
            }
          ],
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tambah fungsi upvote pertanyaan
exports.upvote = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const questionId = req.params.id;
    const question = await Question.findByPk(questionId, { transaction: t });
    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Question not found' });
    }
    let vote = await QuestionVote.findOne({ where: { user_id: userId, question_id: questionId }, transaction: t });
    if (!vote) {
      // Belum pernah vote, tambahkan upvote
      await QuestionVote.create({ user_id: userId, question_id: questionId, vote_type: 'up' }, { transaction: t });
      question.vote += 1;
      await question.save({ transaction: t });
      await t.commit();
      return res.json({ id: question.id, vote: question.vote, message: 'Upvoted' });
    } else if (vote.vote_type === 'up') {
      await t.rollback();
      return res.status(400).json({ error: 'You have already upvoted this question' });
    } else {
      // Sudah downvote, ganti ke upvote
      vote.vote_type = 'up';
      await vote.save({ transaction: t });
      question.vote += 2; // dari -1 ke +1
      await question.save({ transaction: t });
      await t.commit();
      return res.json({ id: question.id, vote: question.vote, message: 'Changed vote to upvote' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Tambah fungsi downvote pertanyaan
exports.downvote = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const questionId = req.params.id;
    const question = await Question.findByPk(questionId, { transaction: t });
    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Question not found' });
    }
    let vote = await QuestionVote.findOne({ where: { user_id: userId, question_id: questionId }, transaction: t });
    if (!vote) {
      // Belum pernah vote, tambahkan downvote
      await QuestionVote.create({ user_id: userId, question_id: questionId, vote_type: 'down' }, { transaction: t });
      question.vote -= 1;
      await question.save({ transaction: t });
      await t.commit();
      return res.json({ id: question.id, vote: question.vote, message: 'Downvoted' });
    } else if (vote.vote_type === 'down') {
      await t.rollback();
      return res.status(400).json({ error: 'You have already downvoted this question' });
    } else {
      // Sudah upvote, ganti ke downvote
      vote.vote_type = 'down';
      await vote.save({ transaction: t });
      question.vote -= 2; // dari +1 ke -1
      await question.save({ transaction: t });
      await t.commit();
      return res.json({ id: question.id, vote: question.vote, message: 'Changed vote to downvote' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
