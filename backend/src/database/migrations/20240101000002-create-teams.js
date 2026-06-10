export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('teams', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    name: { type: Sequelize.STRING(255), allowNull: false },
    description: Sequelize.TEXT,
    slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'RESTRICT',
    },
    avatar_url: Sequelize.TEXT,
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    deleted_at: Sequelize.DATE,
  });

  await queryInterface.addIndex('teams', ['owner_id']);
  await queryInterface.addIndex('teams', ['slug']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('teams');
}
