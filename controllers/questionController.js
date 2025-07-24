const { Question, User, Category, sequelize } = require('../models');

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
    const questions = await Question.findAll({
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
