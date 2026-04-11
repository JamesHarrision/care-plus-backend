import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/care_plus_db';

    // Use memory server if specifically requested
    if (mongoUri === 'memory') {
      console.log('Starting MongoDB Memory Server inside RAM...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
