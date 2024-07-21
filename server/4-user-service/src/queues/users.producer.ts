import { winstonLogger } from '@thesoftwaremasons/jobber-shared';
import { config } from '@users/config';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

import { createConnection } from './connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersServiceProducerConnection', 'debug');

const publishDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    log.info(logMessage);
  } catch (error) {
    log.log('error', 'User Service publishDirectMessage() method error', error);
  }
};

export { publishDirectMessage };
