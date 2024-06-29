

import {Client} from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@auth/config';
import { winstonLogger } from '@thesoftwaremasons/jobber-shared';
import { Logger } from 'winston';

const log:Logger=winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'authElasticSearchServer','debug');
export const esClient=new Client({
    node:`${config.ELASTIC_SEARCH_URL}`

});
export async function checkConnection():Promise<void> {
 let isConnected=false;
while (!isConnected){
    try {
        const health:ClusterHealthResponse=await esClient.cluster.health({});
        log.info(`AuthService Elastic Search health status - ${health.status}`);
        isConnected=true;
      
    } catch (error) {
        isConnected=false;
        
        log.error('Connection to elastic search failed ..... Retrying');
        log.log('error','AuthService checkConnection() method',error);
    }
}


}