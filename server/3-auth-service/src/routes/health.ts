import { Health } from '@auth/controller/health';
import express, { Router } from 'express';

const router: Router = express.Router();

export function currentUserRoutes(): Router {
  router.get('/auth-health', Health.prototype.health);

  return router;
}
