import express, { Express } from 'express';
import { databaseConnection } from '@auth/database';
import { start } from '@auth/server';
import { config } from '@auth/config';

const intialize = (): void => {
  config.cloudinaryConfig();

  const app: Express = express();
  databaseConnection();
  start(app);
};

intialize();
