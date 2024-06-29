import { verifyGatewayRequest } from '@thesoftwaremasons/jobber-shared';
import { Application } from 'express';

import { authRoutes } from './routes/auth';
const BASE_PATH = '/api/v1/auth';
export function appRoutes(app: Application): void {
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
}
