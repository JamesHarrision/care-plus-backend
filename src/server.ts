import dotenv from 'dotenv'
dotenv.config();

import app from './app';
import { connectMongoDB } from './config/mongo.config';

const PORT = process.env.PORT;

const startServer = async () => {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
  });
};

startServer();