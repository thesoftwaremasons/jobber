import { gigById, gigsSearch } from '@auth/service/search.service';
import { IPaginateProps, ISearchResult } from '@thesoftwaremasons/jobber-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';

export async function gigs(req: Request, res: Response) {
  const { from, size, type } = req.params;
  let resultHits: unknown[] = [];
  const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
  const gigs: ISearchResult = await gigsSearch(
    `${req.query.query}`,
    paginate,
    `${req.query.delivery_time}`,
    parseInt(`${req.query.minPrice}`),
    parseInt(`${req.query.maxPrice}`)
  );
  for (const item of gigs.hits) {
    resultHits.push(item._source);
  }
  if (type === 'backward') {
    resultHits = sortBy(resultHits, ['sortId']);
  }
  res.status(StatusCodes.OK).json({ message: 'Search gigs results', total: gigs.total, gigs: resultHits });
}

export async function singleGigById(req: Request, res: Response) {
  const gig = await gigById('gigs', req.params.gigId);
  res.status(StatusCodes.OK).json({ message: 'Single gig result', gig });
}
