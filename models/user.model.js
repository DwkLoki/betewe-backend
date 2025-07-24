module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: true
    },
    jurusan: {
      type: DataTypes.STRING,
      allowNull: true
    },
    foto_profil: {
      type: DataTypes.STRING,
      allowNull: true,
    //   defaultValue: 'https://ui-avatars.com/api/?name=User'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.associate = (models) => {
    User.hasMany(models.Question, { foreignKey: 'user_id' });
    User.hasMany(models.Answer, { foreignKey: 'user_id' });
  };

  return User;
};