import express from 'express';
import cors from "cors";
import assignmentRouter from "./controller/assignments";
import classRouter from "./controller/class";
import usersRouter from "./controller/users";
import middleware from './utils/middleware';

const app = express();
// config tool middleware before router handle
app.use(express.json());
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cors());
app.use(middleware.requestLogger);

// config router middleware
app.use('/api/assignment', assignmentRouter);
app.use('api/class', classRouter);
app.use('api/user', usersRouter);

app.get('/ping', (_req, res) => {
  console.log('someone pinged here');
  res.send('pong');
});

// config middleware after router
app.use(middleware.unknownEndpoint);

export default app;