// 自定义错误
/**
 * 请求最终处理的结果错误
 */
export class ResultError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'ResultError';
    }
}
/**
 * 参数解析错误
 */
export class ParamError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'ParamError';
    }
}

export class AuthorizationError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'AuthorizationError';
    }
}