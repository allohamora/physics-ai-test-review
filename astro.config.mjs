// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercelServerless from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercelServerless({}),
  env: {
    schema: {
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  integrations: [react(), tailwind()],
});
