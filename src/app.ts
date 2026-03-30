import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './config/prisma.config';
import { redisClient } from './config/redis.config'
import authRoutes from './routes/auth.route'

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Test route
app.get("/", async (req, res) => {
  const user = await prisma.user.count();
  console.log("Prisma DB connect successfully, user count: ", user);

  redisClient.SET('test', 'redis', {EX: 30});

  res.status(200).json({
    message: "Welcome to Care+",
    status: 'success',
  })
});

app.use('/api/auth', authRoutes);

export default app;

