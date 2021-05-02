import jwt from 'jsonwebtoken';
import { RequestHandler } from "express";
import MiddlewareConfig from "../config/middleware.config";
import RouterConfig from "../config/router.config";
import { AuthorizationError } from "../other/custom.error";
import EnvConfig from '../config/env.config';
import { API } from '../controller/request.type';

/**
 * 在所有业务路由之前中间件，用于校验Token的正确性，异常统一封装成 [AuthorizationError]
  */
const tokenHandler: RequestHandler = (request, _, next) => {
    const routerPath = request.path.toString();
    // 是否在不检查Token的path中
    const paths = RouterConfig.getNoTokenCheckPaths();
    const result = paths.find(p => routerPath.indexOf(p) !== -1);
    if (!result) {
        const token = request.get('Authorization');
        if (token !== undefined) {
            try {
                const decodeUserToken = jwt.verify(token, EnvConfig.TOKEN_SECRET);
                if (isUserToken(decodeUserToken)) {
                    // 注意不要覆盖
                    request.body.account = decodeUserToken.account;
                    request.body.userId = decodeUserToken.id;
                    request.body.userType = decodeUserToken.type;
                }
            } catch (error) {
                MiddlewareConfig.logger("token check error, maybe is JsonWebTokenError. Detail:", error);
                throw new AuthorizationError("token missing or invalid!");
            }
        } else {
            throw new AuthorizationError("token missing or invalid!");
        }
    }
    next();
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

export default tokenHandler;