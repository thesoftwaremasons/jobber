import { config } from '@users/config';
import express, { Express } from 'express';
import { start } from '@users/server';

import { databaseConnection } from './database';

const initialize = (): void => {
  databaseConnection();
  config.cloudinaryConfig();
  const app: Express = express();
  start(app);
};

initialize();
