import crypto from 'crypto';

import { getAuthUserByEmail, getAuthUserById, updateVerifyEmailField } from '@auth/service/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from '@thesoftwaremasons/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { lowerCase } from 'lodash';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';

export async function read(req: Request, res: Response) {
  let user = null;
  const existingUser: IAuthDocument = await getAuthUserById(req.currentUser!.id);
  if (Object.keys(existingUser).length) {
    user = existingUser;
  }
  res.status(StatusCodes.OK).json({ message: 'Authenticated user', user });
}
export async function resendEmail(req: Request, res: Response): Promise<void> {
  const { email, userId } = req.body;
  const checkIfUserExist: IAuthDocument = await getAuthUserByEmail(lowerCase(email));
  if (!checkIfUserExist) {
    throw new BadRequestError('Email is invalid', 'Current  resendEmail() method error');
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomString: string = await randomBytes.toString('hex');
  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_tokens=${randomString}`;
  await updateVerifyEmailField(parseInt(userId), 0, randomString);

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: email,
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify Email Message has been sent to notification service'
  );
  const updatedUser = await getAuthUserById(parseInt(userId));
  res.status(StatusCodes.OK).json({ message: 'Email Verification Sent', user: updatedUser });
}
