module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      }
    }, {
      tableName: 'categories',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  
    return Category;
};