import cors from 'cors';
import express from 'express';
import { getRedisClient, getRedisUrl } from './redis.js';

export function createApp(clientOrigin: string) {
  const app = express();

  app.use(
    cors({
      origin: clientOrigin
    })
  );
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({
      ok: true,
      message: '后端服务运行正常。'
    });
  });

  app.get('/api/redis/test', async (_request, response) => {
    const key = 'atomicserver:redis:test';
    const value = `connected:${new Date().toISOString()}`;

    try {
      const redisClient = await getRedisClient();

      await redisClient.set(key, value, {
        EX: 60
      });

      const storedValue = await redisClient.get(key);

      response.json({
        ok: true,
        message: 'Redis 访问成功。',
        redisUrl: getRedisUrl(),
        key,
        value: storedValue
      });
    } catch (error) {
      response.status(500).json({
        ok: false,
        message: 'Redis 访问失败。',
        redisUrl: getRedisUrl(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return app;
}
