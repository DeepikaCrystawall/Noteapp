import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const NoteVersion = sequelize.define('NoteVersion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    note_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'note_versions',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['note_id'] },
      { fields: ['created_by'] },
      { unique: true, fields: ['note_id', 'version_number'] },
    ],
  });

  return NoteVersion;
};
