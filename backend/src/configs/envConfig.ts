import 'dotenv/config';

export const envConfig = {
  JWT_SECRETKEY: process.env.JWT_SECRETKEY,
  REDIS_URL: process.env.REDIS_URL,
  MONGODB_URI: process.env.MONGODB_URI,
};
