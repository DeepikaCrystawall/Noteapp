export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    CREATE TYPE notification_type AS ENUM (
      'note_shared', 'mention', 'new_collaborator', 'note_updated', 'team_invite', 'system'
    )
  `);

  await queryInterface.createTable('notifications', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    type: { type: 'notification_type', allowNull: false },
    title: { type: Sequelize.STRING(255), allowNull: false },
    message: { type: Sequelize.TEXT, allowNull: false },
    data: { type: Sequelize.JSONB, defaultValue: {} },
    is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    read_at: Sequelize.DATE,
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    deleted_at: Sequelize.DATE,
  });

  await queryInterface.addIndex('notifications', ['user_id']);
  await queryInterface.addIndex('notifications', ['user_id', 'is_read']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('notifications');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS notification_type');
}
