module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Category.associate = (models) => {
    Category.belongsToMany(models.Question, {
      through: 'question_categories',
      foreignKey: 'category_id',
      otherKey: 'question_id',
      as: 'questions'
    });
  };

  return Category;
};