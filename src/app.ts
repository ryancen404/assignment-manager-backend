/* eslint-disable @typescript-eslint/no-non-null-assertion */
import express from 'express';
import cors from "cors";
import mongoose from 'mongoose';
import assignmentRouter from "./controller/assignment";
import classRouter from "./controller/class";
import teacherRouter from "./controller/tacher";
import middleware from './utils/middleware';
import config from './utils/config';
import logger from './utils/logger';

const app = express();

logger.info('connect the db url:', config.MONGODB_URL);
// connect to mongodb
mongoose.connect(config.MONGODB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  auth: {
    user: config.USER_NAME,
    password: config.PASSWORD
  }
})
  .then(() => {
    logger.info("connect to MongoDB");
  })
  .catch((error) => {
    logger.error("can't connect to MongoDB:", error.message);
  });

// config tool middleware before router handle
app.use(express.json());
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cors());
app.use(middleware.requestLogger);

// config router middleware
app.use('/api/assignment', assignmentRouter);
app.use('api/class', classRouter);
app.use('api/user/teacher', teacherRouter);

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

// config middleware after router
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;