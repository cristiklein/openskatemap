const isProd = process.env.NODE_ENV === 'production';
const inMemory = process.env.NODE_ENV === 'test';

if (inMemory)
  console.warn('Using in-memory database');

const knexConfig = {
  client: isProd ? 'pg' : 'sqlite3',
  connection: isProd
    ? {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        ssl: {
          rejectUnauthorized: false,
        },
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      }
    : {
        filename: inMemory ? ':memory:' : '/tmp/openskatemap.sqlite',
      },
  useNullAsDefault: !isProd,
  migrations: {
    directory: './server/migrations',
  },
};

export default knexConfig;
