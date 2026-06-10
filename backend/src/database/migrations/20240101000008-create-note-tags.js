export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('note_tags', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
    note_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'notes', key: 'id' },
      onDelete: 'CASCADE',
    },
    tag_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'tags', key: 'id' },
      onDelete: 'CASCADE',
    },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
  });

  await queryInterface.addConstraint('note_tags', {
    fields: ['note_id', 'tag_id'],
    type: 'unique',
    name: 'note_tags_unique',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('note_tags');
}
