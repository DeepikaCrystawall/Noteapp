import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    avatar_url: DataTypes.TEXT,
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reset_token: DataTypes.STRING(255),
    reset_token_expires_at: DataTypes.DATE,
    last_login_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  }, {
    tableName: 'users',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['email'], where: { deleted_at: null } },
      { fields: ['reset_token'], where: { reset_token: { [sequelize.Sequelize.Op.ne]: null } } },
    ],
  });

  return User;
};
