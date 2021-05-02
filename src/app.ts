import express from 'express';
import cors from "cors";
import assignmentRouter from "./controller/assignment.controller";
import classRouter from "./controller/class.controller";
import teacherRouter from "./controller/teacher.controller";
import loginRouter from './controller/login.controller';
import studentRouter from './controller/students.controller';
import fileRouter from './controller/files.controller';
import debug from 'debug';
import requestLogger from './middleware/logger.middleware';
import tokenHandler from './middleware/token.middleware';
import unknownEndpoint from './middleware/unknown.middleware';
import errorHandler from './middleware/error.middleware';
import DbConfig from './config/db.config';

const app = express();

// App Tag logcat
export const AppLogger = debug("App")

// Db init
DbConfig.init();

// config tool middleware before router handle
app.use(express.json());
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cors());
app.use(requestLogger);
app.use(tokenHandler);

// config router middleware
app.use('/api/login', loginRouter);
app.use('/api/assignment', assignmentRouter);
app.use('/api/class', classRouter);
app.use('/api/user/teacher', teacherRouter);
app.use('/api/user/student', studentRouter);
app.use('/api/files', fileRouter);

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

// config middleware after router
app.use(unknownEndpoint);
app.use(errorHandler);

export default app;