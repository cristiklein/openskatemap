import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

import { createHtmlPlugin } from 'vite-plugin-html';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import showdown from 'showdown';

const welcomeHtml = readFileSync(resolve(__dirname, 'public/welcome.html'), 'utf-8');

console.log('Rendering changelog to public/changelog.html');
const changeLogMd = readFileSync(resolve(__dirname, 'CHANGELOG.md'), 'utf-8');
const changeLogHtml = (new showdown.Converter()).makeHtml(changeLogMd);
writeFileSync(resolve(__dirname, 'public/changelog.html'), changeLogHtml);

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
  },
})
