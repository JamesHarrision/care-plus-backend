import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './config/prisma.config';
import { redisClient } from './config/redis.config';
import authRoutes from './routes/auth.route';
import familyRoutes from './routes/family.route';
import userRoutes from './routes/user.route';
import aiRoutes from './routes/ai.route';

import startSwagger from './config/swagger.config';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - System
 *     summary: Health check
 *     description: Returns a readiness payload after touching Prisma and writing a short-lived Redis test key.
 *     responses:
 *       '200':
 *         description: Application is reachable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to Care+
 *                 status:
 *                   type: string
 *                   example: success
 *       '500':
 *         description: Internal server error.
 */
// Test route
app.get('/', async (req, res) => {
  const user = await prisma.user.count();
  console.log('Prisma DB connect successfully, user count: ', user);

  redisClient.SET('test', 'redis', { EX: 30 });

  res.status(200).json({
    message: 'Welcome to Care+',
    status: 'success',
  });
});

startSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);

export default app;
