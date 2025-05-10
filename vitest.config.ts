import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const defaultCoverageExcludes = [
  'coverage/**',
  'dist/**',
  '**/node_modules/**',
  '**/[.]**',
  'packages/*/test?(s)/**',
  '**/*.d.ts',
  '**/virtual:*',
  '**/__x00__*',
  '**/\x00*',
  'cypress/**',
  'test?(s)/**',
  'test?(-*).?(c|m)[jt]s?(x)',
  '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
  '**/__tests__/**',
  '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
  '**/vitest.{workspace,projects}.[jt]s?(on)',
  '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      enabled: true,
      exclude: [
        ...defaultCoverageExcludes,
        // This is a symlink. Let's cover the real file.
        'knexfile.js',
      ],
    },
  },
  define: {
    '__APP_VERSION__': JSON.stringify('test-version'),
    '__CHANGELOG_HTML__': JSON.stringify('<h1>Changelog</h1>'),
    '__WELCOME_HTML__': JSON.stringify('<h1>Welcome to Open Skate Map!</h1>'),
  },
});
