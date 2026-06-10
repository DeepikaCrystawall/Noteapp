export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('activity_logs', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    user_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    action: { type: Sequelize.STRING(100), allowNull: false },
    entity_type: { type: Sequelize.STRING(50), allowNull: false },
    entity_id: Sequelize.UUID,
    metadata: { type: Sequelize.JSONB, defaultValue: {} },
    ip_address: Sequelize.INET,
    user_agent: Sequelize.TEXT,
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
  });

  await queryInterface.addIndex('activity_logs', ['user_id']);
  await queryInterface.addIndex('activity_logs', ['entity_type', 'entity_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('activity_logs');
}
