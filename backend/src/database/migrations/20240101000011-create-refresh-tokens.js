export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('refresh_tokens', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    token_hash: { type: Sequelize.STRING(255), allowNull: false },
    expires_at: { type: Sequelize.DATE, allowNull: false },
    revoked_at: Sequelize.DATE,
    replaced_by: {
      type: Sequelize.UUID,
      references: { model: 'refresh_tokens', key: 'id' },
      onDelete: 'SET NULL',
    },
    user_agent: Sequelize.TEXT,
    ip_address: Sequelize.INET,
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
  });

  await queryInterface.addIndex('refresh_tokens', ['user_id']);
  await queryInterface.addIndex('refresh_tokens', ['token_hash']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('refresh_tokens');
}
