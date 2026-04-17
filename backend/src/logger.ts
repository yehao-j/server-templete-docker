import type { NextFunction, Request, Response } from 'express';
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const MAX_BODY_LOG_LENGTH = 2_000;
const IGNORED_LOG_PATHS = new Set([
    '/.well-known/appspecific/com.chrome.devtools.json'
]);

const transport = isProduction
    ? undefined
    : pino.transport({
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard'
        }
    });

export const logger = pino(
    {
        level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')
    },
    transport
);

function summarizePayload(payload: unknown) {
    if (payload === undefined) {
        return undefined;
    }

    if (Buffer.isBuffer(payload)) {
        return `[Buffer ${payload.byteLength} bytes]`;
    }

    if (typeof payload === 'string') {
        if (payload.length <= MAX_BODY_LOG_LENGTH) {
            return payload;
        }

        return `${payload.slice(0, MAX_BODY_LOG_LENGTH)}...(truncated)`;
    }

    if (payload instanceof Error) {
        return {
            message: payload.message,
            name: payload.name
        };
    }

    if (typeof payload === 'object' && payload !== null) {
        try {
            const serialized = JSON.stringify(payload);

            if (serialized.length > MAX_BODY_LOG_LENGTH) {
                return {
                    preview: `${serialized.slice(0, MAX_BODY_LOG_LENGTH)}...(truncated)`,
                    truncated: true
                };
            }
        } catch {
            return '[Unserializable payload]';
        }
    }

    return payload;
}

function getLogMethod(statusCode: number) {
    if (statusCode >= 500) {
        return logger.error.bind(logger);
    }

    if (statusCode >= 400) {
        return logger.warn.bind(logger);
    }

    return logger.info.bind(logger);
}

export function httpLogger(request: Request, response: Response, next: NextFunction) {
    if (IGNORED_LOG_PATHS.has(request.path)) {
        next();
        return;
    }

    const startedAt = process.hrtime.bigint();
    let responseBody: unknown;
    let hasLoggedResponse = false;

    const originalJson = response.json.bind(response);
    const originalSend = response.send.bind(response);

    response.json = ((body: unknown) => {
        responseBody = body;
        return originalJson(body);
    }) as Response['json'];

    response.send = ((body: unknown) => {
        if (body !== undefined && responseBody === undefined) {
            responseBody = body;
        }

        return originalSend(body);
    }) as Response['send'];

    const logResponse = (message: string) => {
        if (hasLoggedResponse) {
            return;
        }

        hasLoggedResponse = true;

        const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
        const log = getLogMethod(response.statusCode);

        log(
            {
                duration: `${Number(durationSeconds.toFixed(3))} 秒`,
                request: {
                    body: summarizePayload(request.body),
                    method: request.method,
                    query: summarizePayload(request.query),
                    url: request.originalUrl
                },
                response: {
                    body: summarizePayload(responseBody),
                    statusCode: response.statusCode
                }
            },
            message
        );
    };

    response.once('finish', () => {
        logResponse('HTTP response sent');
    });

    response.once('close', () => {
        if (!response.writableFinished) {
            logResponse('HTTP connection closed before response finished');
        }
    });

    next();
}
