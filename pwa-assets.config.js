// pwa-assets.config.js

import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
    preset: 'minimal',
    images: ['public/favicon.svg'] // generates icon-192.png + icon-512.png
})
