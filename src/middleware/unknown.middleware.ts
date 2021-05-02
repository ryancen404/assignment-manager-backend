import { Request, Response } from 'express';
/**
 * 未知请求时处理的中间件
 * @param response 
 */
const unknownEndpoint = (_: Request, response: Response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

export default unknownEndpoint;