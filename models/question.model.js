module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
      title: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
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
      Question.belongsTo(models.Category, { foreignKey: 'category_id' });
      Question.hasMany(models.Answer, { foreignKey: 'question_id' });
      Question.belongsToMany(models.User, {
        through: 'QuestionLikes',
        as: 'liked_by',
        foreignKey: 'question_id'
      });
    };
  
    return Question;
};