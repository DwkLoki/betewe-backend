module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'questions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Question.associate = (models) => {
    Question.belongsTo(models.User, { foreignKey: 'user_id' });
    Question.belongsToMany(models.Category, {
      through: 'question_categories',
      foreignKey: 'question_id',
      otherKey: 'category_id',
      as: 'categories'
    });
    Question.hasMany(models.Answer, { foreignKey: 'question_id' });
    Question.belongsToMany(models.User, {
      through: 'QuestionLikes',
      as: 'liked_by',
      foreignKey: 'question_id'
    });
  };

  return Question;
};