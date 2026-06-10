export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer')
  `);

  await queryInterface.createTable('team_members', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    team_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'teams', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    role: { type: 'team_role', allowNull: false, defaultValue: 'viewer' },
    invited_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    invited_at: Sequelize.DATE,
    joined_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    deleted_at: Sequelize.DATE,
  });

  await queryInterface.addConstraint('team_members', {
    fields: ['team_id', 'user_id'],
    type: 'unique',
    name: 'team_members_unique',
  });
  await queryInterface.addIndex('team_members', ['team_id']);
  await queryInterface.addIndex('team_members', ['user_id']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('team_members');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS team_role');
}
