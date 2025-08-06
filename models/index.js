const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const User = require('./user.model')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Question = require('./question.model')(sequelize, DataTypes);
const Answer = require('./answer.model')(sequelize, DataTypes);
const QuestionVote = require('./questionvote.model')(sequelize, DataTypes);
const AnswerVote = require('./answervote.model')(sequelize, DataTypes);

// Setup associations
if (User.associate) User.associate({ Question, Answer });
if (Category.associate) Category.associate({ Question });
if (Question.associate) Question.associate({ User, Category, Answer });
if (Answer.associate) Answer.associate({ User, Question });
if (QuestionVote.associate) QuestionVote.associate({ User, Question });
if (AnswerVote.associate) AnswerVote.associate({ User, Answer });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Question,
  Answer,
  QuestionVote,
  AnswerVote
};
