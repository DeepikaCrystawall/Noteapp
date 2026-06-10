import { Sequelize } from 'sequelize';
import config from './index.js';
import logger from './logger.js';
import initModels from '../models/index.js';

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    min: config.db.poolMin,
    max: config.db.poolMax,
    idle: 30000,
    acquire: 5000,
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const models = initModels(sequelize);

export const healthCheck = async () => {
  await sequelize.authenticate();
  const [result] = await sequelize.query('SELECT NOW() as now', { type: Sequelize.QueryTypes.SELECT });
  return result;
};

export const getClient = () => sequelize.connectionManager.getConnection();

export { models };
export default sequelize;
