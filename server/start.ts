import { app, initDb } from './server';
import logger from './logger';

logger.info('Starting ...');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await initDb();

    const server = app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start the server');

    // Flush Pino logs before exiting
    if (typeof logger.flush === 'function') {
      logger.flush();
    }

    // Wait a bit to allow async logging to complete
    setTimeout(() => process.exit(1), 100);
  }
}

main();

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  logger.flush?.();
  setTimeout(() => process.exit(1), 100);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled Rejection');
  logger.flush?.();
  setTimeout(() => process.exit(1), 100);
});
