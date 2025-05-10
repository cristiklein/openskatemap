import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

import { createHtmlPlugin } from 'vite-plugin-html';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import generateChangeLogHtml from './scripts/generateChangeLogHtml';

const welcomeHtml = readFileSync(resolve(__dirname, 'src/welcome.html'), 'utf-8');
const changeLogHtml = generateChangeLogHtml();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ registerType: 'autoUpdate' }),
    createHtmlPlugin({
      inject: {
        data: {
          welcomeContent: welcomeHtml,
          changeLogContent: changeLogHtml,
        },
      },
    }),
  ],
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    '__CHANGELOG_HTML__': JSON.stringify(changeLogHtml),
    '__WELCOME_HTML__': JSON.stringify(welcomeHtml),
  },
})
