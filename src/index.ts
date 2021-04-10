import app from "./app";
import http from 'http';
import config from "./utils/config";

const server = http.createServer(app);

server.listen(config.APP_PORT, () => {
  console.log(`Server running on 3001`);
});