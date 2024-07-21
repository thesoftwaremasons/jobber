import { esClient, getDocumentsById } from '@auth/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerGig } from '@thesoftwaremasons/jobber-shared';

export async function gigById(index: string, gigId: string): Promise<ISellerGig> {
  const gig: ISellerGig = await getDocumentsById(index, gigId);
  return gig;
}

export async function gigsSearch(
  searchQuery: string,
  paginate: IPaginateProps,
  deliveryTime?: string,
  min?: number,
  max?: number
): Promise<ISearchResult> {
  const { from, size, type } = paginate;
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['username', 'title', 'description', 'totalDescription', 'basicTitle', 'categories', 'subCategories'],
        query: `*${searchQuery}*`
      }
    },
    {
      term: {
        active: true
      }
    }
  ];
  if (deliveryTime !== 'undefined') {
    queryList.push({
      query_string: {
        fields: ['expectedDelivery'],
        query: `*${deliveryTime}*`
      }
    });
  }
  if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
    queryList.push({
      range: {
        price: {
          gte: min,
          lte: max
        }
      }
    });
  }
  const result: SearchResponse = await esClient.search({
    index: 'gigs',
    size,
    query: {
      bool: {
        must: [...queryList]
      }
    },
    sort: [{ sortId: type === 'forward' ? 'asc' : 'desc' }],
    ...(from !== '0' && { search_after: [from] })
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits
  };
}
