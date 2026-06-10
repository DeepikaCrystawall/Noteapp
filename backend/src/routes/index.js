import { Router } from 'express';
import authRoutes from './auth.routes.js';
import teamRoutes from './team.routes.js';
import noteRoutes from './note.routes.js';
import notificationRoutes from './notification.routes.js';
import { healthCheck } from '../config/database.js';
import { healthCheckRedis } from '../config/redis.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const [db, redis] = await Promise.all([healthCheck(), healthCheckRedis()]);
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: { database: !!db, redis },
    });
  } catch (error) {
    res.status(503).json({ success: false, status: 'unhealthy', error: error.message });
  }
});

router.use('/auth', authRoutes);
router.use('/teams', teamRoutes);
router.use('/notes', noteRoutes);
router.use('/notifications', notificationRoutes);

export default router;
