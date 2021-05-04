import { ErrorRequestHandler } from "express";
import MiddlewareConfig from "../config/middleware.config";
import { createFailResponse, StatusCode } from "../other/api.helper";
import { AuthorizationError, ParamError, ResultError } from "../other/custom.error";

const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  MiddlewareConfig.logger(`cause by: ${error}`);

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
  response.status(StatusCode.serverError).json(createFailResponse("unkown Error!"));
  return next(error);
};

export default errorHandler;