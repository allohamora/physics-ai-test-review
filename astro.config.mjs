// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  env: {
    schema: {
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  integrations: [react(), tailwind()],
});
