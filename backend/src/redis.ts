import { createClient } from 'redis';
import { logger } from './logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

type AppRedisClient = ReturnType<typeof createClient>;

let redisClient: AppRedisClient | null = null;
let connectPromise: Promise<AppRedisClient> | null = null;

function buildRedisClient(): AppRedisClient {
    const client = createClient({
        url: redisUrl
    });

    client.on('error', (error) => {
        logger.error({ err: error, redisUrl }, 'Redis client error');
    });

    return client;
}

export async function getRedisClient() {
    if (redisClient?.isOpen) {
        return redisClient;
    }

    if (!redisClient) {
        redisClient = buildRedisClient();
    }

    if (!connectPromise) {
        const client = redisClient;

        connectPromise = client
            .connect()
            .then(() => client)
            .catch((error) => {
                connectPromise = null;

                if (redisClient) {
                    redisClient.destroy();
                    redisClient = null;
                }

                throw error;
            });
    }

    const client = await connectPromise;
    connectPromise = null;
    return client;
}

export function getRedisUrl() {
    return redisUrl;
}
