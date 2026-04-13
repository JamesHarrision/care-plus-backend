import dotenv from 'dotenv'
dotenv.config();

import app from './app';
import { connectMongoDB } from './config/mongo.config';
import { connectRabbitMQ } from './config/rabbitmq.config';
import { initializeFirebaseAdmin } from './config/fcm.config';
import { startNotificationWorker } from './workers/notification.worker';
import { startMedicationCronJob } from './workers/medication.cron';

const PORT = process.env.PORT;

const startServer = async () => {
  await connectMongoDB();
  await connectRabbitMQ();
  initializeFirebaseAdmin();
  app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
    // Start worker and crons after server listens
    startNotificationWorker();
    startMedicationCronJob();
  });
};

startServer();
