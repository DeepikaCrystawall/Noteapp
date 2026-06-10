export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('note_versions', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    note_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'notes', key: 'id' },
      onDelete: 'CASCADE',
    },
    version_number: { type: Sequelize.INTEGER, allowNull: false },
    title: { type: Sequelize.STRING(500), allowNull: false },
    content: { type: Sequelize.TEXT, allowNull: false },
    created_by: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
    },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
  });

  await queryInterface.addConstraint('note_versions', {
    fields: ['note_id', 'version_number'],
    type: 'unique',
    name: 'note_versions_unique',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('note_versions');
}
