import { AuthModel } from '@auth/model/auth.schema';
import { loginSchema } from '@auth/schemes/sigin';
import { getUserByEmail, getUserByUsername, signToken } from '@auth/service/auth.service';
import { BadRequestError, IAuthDocument, isEmail } from '@thesoftwaremasons/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export async function read(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(loginSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Signin read() method error');
  }

  const { username, password } = req.body;
  const isValidEmail: boolean = isEmail(username);

  const existingUser: IAuthDocument | undefined = !isValidEmail ? await getUserByUsername(username) : await getUserByEmail(username);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'Signin read() method error');
  }
  console.log(existingUser, password);
  const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(password, `${existingUser.password}`);
  if (!passwordsMatch) {
    throw new BadRequestError('Invalid credentials, Password does not match', 'Signin read() method error');
  }
  const userJwt: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
  const userData: IAuthDocument = omit(existingUser, ['password']);
  res.status(StatusCodes.CREATED).json({ messages: 'User Created Successfully', user: userData, token: userJwt });
}
