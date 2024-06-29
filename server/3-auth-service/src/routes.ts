import { verifyGatewayRequest } from '@thesoftwaremasons/jobber-shared';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth';

import { currentUserRoutes } from './routes/current-user';
import { Health } from './controller/health';

const BASE_PATH = '/api/v1/auth';
export function appRoutes(app: Application): void {
  app.use('', Health.prototype.health);
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
}
