/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";
// load .env file
dotenv.config();

const APP_PORT = process.env.APP_PORT!;
const USER_NAME = process.env.USER_NAME!;
const PASSWORD = process.env.PASSWORD!;
let MONGODB_URL = process.env.MONGODB_URL!;

if (process.env.NODE_ENV === 'test') {
    MONGODB_URL = process.env.MONGODB_URL_LOCAL!;
}

export default {
    APP_PORT,
    MONGODB_URL,
    USER_NAME,
    PASSWORD
};