const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      {
        username: 'dwiky',
        email: 'dwiky@gmail.com',
        password_hash: passwordHash,
        foto_profil: 'https://ui-avatars.com/api/?name=dwiky',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'rahmat',
        email: 'rahmat@gmail.com',
        password_hash: passwordHash,
        foto_profil: 'https://ui-avatars.com/api/?name=rahmat',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'fatur',
        email: 'fatur@gmail.com',
        password_hash: passwordHash,
        foto_profil: 'https://ui-avatars.com/api/?name=fatur',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'andito',
        email: 'andito@gmail.com',
        password_hash: passwordHash,
        foto_profil: 'https://ui-avatars.com/api/?name=andito',
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