import app from "./app";
import http from 'http';

const server = http.createServer(app);

server.listen(3001, () => {
  console.log(`Server running on 3001`);
});