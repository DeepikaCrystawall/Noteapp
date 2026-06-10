import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#6366f1',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    team_id: DataTypes.UUID,
    deleted_at: DataTypes.DATE,
  }, {
    tableName: 'tags',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['team_id'] },
      { unique: true, fields: ['name', 'user_id'] },
    ],
  });

  return Tag;
};
