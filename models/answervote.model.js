module.exports = (sequelize, DataTypes) => {
  const AnswerVote = sequelize.define('AnswerVote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    answer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vote_type: {
      type: DataTypes.ENUM('up', 'down'),
      allowNull: false
    }
  }, {
    tableName: 'AnswerVotes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  AnswerVote.associate = (models) => {
    AnswerVote.belongsTo(models.User, { foreignKey: 'user_id' });
    AnswerVote.belongsTo(models.Answer, { foreignKey: 'answer_id' });
  };
  return AnswerVote;
};