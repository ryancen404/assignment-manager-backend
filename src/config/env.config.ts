/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";

// load .env file
dotenv.config();

/**
 * 环境变量配置
 */
const APP_PORT = process.env.APP_PORT!;
const USER_NAME = process.env.USER_NAME!;
const PASSWORD = process.env.PASSWORD!;
const USER_PWD_SALT = parseInt(process.env.USER_PASSWORD_SALT!);
const TOKEN_SECRET = process.env.TOKE_SECRET!;
let MONGODB_URL = process.env.MONGODB_URL!;

if (process.env.NODE_ENV === 'test') {
    MONGODB_URL = process.env.MONGODB_URL_LOCAL!;
}

const EnvConfig = {
    APP_PORT,
    MONGODB_URL,
    USER_NAME,
    PASSWORD,
    USER_PWD_SALT,
    TOKEN_SECRET
};
export default EnvConfig;