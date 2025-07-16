module.exports = {
    up: async (queryInterface) => {
      const categories = [
        'Akuntansi',
        'Ilmu Ekonomi',
        'Manajemen',
        'Teknik Elektro',
        'Teknik Geologi',
        'Ekonomi dan Bisnis',
        'Filsafat',
        'Hukum',
        'Ilmu Sosial',
        'Aljabar Linier',
        'Basis Data',
        'Kedokteran dan Ilmu Kesehatan',
        'Psikologi',
        'Kehutanan',
        'Ilmu Pendidikan',
        'Sastra dan Ilmu Budaya',
        'Pertanian'
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