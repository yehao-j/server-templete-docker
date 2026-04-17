import cors from 'cors';
import express from 'express';
import { apiResponseMiddleware, asyncHandler, errorHandler, AuthError, ServerError } from './http.js';
import { httpLogger, logger } from './logger.js';
import { getRedisClient, getRedisUrl } from './redis.js';

export function createApp(clientOrigin: string) {
    const app = express();

    app.use(
        cors({
            origin: clientOrigin
        })
    );
    app.use(httpLogger);
    app.use(express.json());
    app.use(apiResponseMiddleware);

    app.get('/api/health', (_request, response) => {
        const value = process.env.ENV_TEST_MESSAGE_PRODUCTION;
        return response.success({
            envMessage: value ?? ''
        });
    });

    app.get('/api/business-error', (_request, response) => {
        return response.businessError('这是一个业务逻辑错误示例');
    });

    app.get('/api/server-error', (_request, response) => {
        return response.serverError('这是一个服务端错误示例222');
    });

    app.get('/api/auth-error', (_request, _response) => {
        throw new AuthError();
    });

    app.get('/api/redis/test', asyncHandler(async (_request, response) => {
        const key = 'atomicserver:redis:test';
        const value = `connected:${new Date().toISOString()}`;
        const redisClient = await getRedisClient();

        try {
            await redisClient.set(key, value, {
                EX: 60
            });

            const storedValue = await redisClient.get(key);

            return response.success(
                {
                    key,
                    redisUrl: getRedisUrl(),
                    value: storedValue
                },
                'Redis 访问成功。'
            );
        } catch (error) {
            throw new ServerError(
                'Redis 访问失败。',
                500
            );
        }
    }));

    app.use(errorHandler);

    return app;
}
