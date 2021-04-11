import { ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { API, ParamError, ResultError } from '../../type';
import logger from './logger';

/**
 * 未知请求时处理的中间件
 * @param response 
 */
const unknownEndpoint = (_: Request, response: Response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

const requestLogger: RequestHandler = (request, _res, next) => {
    logger.info('Method:', request.method);
    logger.info('Path:  ', request.path);
    logger.info('Body:  ', request.body);
    logger.info('---');
    next();
};

const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
    logger.reqError(`cause by: ${error.message}`);

    if (error instanceof ResultError) {
        return response.status(500).json(
            API.createFailResponse("Server handle error!"));
    } else if (error instanceof ParamError) {
        return response.status(400).json(
            API.createFailResponse(error.message));
    }

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: 'validation error' });
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        });
    }
    // logger.error(error.message);
    return next(error);
};

export default {
    unknownEndpoint,
    requestLogger,
    errorHandler
};