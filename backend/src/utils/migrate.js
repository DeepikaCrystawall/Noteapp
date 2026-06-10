import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { default: config } = await import('../config/index.js');
const { default: logger } = await import('../config/logger.js');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: false,
});

const migrationsDir = path.join(__dirname, '../database/migrations');
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.js'))
  .sort();

const loadMigration = (migrationPath) => import(pathToFileURL(migrationPath).href);

const umzug = new Umzug({
  migrations: migrationFiles.map((file) => {
    const filePath = path.join(migrationsDir, file);
    return {
      name: file,
      up: async () => {
        const mod = await loadMigration(filePath);
        return mod.up(sequelize.getQueryInterface(), Sequelize);
      },
      down: async () => {
        const mod = await loadMigration(filePath);
        return mod.down(sequelize.getQueryInterface(), Sequelize);
      },
    };
  }),
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    info: (msg) => logger.info(typeof msg === 'object' ? msg.event ?? JSON.stringify(msg) : msg),
    warn: (msg) => logger.warn(typeof msg === 'object' ? msg.event ?? JSON.stringify(msg) : msg),
    error: (msg) => logger.error(typeof msg === 'object' ? msg.event ?? JSON.stringify(msg) : msg),
    debug: (msg) => logger.debug(typeof msg === 'object' ? msg.event ?? JSON.stringify(msg) : msg),
  },
});

const command = process.argv[2] || 'up';

try {
  if (migrationFiles.length === 0) {
    logger.error(`No migration files found in ${migrationsDir}`);
    process.exit(1);
  }

  if (command === 'up') {
    const migrations = await umzug.up();
    if (migrations.length === 0) {
      logger.info('No pending migrations');
    } else {
      logger.info(`Executed ${migrations.length} migration(s)`);
    }
  } else if (command === 'down') {
    const migrations = await umzug.down();
    if (migrations.length === 0) {
      logger.info('No migrations to rollback');
    } else {
      logger.info(`Rolled back ${migrations.length} migration(s)`);
    }
  } else {
    logger.error(`Unknown command: ${command}`);
    process.exit(1);
  }
  await sequelize.close();
  process.exit(0);
} catch (error) {
  logger.error('Migration failed', { error: error.message, stack: error.stack });
  if (error.message?.includes('password authentication failed')) {
    logger.error(
      'Database auth failed. Start Docker Postgres: docker compose up postgres -d\n' +
      'If you use a local PostgreSQL on port 5432, either create the noteapp user or set DB_PORT=5433 in .env'
    );
  }
  await sequelize.close();
  process.exit(1);
}
