import { createClient } from 'redis'

export const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connected successfully'));

// Tự động connect khi file được import
export async function connectRedis(){
  await redisClient.connect();
}
connectRedis();

export default redisClient;
