module.exports = {
    up: async (queryInterface) => {
      // Ambil ID kategori dan user yang sudah dibuat
      const [categories] = await queryInterface.sequelize.query(
        'SELECT id FROM categories LIMIT 2'
      );
      const [users] = await queryInterface.sequelize.query(
        'SELECT id FROM users LIMIT 2'
      );
  
      const questions = [
        {
          title: 'Bagaimana cara menghitung NPV?',
          content: 'Saya sedang belajar tentang NPV tapi masih bingung dengan penerapannya...',
          user_id: users[0].id,
          category_id: categories[0].id, // Akuntansi
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Apa perbedaan antara mikro dan makro ekonomi?',
          content: 'Bisa jelaskan perbedaan mendasar antara mikro dan makro ekonomi?',
          user_id: users[1].id,
          category_id: categories[1].id, // Ilmu Ekonomi
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
  
      await queryInterface.bulkInsert('questions', questions, {});
    },
  
    down: async (queryInterface) => {
      await queryInterface.bulkDelete('questions', null, {});
    }
};