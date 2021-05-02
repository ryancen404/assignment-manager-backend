import mongoose from 'mongoose';
import { AppLogger } from '../app';
import config from './env.config';

// connect to mongodb
const init = () => {
  AppLogger('connect the db url:', config.MONGODB_URL);
  mongoose.connect(config.MONGODB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
      user: config.USER_NAME,
      password: config.PASSWORD
    }
  }).then(() => {
    AppLogger("connect to MongoDB");
  }).catch((error) => {
    AppLogger("can't connect to MongoDB:", error.message);
  });
}

const DbConfig = {
  init
}

export default DbConfig