/** @param {import('sequelize').QueryInterface} queryInterface */
/** @param {import('sequelize').Sequelize} Sequelize */
export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await queryInterface.createTable('users', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    name: { type: Sequelize.STRING(255), allowNull: false },
    email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    password_hash: { type: Sequelize.STRING(255), allowNull: false },
    avatar_url: Sequelize.TEXT,
    email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    reset_token: Sequelize.STRING(255),
    reset_token_expires_at: Sequelize.DATE,
    last_login_at: Sequelize.DATE,
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    deleted_at: Sequelize.DATE,
  });

  await queryInterface.addIndex('users', ['email'], { where: { deleted_at: null } });
  await queryInterface.addIndex('users', ['deleted_at']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('users');
}
