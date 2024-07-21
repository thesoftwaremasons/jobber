import crypto from 'crypto';

import { createAuthUser, getAuthUserByUserNameOrEmail } from '@auth/service/auth.service';
import { faker } from '@faker-js/faker';
import { v4 as uuidV4 } from 'uuid';
import { BadRequestError, firstLetterUppercase, IAuthDocument } from '@thesoftwaremasons/jobber-shared';
import { Request, Response } from 'express';
import { generateUsername } from 'unique-username-generator';
import { sample } from 'lodash';
import { StatusCodes } from 'http-status-codes';

export async function create(req: Request, res: Response): Promise<void> {
  const { count } = req.params;
  const usernames: string[] = [];
  for (let i = 0; i < parseInt(count, 10); i++) {
    const username: string = generateUsername('', 0, 12);
    usernames.push(firstLetterUppercase(username));
  }
  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    const email = faker.internet.email();
    const password = 'qwerty';
    const country = faker.location.country();
    const profilePicture = faker.image.urlPicsumPhotos();
    const checkIfUserExist: IAuthDocument = await getAuthUserByUserNameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials, Email or Username', 'Seed create() method error');
    }
    const profilePublicId = uuidV4();
    const randBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randCharacters: string = randBytes.toString('hex');
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),

      profilePublicId,
      password,
      country,
      email,
      profilePicture: profilePicture,
      emailVerificationToken: randCharacters,
      emailVerified: sample([0, 1])
    } as IAuthDocument;
    await createAuthUser(authData);
  }
  res.status(StatusCodes.OK).json({ message: 'seed users created successfully' });
}
