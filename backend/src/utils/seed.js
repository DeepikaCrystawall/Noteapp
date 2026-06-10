import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Sequelize } from 'sequelize';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { default: config } = await import('../config/index.js');
const { default: logger } = await import('../config/logger.js');
const { default: initModels } = await import('../models/index.js');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const models = initModels(sequelize);
const { User, Team, TeamMember, Note, Tag, NoteTag } = models;

const SEED_IDS = {
  alice: 'a0000000-0000-4000-8000-000000000001',
  bob: 'a0000000-0000-4000-8000-000000000002',
  carol: 'a0000000-0000-4000-8000-000000000003',
  team: 'b0000000-0000-4000-8000-000000000001',
  note1: 'c0000000-0000-4000-8000-000000000001',
  note2: 'c0000000-0000-4000-8000-000000000002',
  tag1: 'd0000000-0000-4000-8000-000000000001',
  tag2: 'd0000000-0000-4000-8000-000000000002',
};

const runSeeds = async () => {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const seedUsers = [
    { id: SEED_IDS.alice, name: 'Alice Admin', email: 'alice@noteapp.com', email_verified: true },
    { id: SEED_IDS.bob, name: 'Bob Editor', email: 'bob@noteapp.com', email_verified: true },
    { id: SEED_IDS.carol, name: 'Carol Viewer', email: 'carol@noteapp.com', email_verified: true },
  ];

  for (const user of seedUsers) {
    const existing = await User.findOne({ where: { email: user.email } });
    if (existing) {
      await existing.update({ password_hash: passwordHash, name: user.name, email_verified: true });
    } else {
      await User.create({ ...user, password_hash: passwordHash });
    }
  }

  await Team.findOrCreate({
    where: { slug: 'engineering' },
    defaults: {
      id: SEED_IDS.team,
      name: 'Engineering',
      description: 'Engineering team notes',
      slug: 'engineering',
      owner_id: SEED_IDS.alice,
    },
  });

  await TeamMember.bulkCreate([
    { team_id: SEED_IDS.team, user_id: SEED_IDS.alice, role: 'owner', joined_at: new Date() },
    { team_id: SEED_IDS.team, user_id: SEED_IDS.bob, role: 'editor', joined_at: new Date() },
    { team_id: SEED_IDS.team, user_id: SEED_IDS.carol, role: 'viewer', joined_at: new Date() },
  ], { ignoreDuplicates: true });

  await Note.bulkCreate([
    { id: SEED_IDS.note1, title: 'Welcome to NoteApp', content: 'This is your first collaborative note. Start editing!', owner_id: SEED_IDS.alice, team_id: SEED_IDS.team },
    { id: SEED_IDS.note2, title: 'Meeting Notes', content: '## Agenda\n- Project kickoff\n- Team introductions', owner_id: SEED_IDS.alice, team_id: SEED_IDS.team },
  ], { ignoreDuplicates: true });

  await Tag.bulkCreate([
    { id: SEED_IDS.tag1, name: 'important', color: '#ef4444', user_id: SEED_IDS.alice, team_id: SEED_IDS.team },
    { id: SEED_IDS.tag2, name: 'meeting', color: '#3b82f6', user_id: SEED_IDS.alice, team_id: SEED_IDS.team },
  ], { ignoreDuplicates: true });

  await NoteTag.bulkCreate([
    { note_id: SEED_IDS.note1, tag_id: SEED_IDS.tag1 },
    { note_id: SEED_IDS.note2, tag_id: SEED_IDS.tag2 },
  ], { ignoreDuplicates: true });

  logger.info('Seeding completed successfully');
};

try {
  await runSeeds();
  await sequelize.close();
  process.exit(0);
} catch (error) {
  logger.error('Seeding failed', { error: error.message });
  await sequelize.close();
  process.exit(1);
}
