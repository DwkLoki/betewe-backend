const { Category } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 