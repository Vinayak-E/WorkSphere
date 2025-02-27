import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect().catch((err) => {
  console.log('Redis connection error:', err);
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error:', err);
});
