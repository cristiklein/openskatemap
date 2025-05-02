import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'server/start.ts',
    'server/dump-db.ts',
  ],
  outDir: 'dist-server',
  clean: true,
  sourcemap: true,
  minify: true,
});
