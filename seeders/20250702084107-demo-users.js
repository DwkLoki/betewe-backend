const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'jane_doe',
        email: 'jane@example.com',
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};