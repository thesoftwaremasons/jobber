import { IAuthPayload, IBuyerDocument } from '@thesoftwaremasons/jobber-shared';
import { Response } from 'express';

export interface IPramas {
  username?: string;
}
export const buyerMockRequest = (sessionData: IJWT, currentUser?: IAuthPayload | null, params?: IPramas) => ({
  session: sessionData,

  params,
  currentUser
});

export const buyerMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}
export const authUserPayload: IAuthPayload = {
  id: 1,
  username: 'Manny',
  email: 'manny@test.com',
  iat: 1235282483
};
export const buyerDocument: IBuyerDocument = {
  _id: '72yfwdygiwe2',

  username: 'Manny',
  email: 'manny@test.com',
  country: 'Brazil',
  profilePicture: '',
  isSeller: false,
  purchasedGigs: [],
  createdAt: '2023-12-19T07:42:24.431Z'
} as unknown as IBuyerDocument;
