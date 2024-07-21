import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@auth/config';
import { ISellerGig, winstonLogger } from '@thesoftwaremasons/jobber-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');
const esClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});
async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await esClient.cluster.health({});
      log.info(`AuthService Elastic Search health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      isConnected = false;

      log.error('Connection to elastic search failed ..... Retrying');
      log.log('error', 'AuthService checkConnection() method', error);
    }
  }
}

async function checkIfIndexExist(indexName: string): Promise<boolean> {
  const result: boolean = await esClient.indices.exists({ index: indexName });
  return result;
}

async function createIndex(indexName: string): Promise<void> {
  try {
    const result: boolean = await checkIfIndexExist(indexName);
    if (result) {
      log.info(`Index ${indexName} already exists`);
    } else {
      await esClient.indices.create({ index: indexName });
      await esClient.indices.refresh({ index: indexName });
      log.info(`Created index ${indexName}`);
    }
  } catch (error) {
    log.error(`An error occurred while creating the index ${indexName}`);
    log.log('error', 'AuthService createIndex() method', error);
  }
}
async function getDocumentsById(index: string, gigId: string): Promise<ISellerGig> {
  try {
    const result: GetResponse = await esClient.get({
      index,
      id: gigId
    });
    return result._source as ISellerGig;
  } catch (error) {
    log.log('error', 'AuthService elasticsearch getDocumentById() method error:', error);
    return {} as ISellerGig;
  }
}

export { esClient, checkConnection, createIndex, getDocumentsById };
