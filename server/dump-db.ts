import { initDb, getDb, deinitDb } from './db';

async function main() {
  await initDb();

  const db = getDb();
  const results = await db('way_qualities').select('*');
  console.log(results);

  await deinitDb();
}

main();
