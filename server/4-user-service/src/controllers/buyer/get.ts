import { IBuyerDocument } from '@thesoftwaremasons/jobber-shared';
import { getBuyerByEmail, getBuyerByUserName } from '@users/services/buyer.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const email = async (req: Request, res: Response): Promise<void> => {
  const buyer: IBuyerDocument | null = await getBuyerByEmail(req.currentUser!.email);
  res.status(StatusCodes.OK).json({ message: 'Buyer Profile', buyer });
};
const currentUserName = async (req: Request, res: Response): Promise<void> => {
  const buyer: IBuyerDocument | null = await getBuyerByUserName(req.currentUser!.email);
  res.status(StatusCodes.OK).json({ message: 'Buyer Profile', buyer });
};
const userName = async (req: Request, res: Response): Promise<void> => {
  const buyer: IBuyerDocument | null = await getBuyerByUserName(req.params.username);
  res.status(StatusCodes.OK).json({ message: 'Buyer Profile', buyer });
};

export { email, currentUserName, userName };
