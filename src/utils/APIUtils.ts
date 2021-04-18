import { API } from '../controller/requestType';
import { ParamError, ResultError } from '../other/customError';

/**
 * 用于判断请求处理结果是否正确
 */
export const checkResultCorrected = (result: unknown | undefined | false) => {
    if (!result) {
        throw new ResultError('the final result is Error');
    }
};

const isString = (text: unknown): text is string => {
    return typeof text === 'string' || text instanceof String;
};

const isNumber = (n: unknown): n is number => {
    return typeof n === "number" || n instanceof Number;
};

export const isDate = (date: string): boolean => {
    return Boolean(Date.parse(date));
};


/**
 * 参数校验
 */
export const parseString = (text: unknown, name?: string): string => {
    if (!text || !isString(text)) {
        throw new ParamError(`Incorrect or missing ${name}: ` + text);
    }
    return text;
};

export const parseNumber = (n: unknown, name?: string): number => {
    if(!n || !isNumber(n)) {
        throw new ParamError(`Incorrect or missing ${name}: ` + n);
    }
    return n;
};

/**
 * 创建成功的响应结果
 * @param object 处理结果
 * @returns 成功的Response
 */
export const createSucessResponse = (object: unknown): API.BaseResponse => {
    return {
        statusCode: 1,
        content: object
    };
};

export const createEmptySucessResponse = (): API.BaseResponse => {
    return {
        statusCode: 1
    };
};

export const createFailResponse = (message: string): API.BaseResponse => {
    return {
        statusCode: 0,
        message
    };
};