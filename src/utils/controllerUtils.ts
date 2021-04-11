import { ParamError, ResultError } from '../../type';

/**
 * 用于判断请求处理结果是否正确
 */
export const checkResultCorrected = (result: unknown | undefined | false) => {
    if (!result) {
        throw new ResultError('the final result is Error');
    }
};


export const isString = (text: unknown): text is string => {
    return typeof text === 'string' || text instanceof String;
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