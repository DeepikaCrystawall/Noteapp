import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TeamMember = sequelize.define('TeamMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    team_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'viewer',
    },
    invited_by: DataTypes.UUID,
    invited_at: DataTypes.DATE,
    joined_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  }, {
    tableName: 'team_members',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['team_id'] },
      { fields: ['user_id'] },
      { fields: ['role'] },
      { unique: true, fields: ['team_id', 'user_id'] },
    ],
  });

  return TeamMember;
};
