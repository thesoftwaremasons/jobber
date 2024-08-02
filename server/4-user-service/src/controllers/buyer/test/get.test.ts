import { Request, Response } from 'express';
import * as buyer from '@users/services/buyer.service';
import { currentUserName, email, userName } from '@users/controllers/buyer/get';

import { authUserPayload, buyerDocument, buyerMockRequest, buyerMockResponse } from './mocks/buyer.mock';

jest.mock('@users/services/buyer.service');
jest.mock('@thesoftwaremasons/jobber-shared');
jest.mock('@elastic/elasticsearch');

describe('Buyer Controller', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('email method', () => {
    it('should return buyer profile data', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload) as unknown as Request;
      const res: Response = buyerMockResponse();
      jest.spyOn(buyer, 'getBuyerByEmail').mockResolvedValue(buyerDocument);
      await email(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Buyer Profile', buyer: buyerDocument });
    });
  });

  describe('email method', () => {
    it('should return buyer profile data', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload) as unknown as Request;
      const res: Response = buyerMockResponse();
      jest.spyOn(buyer, 'getBuyerByEmail').mockResolvedValue(buyerDocument);
      await email(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Buyer Profile', buyer: buyerDocument });
    });
  });
  describe('currentUser method', () => {
    it('should return buyer profile data', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload, { username: 'Manny' }) as unknown as Request;
      const res: Response = buyerMockResponse();
      jest.spyOn(buyer, 'getBuyerByUserName').mockResolvedValue(buyerDocument);
      await currentUserName(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Buyer Profile', buyer: buyerDocument });
    });
  });
  describe('userName method', () => {
    it('should return buyer profile data', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload, { username: 'Manny' }) as unknown as Request;
      const res: Response = buyerMockResponse();
      jest.spyOn(buyer, 'getBuyerByUserName').mockResolvedValue(buyerDocument);
      await userName(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Buyer Profile', buyer: buyerDocument });
    });
  });
});
