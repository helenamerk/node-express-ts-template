import Pino from 'pino';

const errorSerializer = (event: any) => {
  if (!event || !event.stack) {
    return event;
  }

  return {
    message: event.message,
    name: event.name,
    stack: event.stack,
    ...event,
  };
};

const opts: Pino.LoggerOptions = {
  prettyPrint: {},
  redact: {
    paths: ['password'],
    remove: true,
  },
  serializers: {
    err: errorSerializer,
    error: errorSerializer,
  },
};

if (process.env.NODE_ENV === 'development') {
  opts.prettyPrint = { colorize: true };
}

const log = Pino(opts);

export default log;
