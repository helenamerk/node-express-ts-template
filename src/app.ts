import Sentry from '@sentry/node';
import Tracing from '@sentry/tracing';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import { v4 as uuid } from 'uuid';

import log from './lib/log';
import dotenv from 'dotenv';
import { socketize } from './services/socketio';
import {
  IAuthenticatedRequest,
  IPreAuthenticatedRequest,
} from './types/definitionfile';
import { ParseUserHeader } from './middleware/parse-user-header';
import { generateAuthToken } from './lib/auth';
import { AuthMiddleware } from './middleware/authenticate';

const IsDev = process.env.NODE_ENV !== 'production';

if (IsDev) {
  dotenv.config({ path: __dirname + '/../.env' });
}

const app = express();

const PORT = process.env.PORT || 8080;
const SENTRY_DSN = process.env.SENTRY_DSN;

if (!IsDev && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 0.2, // Important not to make this too high ($$ she's pricey)
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

// disable weird 304 errors
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

app.use(cors());

// Set universal middleware
app.set('trust proxy', 1);

app.get('/', (req: Request, res: Response) => {
  res.send('🤠');
});

// Health endpoint for AWS ELB
app.get('/health', (req: Request, res: Response) => {
  res.status(200).end();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(ParseUserHeader);

if (process.env.NODE_ENV === 'production') {
  // Sentry User identification
  app.use(
    (req: IPreAuthenticatedRequest, res: Response, next: NextFunction) => {
      if (req.userId)
        Sentry.configureScope((scope) => {
          scope.setUser({ id: req.userId });
        });
      next();
    }
  );
}

app.post('/register', (req: IPreAuthenticatedRequest, res: Response) => {
  const newUserId = uuid();
  const userToken = generateAuthToken(newUserId, req.device);

  // TODO: create a user model somewhere! pass in user data! Idk!

  return res.status(200).json({ token: userToken });
});

app.get(
  '/validate-token',
  AuthMiddleware,
  (req: IPreAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json({ message: 'token is valid' });
    } catch (err) {
      next(err);
    }
  }
);

// Logger
// TODO
// app.use(
//   requestLogger.configure(logger, (req, res) => ({
//     userId: req.userId,
//     authed: !!req.userId,
//     device: req.device,
//   }))
// );

//////

// The sentry error handler must be before any other error middleware and after all controllers
if (!IsDev && SENTRY_DSN) {
  log.info({ IsDev });
  app.use(Sentry.Handlers.errorHandler());
}

// Create the server
const server = http.createServer(app);

// As of 5/1/19, ELB idle timeout = 5 min (300000ms).
// Note that ELB can
// (a) pre-emptively open sockets and leave them idle
// (b) reuse sockets.
// https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/config-idle-timeout.html
const serverTimeout = 310000;
server.timeout = serverTimeout;
server.keepAliveTimeout = serverTimeout;
server.headersTimeout = serverTimeout;

// wrap the http server with a websocket protocol with socketio
socketize(server);

server.listen(PORT, () => {
  log.info(`server is listening on ${PORT}`);
});
