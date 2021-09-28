// @ts-nocheck

import Redis from 'ioredis';
import bluebird from 'bluebird';

bluebird.promisifyAll(Redis);

const connectionOpts = {
  host: process.env.REDIS_HOST
    ? process.env.REDIS_HOST.toString()
    : 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

const RedisClient = new Redis(connectionOpts);

export default RedisClient;
