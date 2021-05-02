import { RequestHandler } from "express";
import MiddlewareConfig from "../config/middleware.config";

const { logger } = MiddlewareConfig;

const requestLogger: RequestHandler = (request, _res, next) => {
  logger('------------------[RequestLogger]---------------');
  logger('Method: ', request.method);
  logger('Path:  ', request.path);
  logger('Body:  ', request.body);
  logger('------------------[RequestLogger]---------------');
  next();
};

export default requestLogger