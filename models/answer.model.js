module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define('Answer', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'answers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Answer.associate = (models) => {
    Answer.belongsTo(models.User, { foreignKey: 'user_id' });
    Answer.belongsTo(models.Question, { foreignKey: 'question_id' });
  };

  return Answer;
};
