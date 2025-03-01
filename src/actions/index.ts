import { makeReview } from '@/services/ai-review.service';
import { defineAction } from 'astro:actions';
import { z } from 'zod';

export const server = {
  makeReview: defineAction({
    accept: 'form',
    input: z.object({
      file: z.instanceof(File),
    }),
    handler: async ({ file }) => {
      return await makeReview(file);
    },
  }),
};
