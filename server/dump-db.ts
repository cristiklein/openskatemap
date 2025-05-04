import { initDb, getDb, deinitDb } from './db';

async function main() {
  await initDb();

  const db = getDb();
  const results = await db('way_qualities').select('*');
  console.log(JSON.stringify(results, null, 2)); // Pretty-print JSON to stdout

  await deinitDb();
}

main();
