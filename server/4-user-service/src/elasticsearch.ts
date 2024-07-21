import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@users/config';
import { winstonLogger } from '@thesoftwaremasons/jobber-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersSearchServer', 'debug');
const esClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});
const checkConnection = async (): Promise<void> => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await esClient.cluster.health({});
      log.info(`UserService Elastic Search health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      isConnected = false;

      log.error('Connection to elastic search failed ..... Retrying');
      log.log('error', 'UserService checkConnection() method', error);
    }
  }
};

export { checkConnection };
