import crypto from 'crypto';
import { promisify } from 'node:util';

import { signupSchema } from '@auth/schemes/signup';
import { createAuthUser, getAuthUserByUserNameOrEmail, signToken } from '@auth/service/auth.service';
import { BadRequestError, firstLetterUppercase, IAuthDocument, IEmailMessageDetails } from '@thesoftwaremasons/jobber-shared';
import cloudinary, { UploadApiErrorResponse, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';

type CloudinaryPromise = (file: string, options: UploadApiOptions) => Promise<UploadApiResponse | undefined>;
const cloudinaryUpload: CloudinaryPromise = promisify(cloudinary.v2.uploader.upload);

export async function create(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(signupSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Signup create() method error');
  }
  const { username, email, password, country, profilePicture } = req.body;
  const checkIfUserExist: IAuthDocument = await getAuthUserByUserNameOrEmail(username, email);
  if (checkIfUserExist) {
    throw new BadRequestError('invalid credentials. Email or Username', 'Signup create() method error');
  }

  const profilePublicId = uuidV4();
  const uploadResult: UploadApiResponse = (await uploadsImage(profilePicture, profilePublicId, true, true)) as UploadApiResponse;
  // const uploadResult: UploadApiResponse = (await uploads(profilePicture, profilePublicId, true, true)) as UploadApiResponse;
  if (!uploadResult.public_id) {
    throw new BadRequestError('File Upload Error. try again', 'Signup create() method error');
  }
  const randBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randCharacters: string = randBytes.toString('hex');
  const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    profilePublicId,
    password,
    country,
    email,
    profilePicture: uploadResult?.secure_url,
    emailVerificationToken: randCharacters
  } as IAuthDocument;

  const result: IAuthDocument = await createAuthUser(authData);
  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_tokens=${authData.emailVerificationToken}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
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
  const userJWt: string = signToken(result.id!, result.email!, result.username!);
  res.status(StatusCodes.CREATED).json({ message: 'User created successfuly', user: result, token: userJWt });
}

export const uploadsImage = (
  file: string,
  public_id: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> =>
  cloudinaryUpload(file, {
    public_id,
    overwrite,
    invalidate,
    resource_type: 'auto'
  });
