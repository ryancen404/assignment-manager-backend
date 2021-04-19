import { ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { createFailResponse } from '../utils/APIUtils';
import logger from '../utils/logger';
import { ParamError, ResultError } from './customError';

/**
 * 未知请求时处理的中间件
 * @param response 
 */
const unknownEndpoint = (_: Request, response: Response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

const requestLogger: RequestHandler = (request, _res, next) => {
    logger.info('------------------[RequestLogger]---------------');
    logger.info('Method: ', request.method);
    logger.info('Path:  ', request.path);
    logger.info('Body:  ', request.body);
    logger.info('------------------[RequestLogger]---------------');
    next();
};

const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
    logger.reqError(`cause by: ${error.message}`);

    if (error instanceof ResultError) {
        // 服务端处理结果错误
        return response.status(500).json(createFailResponse("Server handle error!"));
    } else if (error instanceof ParamError) {
        //请求参数错误
        return response.status(400).json(createFailResponse(error.message));
    }

    // if (error.name === 'CastError') {
    //     return response.status(400).send({ error: 'malformatted id' });
    // } else if (error.name === 'ValidationError') {
    //     return response.status(400).json({ error: 'validation error' });
    // } else if (error.name === 'JsonWebTokenError') {
    //     return response.status(401).json({
    //         error: 'invalid token'
    //     });
    // }
    // logger.error(error.message);
    response.status(500).json("Unkown Error");
    return next(error);
};

export default {
    unknownEndpoint,
    requestLogger,
    errorHandler
};