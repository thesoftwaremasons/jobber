import { winstonLogger } from '@thesoftwaremasons/jobber-shared';
import { Logger } from 'winston';
import { config } from '@review/config';
import { Pool } from 'pg';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewDatabaseServer', 'debug');
console.log(config.DATABASE_HOST, config.DATABASE_USER, config.DATABASE_PASSWORD, config.DATABASE_NAME);

const pool = new Pool({
  connectionString:
    'postgresql://soccerdb_owner:z4lXsMjUH0EL@ep-falling-haze-a5xz0si3.us-east-2.aws.neon.tech/jobber-reviews?sslmode=require'
});
//ep-falling-haze-a5xz0si3.us-east-2.aws.neon.tech
// const pool: Pool = new Pool({
//   host: `${config.DATABASE_HOST}`,
//   user: `${config.DATABASE_USER}`,
//   password: `${config.DATABASE_PASSWORD}`,
//   port: 5432,
//   database: `${config.DATABASE_NAME}`,
//   statement_timeout: 100000,
//   ...(config.NODE_ENV !== 'development' &&
//     config.CLUSTER_TYPE === 'AWS' && {
//       ssl: {
//         rejectUnauthorized: false
//       }
//     })
// });

pool.on('error', (error: Error) => {
  log.log('error', 'pg client error', error);
  process.exit(-1);
});

const createTableText = `
  CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL UNIQUE,
    gigId text NOT NULL,
    reviewerId text NOT NULL,
    orderId text NOT NULL,
    sellerId text NOT NULL,
    review text NOT NULL,
    reviewerImage text NOT NULL,
    reviewerUsername text NOT NULL,
    country text NOT NULL,
    reviewType text NOT NULL,
    rating integer DEFAULT 0 NOT NULL,
    createdAt timestamp DEFAULT CURRENT_DATE,
    PRIMARY KEY (id)
  );

  CREATE INDEX IF NOT EXISTS gigId_idx ON public.reviews (gigId);

  CREATE INDEX IF NOT EXISTS sellerId_idx ON public.reviews (sellerId);
`;

const databaseConnection = async (): Promise<void> => {
  try {
    await pool.connect();
    log.info('Review service successfully connected to postgresql database.');
    await pool.query(createTableText);
  } catch (error) {
    log.error('ReviewService - Unable to connect to database');
    log.log('error', 'ReviewService () method error:', error);
  }
};

export { databaseConnection, pool };
