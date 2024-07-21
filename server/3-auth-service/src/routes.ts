import { verifyGatewayRequest } from '@thesoftwaremasons/jobber-shared';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth';

import { currentUserRoutes } from './routes/current-user';
import { searchRoutes } from './routes/search';
import { seedRoutes } from './routes/seed';

const BASE_PATH = '/api/v1/auth';
export function appRoutes(app: Application): void {
  app.use('', currentUserRoutes());
  app.use(BASE_PATH, seedRoutes());
  app.use(BASE_PATH, searchRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
}
