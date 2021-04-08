import { Request, RequestHandler, Response } from 'express';
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

export default {
    unknownEndpoint,
    requestLogger
};