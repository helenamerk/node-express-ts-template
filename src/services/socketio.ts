import _ from 'lodash';
// @ts-ignore
import socketio from 'socket.io';
// @ts-ignore
import redisAdapter from 'socket.io-redis';
// @ts-ignore
import socketioAuth from 'socketio-auth';

import jwt from 'jsonwebtoken';
import http from 'http';
import RedisClient from '../lib/redis';

import logger from '../lib/log';

// @ts-ignore // TODO: why is this throwing an err
const log = logger.child({ module: 'services/socketio' });

type GlimpseSocketClient = socketio.Socket & {
  log: any;
  userId: string;
};

const socketRouter = async (client: GlimpseSocketClient) => {
  client.log.info('socketRouter');

  client.on('channelName', async (data: any) => {
    console.log(`${client.id} hits up ${'channelName'}`);
    client.to(data.matchId).emit('channelName', data);
  });

  /**
   * Emit to others that the person has left!!
   */
  client.on('disconnecting', () => {
    console.log('disconnecting');
  });

  client.on('disconnect', async (reason: string) => {
    console.log(reason);
  });
};

const setUserSocketIds = (userId: string, socketId: string) => {
  RedisClient.set(userId, socketId);
};

/**
 * Authenticates socket emits and listens for user.
 * Also sets user's last active status
 *
 * @param {*} client
 * @param {*} data
 */
const socketAuth = async (client: GlimpseSocketClient, data: any) => {
  const token = data.x_access_token;
  if (!token) throw new Error('Invalid Access Token');
  // @ts-ignore
  // throw new AuthenticationError().setMessage(
  //   'Access token required to establish session'
  // );

  const decoded = jwt.verify(token, process.env.PRIVATE_AUTH_KEY ?? '');

  // @ts-ignore
  if (!decoded || !decoded._id) throw new Error('Invalid Access Token');
  // @ts-ignore
  // throw new AuthenticationError().setMessage('Invalid Access Token');

  // @ts-ignore
  const userId = decoded._id;

  // store the mapping from clientId to userId
  await setUserSocketIds(client.id, userId);

  client.userId = userId;
  client.log.info('successfully authenticated user', decoded);
  return decoded;
};

/**
 * Turns a http server into listening on a websocket protocol
 * @param {*} server - http server required to initialize
 */
export const socketize = async (server: http.Server) => {
  const io = socketio(server);

  const connectionOpts = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: process.env.REDIS_PORT ?? 6379,
  };
  const RedisAdapter = redisAdapter(connectionOpts);

  io.adapter(RedisAdapter);

  io.on('connection', (socket: any) => {
    log.info(`Socket ${socket.id} connected.`);
  });

  /**
   * Handle any emits/listens that require auth
   *
   * @param {socketio client} client
   */
  const postAuthenticate = (client: GlimpseSocketClient) => {
    socketRouter(client);
  };

  const authenticate = async (
    client: GlimpseSocketClient,
    data: any,
    callback: (error: any, authedUser?: any) => void
  ) => {
    try {
      // when a user first joins a topic
      client.log = log.child({ client_id: client.id });
      client.log.info(`${client.id} is authenticating`);

      const user = await socketAuth(client, data);

      callback(null, user);
    } catch (err) {
      log.error(`DEBUG: there was an error in authenticate, ${err}`);
      callback(err);
    }
  };

  const socketData = {
    authenticate,
    postAuthenticate,
  };
  socketioAuth(io, socketData);

  return io;
};
