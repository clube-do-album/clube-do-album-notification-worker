import express, { type ErrorRequestHandler } from 'express';
import { notificationRouter } from './notification.controller.js';

export function startHttpServer() {
  const app = express();
  const port = Number(process.env.SERVER_PORT || process.env.PORT || 3005);

  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({
      status: 'UP',
      service: 'clube-do-album-notification-worker',
    });
  });

  app.use(notificationRouter);
  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Notification HTTP server running on port ${port}`);
  });
}

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error instanceof Error ? error.message : 'Unexpected HTTP error.');

  if (error instanceof Error && error.name === 'BadRequestError') {
    response.status(400).json({
      message: error.message,
    });
    return;
  }

  response.status(500).json({
    message: 'Internal server error.',
  });
};
