// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      GEMINI_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      GROQ_API_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  integrations: [react(), tailwind()],
});
