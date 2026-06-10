import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Note = sequelize.define(
    "Note",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: "Untitled",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      team_id: DataTypes.UUID,
      is_archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: DataTypes.DATE,
    },
    {
      tableName: "notes",
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        { fields: ["owner_id"] },
        { fields: ["team_id"] },
        { fields: ["is_archived"] },
        { fields: ["updated_at"] },
      ],
    },
  );

  return Note;
};
