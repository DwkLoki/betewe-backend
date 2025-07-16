const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const User = require('./user.model')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);
const Question = require('./question.model')(sequelize, DataTypes);
const Answer = require('./answer.model')(sequelize, DataTypes);

// Setup associations
if (User.associate) User.associate({ Question, Answer });
if (Category.associate) Category.associate({ Question });
if (Question.associate) Question.associate({ User, Category, Answer });
if (Answer.associate) Answer.associate({ User, Question });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Question,
  Answer
};
