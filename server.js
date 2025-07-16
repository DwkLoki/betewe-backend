const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(() => {
  console.log('Database connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});