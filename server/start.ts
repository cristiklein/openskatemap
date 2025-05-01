import { app, initDb } from './server';
import logger from './logger';

const port = process.env.PORT || 3000;

initDb().then(() => {
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}).catch((err: unknown) => {
  logger.error({ err }, 'Failed to initialize the database');
  process.exit(1);
});
