import { changePassword, forgotPassword, resetPassword } from '@auth/controller/password';
import { read } from '@auth/controller/sigin';
import { create } from '@auth/controller/signup';
import { update } from '@auth/controller/verify-email';
import express, { Router } from 'express';

const router: Router = express.Router();

export function authRoutes(): Router {
  router.post('/signup', create);
  router.post('/signin', read);
  router.put('/verify-email', update);
  router.put('/forgot-password', forgotPassword);
  router.put('/reset-password/:token', resetPassword);
  router.put('/change-password', changePassword);

  return router;
}
