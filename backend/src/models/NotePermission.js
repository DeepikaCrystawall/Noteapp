import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const NotePermission = sequelize.define('NotePermission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    note_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING(20),
      defaultValue: 'read',
    },
    granted_by: DataTypes.UUID,
    deleted_at: DataTypes.DATE,
  }, {
    tableName: 'note_permissions',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['note_id'] },
      { fields: ['user_id'] },
      { unique: true, fields: ['note_id', 'user_id'] },
    ],
  });

  return NotePermission;
};
