import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: DataTypes.UUID,
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entity_id: DataTypes.UUID,
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    ip_address: DataTypes.INET,
    user_agent: DataTypes.TEXT,
  }, {
    tableName: 'activity_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['created_at'] },
    ],
  });

  return ActivityLog;
};
