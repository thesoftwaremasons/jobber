import { getUserByUsername, signToken } from '@auth/service/auth.service';
import { BadRequestError } from '@thesoftwaremasons/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function token(req: Request, res: Response): Promise<void> {
  const existingUser = await getUserByUsername(req.params.username);
  if (!existingUser) {
    throw new BadRequestError('invalid username', 'error in token()');
  }
  const userJwt: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
  res.status(StatusCodes.OK).json({ message: 'RefreshToken', user: existingUser, token: userJwt });
}
