export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    CREATE TYPE permission_level AS ENUM ('read', 'write', 'owner')
  `);

  await queryInterface.createTable('note_permissions', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    note_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'notes', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    permission: { type: 'permission_level', allowNull: false, defaultValue: 'read' },
    granted_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    deleted_at: Sequelize.DATE,
  });

  await queryInterface.addConstraint('note_permissions', {
    fields: ['note_id', 'user_id'],
    type: 'unique',
    name: 'note_permissions_unique',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('note_permissions');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS permission_level');
}
