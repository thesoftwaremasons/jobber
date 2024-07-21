import http from 'http';

import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@thesoftwaremasons/jobber-shared';
import { Application, Request, Response, NextFunction, json, urlencoded } from 'express';
import { Logger } from 'winston';
import { config } from '@users/config';
import cors from 'cors';
import helmet from 'helmet';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection } from '@users/elasticsearch';
import hpp from 'hpp';
import { appRoutes } from '@users/routes';
import { createConnection } from '@users/queues/connection';
import { Channel } from 'amqplib';

import {
  consumeBuyerDirectMessages,
  consumeReviewFanOutMessages,
  consumeSeedDirectMessages,
  consumeSellerDirectMessages
} from './queues/user.consumer';

const SERVER_PORT = 4003;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersServer', 'debug');

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  userErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token: string = req.headers.authorization?.split(' ')[1] as string;
      const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }

    next();
  });
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};
const startQueues = (): void => {
  checkConnection();
};

const startElasticSearch = async (): Promise<void> => {
  const userChannel: Channel = (await createConnection()) as Channel;
  await consumeBuyerDirectMessages(userChannel);
  await consumeSellerDirectMessages(userChannel);
  await consumeReviewFanOutMessages(userChannel);
  await consumeSeedDirectMessages(userChannel);
};
const userErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `Auth service ${error.comingFrom}:`, error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }

    next();
  });
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`User Server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`User Server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'User startServer() method error', error);
  }
};
export { start };
