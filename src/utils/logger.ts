const info = (...params: unknown[]) => {
    if (process.env.NODE_ENV === 'test') {
        console.log(...params);
    }
};

const error = (...params: unknown[]) => {
    console.error(...params);
};

const reqError = (...params: unknown[]) => {
    error("[Request] error =>", params);
};

export default {
    info,
    error,
    reqError
};