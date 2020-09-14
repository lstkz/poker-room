import express from 'express';
import Path from 'path';
import http from 'http';
import bodyParser from 'body-parser';
import compression from 'compression';
import { logger } from './common/logger';
import { PORT } from './config';
import { connect, initIndexes } from './db';
import { domainMiddleware } from './middlewares/domainMiddleware';
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware';
import { notFoundHandlerMiddleware } from './middlewares/notFoundHandlerMiddleware';
import loadRoutes from './common/loadRoutes';

connect().then(async () => {
  await initIndexes();
  const app = express();
  app.set('port', PORT);
  app.use(domainMiddleware);
  app.use(compression());
  app.use(bodyParser.json());
  const apiRouter = express.Router();
  loadRoutes(apiRouter);
  app.use('/api', apiRouter);
  app.use(express.static(Path.join(__dirname, '../../front/build')));

  app.use(errorHandlerMiddleware);
  app.use(notFoundHandlerMiddleware);
  const server = http.createServer(app);
  server.listen(app.get('port'), '0.0.0.0', () => {
    logger.info(
      `Express HTTP server listening on port ${app.get('port')} in ${
        process.env.NODE_ENV
      } mode`
    );
  });
});
