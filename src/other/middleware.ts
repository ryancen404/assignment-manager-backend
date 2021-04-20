import { ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { API } from '../controller/request.type';
import jwt from "jsonwebtoken";
import { createFailResponse, StatusCode } from '../controller/api.helper';
import logger from '../utils/logger';
import { AuthorizationError, ParamError, ResultError } from './customError';
import config from '../utils/config';

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
        return response.status(StatusCode.serverError).json(createFailResponse("Server handle error!"));
    } else if (error instanceof ParamError) {
        //请求参数错误
        return response.status(StatusCode.paramsError).json(createFailResponse(error.message));
    } else if (error instanceof AuthorizationError) {
        // token校验失败统一返回
        return response.status(StatusCode.authenticatorError).json(createFailResponse(error.message));
    }
    response.status(StatusCode.serverError).json("Unkown Error!");
    return next(error);
};

/**
 * 在所有业务路由之前中间件，用于校验Token的正确性，异常统一封装成 [AuthorizationError]
  */
const tokenHandler: RequestHandler = (request, _, next) => {
    const routerPath = request.path.toString();
    // 过滤登陆和注册请求
    if (routerPath.indexOf('login') === -1 && routerPath.indexOf('signup') === -1) {
        const token = request.get('Authorization');
        if (token !== undefined) {
            try {
                const decodeUserToken = jwt.verify(token, config.TOKEN_SECRET);
                if (isUserToken(decodeUserToken)) {
                    // 注意不要覆盖
                    request.params["account"] = decodeUserToken.account;
                    request.params["userId"] = decodeUserToken.id;
                    request.params["userType"] = decodeUserToken.type.toString();
                }
            } catch (error) {
                logger.reqError("token check error, maybe is JsonWebTokenError. Detail:", error);
                throw new AuthorizationError("token missing or invalid");
            }
        } else {
            throw new AuthorizationError("token missing or invalid");
        }
    }
    return next();
};

/**
 * 如果本地篡改了这个Token这里解析的结果不会为true
 * @param object 解析出来的Token对象
 * @returns 该对象是否是UserToken对象
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUserToken = (object: any): object is API.UserToken => {
    return "account" in object && "id" in object && "type" in object;
};


export default {
    unknownEndpoint,
    requestLogger,
    errorHandler,
    tokenHandler
};