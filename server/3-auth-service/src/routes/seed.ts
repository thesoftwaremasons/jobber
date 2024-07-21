import { create } from '@auth/controller/seeds';
import express, { Router } from 'express';

const router: Router = express.Router();

export function seedRoutes(): Router {
  router.put('/seed/:count', create);
  return router;
}
