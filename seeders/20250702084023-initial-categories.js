module.exports = {
    up: async (queryInterface) => {
      const categories = [
        'Akuntansi',
        'Filsafat',
        'Ilmu Ekonomi',
        'Manajemen',
        'Teknik Elektro',
        'Teknik Geologi',
        'Ekonomi dan Bisnis',
        'Hukum',
        'Ilmu Sosial',
        'Aljabar Linier',
        'Kedokteran dan Ilmu Kesehatan',
        'Psikologi',
        'Kehutanan',
        'Ilmu Pendidikan',
        'Pertanian',
        'Sastra dan Ilmu Budaya'
      ].map(name => ({
        name,
        created_at: new Date(),
        updated_at: new Date()
      }));
  
      await queryInterface.bulkInsert('categories', categories, {});
    },
  
    down: async (queryInterface) => {
      await queryInterface.bulkDelete('categories', null, {});
    }
};