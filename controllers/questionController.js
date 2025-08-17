const { Question, User, Category, Answer, sequelize, QuestionVote } = require('../models');
const { Op } = require('sequelize');

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
    const include = [
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
    ];

    // Filter berdasarkan userId
    if (req.query.userId) {
      where.user_id = req.query.userId;
    }

    // Filter berdasarkan search (title atau content) - Advanced Search
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (searchTerm) {
        // Pisahkan search term menjadi kata-kata individual
        const keywords = searchTerm
          .toLowerCase()
          .split(/\s+/) // Split berdasarkan spasi
          .filter(word => word.length >= 2) // Filter kata yang terlalu pendek
          .filter(word => word.trim() !== ''); // Filter kata kosong
        
        if (keywords.length > 0) {
          // Buat kondisi OR untuk setiap keyword di title dan content
          const searchConditions = [];
          
          keywords.forEach(keyword => {
            searchConditions.push({
              title: {
                [Op.iLike]: `%${keyword}%`
              }
            });
            searchConditions.push({
              content: {
                [Op.iLike]: `%${keyword}%`
              }
            });
          });
          
          // Gabungkan semua kondisi dengan OR
          // Ini akan mencari pertanyaan yang mengandung salah satu dari kata kunci
          // baik di title maupun content
          where[Op.or] = searchConditions;
        }
      }
    }

    // Filter berdasarkan kategori (mendukung single dan multiple categories)
    if (req.query.category) {
      let categoryIds;
      
      // Jika category adalah string yang dipisahkan koma, split menjadi array
      if (typeof req.query.category === 'string') {
        categoryIds = req.query.category.includes(',')
          ? req.query.category.split(',').map(id => parseInt(id.trim()))
          : [parseInt(req.query.category)];
      }
      // Jika sudah berupa array (dari query string seperti ?category=1&category=2)
      else if (Array.isArray(req.query.category)) {
        categoryIds = req.query.category.map(id => parseInt(id));
      }
      
      // Filter hanya ID yang valid (bukan NaN)
      categoryIds = categoryIds.filter(id => !isNaN(id));
      
      if (categoryIds.length > 0) {
        include[1].where = { id: categoryIds };
        include[1].required = true; // INNER JOIN untuk memastikan hanya question dengan kategori tersebut
      }
    }

    // Filter berdasarkan status jawaban
    if (req.query.answered !== undefined) {
      if (req.query.answered === 'true') {
        // Pertanyaan yang sudah terjawab
        include.push({
          model: Answer,
          attributes: ['id'],
          required: true // INNER JOIN - harus ada minimal 1 jawaban
        });
      } else if (req.query.answered === 'false') {
        // Pertanyaan yang belum terjawab
        include.push({
          model: Answer,
          attributes: ['id'],
          required: false // LEFT JOIN
        });
        where['$Answers.id$'] = null; // WHERE Answers.id IS NULL
      }
    }

    // Tentukan sorting
    let order = [['created_at', 'DESC']]; // default: terbaru ke terlama
    
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'newest':
          order = [['created_at', 'DESC']];
          break;
        case 'oldest':
          order = [['created_at', 'ASC']];
          break;
        case 'most_votes':
          order = [['vote', 'DESC']];
          break;
        case 'least_votes':
          order = [['vote', 'ASC']];
          break;
        default:
          order = [['created_at', 'DESC']];
      }
    }

    const questions = await Question.findAll({
      where,
      order,
      include,
      distinct: true // Menghindari duplikasi karena many-to-many relationship
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
      // Sudah downvote, ganti ke upvote (hapus downvote lalu tambah upvote = +1 saja)
      vote.vote_type = 'up';
      await vote.save({ transaction: t });
      question.vote += 1; // hanya +1 karena menghapus efek downvote (-1) dan menambah upvote (+1) = net +1
      await question.save({ transaction: t });
      await t.commit();
      return res.json({ id: question.id, vote: question.vote, message: 'Changed vote to upvote' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Fungsi hapus pertanyaan
exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const questionId = req.params.id;

    // Cari pertanyaan beserta jawaban-jawabannya
    const question = await Question.findByPk(questionId, {
      include: [
        {
          model: Answer,
          attributes: ['id', 'vote']
        }
      ],
      transaction: t
    });

    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Question not found' });
    }

    // Cek apakah user adalah pemilik pertanyaan
    if (question.user_id !== userId) {
      await t.rollback();
      return res.status(403).json({ error: 'You can only delete your own questions' });
    }

    // Cek apakah ada jawaban dengan vote >= 1
    const hasHighVoteAnswers = question.Answers.some(answer => answer.vote > 1);
    
    if (hasHighVoteAnswers) {
      await t.rollback();
      return res.status(400).json({
        error: 'Cannot delete question with answers that have more 1 upvotes'
      });
    }

    // Hapus semua vote terkait pertanyaan ini terlebih dahulu
    await QuestionVote.destroy({
      where: { question_id: questionId },
      transaction: t
    });

    // Hapus semua vote terkait jawaban-jawaban dari pertanyaan ini
    if (question.Answers.length > 0) {
      const answerIds = question.Answers.map(answer => answer.id);
      const { AnswerVote } = require('../models');
      await AnswerVote.destroy({
        where: { answer_id: answerIds },
        transaction: t
      });
    }

    // Hapus semua jawaban terkait pertanyaan ini
    await Answer.destroy({
      where: { question_id: questionId },
      transaction: t
    });

    // Hapus pertanyaan
    await question.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Question deleted successfully' });

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
      // Sudah upvote, ganti ke downvote (hapus upvote lalu tambah downvote = -1 saja)
      vote.vote_type = 'down';
      await vote.save({ transaction: t });
      question.vote -= 1; // hanya -1 karena menghapus efek upvote (+1) dan menambah downvote (-1) = net -1
      await question.save({ transaction: t });
      await t.commit();
      return res.json({ id: question.id, vote: question.vote, message: 'Changed vote to downvote' });
    }
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
