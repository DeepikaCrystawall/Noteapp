export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('tags', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    name: { type: Sequelize.STRING(100), allowNull: false },
    color: { type: Sequelize.STRING(7), defaultValue: '#6366f1' },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    team_id: {
      type: Sequelize.UUID,
      references: { model: 'teams', key: 'id' },
      onDelete: 'CASCADE',
    },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    deleted_at: Sequelize.DATE,
  });

  await queryInterface.addConstraint('tags', {
    fields: ['name', 'user_id'],
    type: 'unique',
    name: 'tags_name_user_unique',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('tags');
}
