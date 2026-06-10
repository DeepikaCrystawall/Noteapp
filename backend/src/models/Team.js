import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Team = sequelize.define('Team', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    avatar_url: DataTypes.TEXT,
    deleted_at: DataTypes.DATE,
  }, {
    tableName: 'teams',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['slug'], where: { deleted_at: null } },
    ],
  });

  return Team;
};
