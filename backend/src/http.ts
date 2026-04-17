import type { NextFunction, Request, Response } from 'express';
import { logger } from './logger.js';

type SuccessPayload<T> = {
    code: 0;
    data?: T;
    msg: string;
};

type ErrorPayload = {
    code: number;
    msg: string;
};

declare module 'express-serve-static-core' {
    interface Response {
        success<T>(data?: T, msg?: string): Response;
        businessError(msg?: string, code?: number): Response;
        serverError(msg?: string, httpCode?: number): Response;
    }
}

export class BusinessError extends Error {
    readonly code: number;

    constructor(msg: string, code = -1) {
        super(msg);
        this.name = 'BusinessError';
        this.code = code;
    }
}

export class ServerError extends Error {
    readonly httpCode: number;

    constructor(msg = '服务器内部错误', httpCode = 500) {
        super(msg);
        this.name = 'ServerError';
        this.httpCode = httpCode;
    }
}

export class AuthError extends ServerError {
    readonly code: number;

    constructor(msg = 'Token 无效、已过期或缺失，请重新登录后再试') {
        super(msg, 401);
        this.name = 'AuthError';
        this.code = -1;
    }
}

function sendSuccess<T>(response: Response, data?: T, msg = 'success') {
    const payload: SuccessPayload<T> = {
        code: 0,
        data,
        msg
    };

    return response.status(200).json(payload);
}

function sendBusinessError(
    response: Response,
    msg = '业务处理失败',
    code = -1
) {
    const payload: ErrorPayload = {
        code,
        msg
    };

    return response.status(200).json(payload);
}

function sendServerError(
    response: Response,
    msg = '服务器内部错误',
    httpCode = 500
) {
    const payload: ErrorPayload = {
        code: -1,
        msg
    };

    return response.status(httpCode).json(payload);
}

export function apiResponseMiddleware(_request: Request, response: Response, next: NextFunction) {
    response.success = function success<T>(data?: T, msg = 'success') {
        return sendSuccess(this, data, msg);
    };

    response.businessError = function businessError(
        msg = '业务处理失败',
        code = -1
    ) {
        return sendBusinessError(this, msg, code);
    };

    response.serverError = function serverError(
        msg = '服务器内部错误',
        httpCode = 500
    ) {
        return sendServerError(this, msg, httpCode);
    };

    next();
}

export function asyncHandler(
    handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>
) {
    return function wrappedHandler(request: Request, response: Response, next: NextFunction) {
        void handler(request, response, next).catch(next);
    };
}

export function errorHandler(
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction
) {
    if (error instanceof BusinessError) {
        return response.businessError(error.message, error.code);
    }

    if (error instanceof AuthError) {
        return response.status(error.httpCode).json({
            code: error.code,
            msg: error.message
        });
    }

    if (error instanceof ServerError) {
        logger.error({ err: error }, error.message);
        return response.serverError(error.message, error.httpCode);
    }

    logger.error({ err: error }, '未处理的服务端异常');

    return response.serverError('服务器内部错误');
}
