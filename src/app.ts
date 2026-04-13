import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './config/prisma.config';
import { redisClient } from './config/redis.config';
import authRoutes from './routes/auth.route';
import familyRoutes from './routes/family.route';
import userRoutes from './routes/user.route';
import aiRoutes from './routes/ai.route';
import medicationStandaloneRoutes from './routes/medication-standalone.route';

import startSwagger from './config/swagger.config';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

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
app.use('/api/medications', medicationStandaloneRoutes);

export default app;
