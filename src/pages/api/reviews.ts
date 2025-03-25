import { makerReview } from '@/services/ai-review.service';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return new Response('file is not found', { status: 400 });
  }

  const encoder = new TextEncoder();

  // Create a streaming response
  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        for await (const item of makerReview(file)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(item)}\n\n`));
        }
      } catch (error) {
        console.error(error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  // Return the stream response and keep the connection alive
  return new Response(customReadable, {
    // Set the headers for Server-Sent Events (SSE)
    headers: {
      Connection: 'keep-alive',
      'Content-Encoding': 'none',
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8',
    },
  });
};
