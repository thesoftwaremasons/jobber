import { Request, Response } from 'express';
import * as auth from '@auth/service/auth.service';
import * as helper from '@thesoftwaremasons/jobber-shared';
import { read, resendEmail } from '@auth/controller/current-user';

import { authMock, authMockRequest, authMockResponse, authUserPayload } from './mock/auth.mock';

jest.mock('@auth/service/auth.service');
jest.mock('@thesoftwaremasons/jobber-shared');
jest.mock('@auth/queues/auth.producer');
jest.mock('@elastic/elasticsearch');

const USERNAME = 'Manny';
const PASSWORD = 'manny1';
describe('CurrentUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('read method', () => {
    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getAuthUserById').mockResolvedValue(authMock);
      await read(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authenticated user',
        user: authMock
      });
    });
  });

  describe('resend email', () => {
    it('should call BadRequestError for Invalid Email', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getAuthUserByEmail').mockResolvedValue({} as never);
      await resendEmail(req, res).catch(() => {
        expect(helper.BadRequestError).toHaveBeenCalledWith('Email is invalid', 'Current  resendEmail() method error');
      });
    });
    it('should call updateVerifyEmailField method', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getAuthUserByEmail').mockResolvedValue(authMock);
      await resendEmail(req, res);

      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
    });

    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getAuthUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(auth, 'getAuthUserById').mockResolvedValue(authMock);
      await resendEmail(req, res);
      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email Verification Sent',
        user: authMock
      });
    });
  });
});
