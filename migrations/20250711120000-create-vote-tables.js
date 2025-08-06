module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuestionVotes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vote_type: {
        type: Sequelize.ENUM('up', 'down'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('QuestionVotes', {
      fields: ['user_id', 'question_id'],
      type: 'unique',
      name: 'uq_questionvotes_user_question'
    });

    await queryInterface.createTable('AnswerVotes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      answer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'answers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vote_type: {
        type: Sequelize.ENUM('up', 'down'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('AnswerVotes', {
      fields: ['user_id', 'answer_id'],
      type: 'unique',
      name: 'uq_answervotes_user_answer'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('AnswerVotes');
    await queryInterface.dropTable('QuestionVotes');
  }
};