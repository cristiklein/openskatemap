import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'

import { createHtmlPlugin } from 'vite-plugin-html';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const welcomeHtml = readFileSync(resolve(__dirname, 'public/welcome.html'), 'utf-8');

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ registerType: 'autoUpdate' }),
    createHtmlPlugin({
      inject: {
        data: {
          welcomeContent: welcomeHtml,
        },
      },
    }),
  ],
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  },
})
