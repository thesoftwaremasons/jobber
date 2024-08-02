import { ISellerDocument } from '@thesoftwaremasons/jobber-shared';
import { getRandomSeller, getSellerById, getSellerByUsername } from '@users/services/seller.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const id = async (req: Request, res: Response): Promise<void> => {
  const seller: ISellerDocument | null = await getSellerById(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Seller Profile', seller });
};

const username = async (req: Request, res: Response): Promise<void> => {
  const seller: ISellerDocument | null = await getSellerByUsername(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Seller Profile', seller });
};

const random = async (req: Request, res: Response): Promise<void> => {
  const sellers: ISellerDocument[] | null = await getRandomSeller(parseInt(req.params.size, 10));
  res.status(StatusCodes.OK).json({ message: 'Random Sellers Profile', sellers });
};

export { id, username, random };
