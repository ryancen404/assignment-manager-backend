import express from 'express';
import cors from "cors";
import assignmentRouter from "./controller/assignments";

const app = express();
// config tool middleware before router handle
app.use(express.json());
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cors());

// config router middleware
app.use(assignmentRouter);

app.get('/ping', (_req, res) => { 
  console.log('someone pinged here');
  res.send('pong');
});

export default app;