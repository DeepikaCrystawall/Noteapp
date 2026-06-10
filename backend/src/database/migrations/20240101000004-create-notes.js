export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('notes', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    title: { type: Sequelize.STRING(500), allowNull: false, defaultValue: 'Untitled' },
    content: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
    },
    team_id: {
      type: Sequelize.UUID,
      references: { model: 'teams', key: 'id' },
      onDelete: 'SET NULL',
    },
    is_archived: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_pinned: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_favorite: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    deleted_at: Sequelize.DATE,
  });

  await queryInterface.addIndex('notes', ['owner_id']);
  await queryInterface.addIndex('notes', ['team_id']);
  await queryInterface.addIndex('notes', ['updated_at']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('notes');
}
