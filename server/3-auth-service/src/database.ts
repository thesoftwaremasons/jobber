import { config } from '@auth/config';
import {winstonLogger} from '@thesoftwaremasons/jobber-shared';
import {Logger} from 'winston';
import {Sequelize} from 'sequelize';


const log:Logger=winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'authDatabaseServer','debug');

export const sequelize:Sequelize=new Sequelize(config.MYSQL_DB!);

export async function databaseConnection():Promise<void> {
    try{
            await sequelize.authenticate();
            log.info('AuthService MySql database connection has been established successfully');
    }catch(error){
        log.error('Auth Service - Unable to conect ti the database');
        log.log('error','AuthService - databaseConnection() method errors',error);
    }
    
}