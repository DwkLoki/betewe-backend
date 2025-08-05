const { Question, User, Category, Answer, sequelize } = require('../models');

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
