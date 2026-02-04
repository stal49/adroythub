import { Redis } from 'ioredis';
require('dotenv').config();

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log('Redis connected');
        return process.env.REDIS_URL;
    }
    return null; // Return null when URL is not set
};

const redisUrl = redisClient();

let redis: Redis;

if (redisUrl) {
  redis = new Redis(redisUrl);
} else {
  console.warn('Redis URL not found, application will start without Redis. Some features may not be available.');
  // Mock Redis client
  redis = {
    get: (key: string, callback?: (err: Error | null, result: string | null) => void) => {
      if (callback) callback(null, null);
      return Promise.resolve(null);
    },
    set: (key: string, value: string, ...args: any[]) => {
      const callback = args.find(arg => typeof arg === 'function');
      if (callback) callback(null, 'OK');
      return Promise.resolve('OK');
    },
    del: (key: string | string[], callback?: (err: Error | null, result: number) => void) => {
        if (callback) callback(null, 1);
        return Promise.resolve(1);
    },
  } as any;
}

export { redis };

