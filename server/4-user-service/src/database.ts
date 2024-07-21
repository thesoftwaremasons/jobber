import { Logger } from 'winston';
import { winstonLogger } from '@thesoftwaremasons/jobber-shared';
import { config } from '@users/config';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersDatabaseServer', 'debug');

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('UserService Mongo database connection has been established successfully');
  } catch (error) {
    log.log('error', 'User Service databaseConnection() method error', error);
  }
};
export { databaseConnection };
