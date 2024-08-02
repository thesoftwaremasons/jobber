import { email, currentUserName, userName } from '@users/controllers/buyer/get';
import express, { Router } from 'express';

const router: Router = express.Router();

const buyerRoutes = (): Router => {
  router.get('/email', email);
  router.get('/username', currentUserName);
  router.get('/:username', userName);

  return router;
};
export { buyerRoutes };
