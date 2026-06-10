import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const NoteTag = sequelize.define('NoteTag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    note_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tag_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'note_tags',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['note_id'] },
      { fields: ['tag_id'] },
      { unique: true, fields: ['note_id', 'tag_id'] },
    ],
  });

  return NoteTag;
};
