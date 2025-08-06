module.exports = (sequelize, DataTypes) => {
  const QuestionVote = sequelize.define('QuestionVote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vote_type: {
      type: DataTypes.ENUM('up', 'down'),
      allowNull: false
    }
  }, {
    tableName: 'QuestionVotes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  QuestionVote.associate = (models) => {
    QuestionVote.belongsTo(models.User, { foreignKey: 'user_id' });
    QuestionVote.belongsTo(models.Question, { foreignKey: 'question_id' });
  };
  return QuestionVote;
};