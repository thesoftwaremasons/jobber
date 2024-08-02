import crypto from 'crypto';

import { changePasswordSchema, emailSchema } from '@auth/schemes/password';
import {
  getAuthUserByPasswordToken,
  getUserByEmail,
  getUserByUsername,
  updatePassword,
  updatePasswordToken
} from '@auth/service/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from '@thesoftwaremasons/jobber-shared';
import { Request, Response } from 'express';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';
import { AuthModel } from '@auth/model/auth.schema';

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(emailSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password create() method error');
  }
  const { email } = req.body;
  const existingUser: IAuthDocument | undefined = await getUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError('Invalid Credentials', 'Password create() method error');
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomString: string = randomBytes.toString('hex');
  const date: Date = new Date();
  date.setHours(date.getDate() + 1);
  await updatePasswordToken(existingUser.id!, randomString, date);
  const resetLink = `${config.CLIENT_URL}/reset_password?token=${randomString}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.username,
    resetLink,
    username: existingUser.username,
    template: 'forgotPassword'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Forgot password message sent to notification service'
  );
  res.status(StatusCodes.OK).json({ message: 'Password reset email is sent' });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(emailSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password create() method error');
  }
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  if (password !== confirmPassword) {
    throw new BadRequestError('Passwords do not match', 'Password resetPassword() method error');
  }
  const existingUser: IAuthDocument = await getAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError('token not found or expired', 'Password resetPassword() method error');
  }
  const hashedPasswords = await AuthModel.prototype.hashPassword(password);
  await updatePassword(existingUser.id!, hashedPasswords);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Reset password message sent to notification service'
  );

  res.status(StatusCodes.OK).json({ message: 'Password has been successfully updated' });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password create() method error');
  }
  const { currentPassword, newPassword } = req.body;

  if (currentPassword !== newPassword) {
    throw new BadRequestError('Passwords do not match', 'Password changePassword() method error');
  }
  const existingUser: IAuthDocument | undefined = await getUserByUsername(`${req.currentUser?.username}!`);
  if (!existingUser) {
    throw new BadRequestError('Invalid Password', 'Password changePassword() method error');
  }
  const hashedPasswords = await AuthModel.prototype.hashPassword(newPassword);
  await updatePassword(existingUser.id!, hashedPasswords);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Password change success message sent to notification service'
  );

  res.status(StatusCodes.OK).json({ message: 'Password has been changed successfully' });
}
