import sharp from 'sharp';
import { convertToHtml } from 'mammoth';
import { GoogleGenerativeAI, type Part } from '@google/generative-ai';
import { GEMINI_API_KEY } from 'astro:env/server';
import { z } from 'zod';
import { scheduler } from 'node:timers/promises';

const MAX_IMAGE_WIDTH = 320;

type Task = {
  task: string;
  image?: string;
  mimeType?: string;
};

const prepareTask = async (task: string): Promise<Task> => {
  if (!task.includes('<img')) {
    return { task };
  }

  const src = task
    .match(/<img src=".+?"/gim)?.[0]
    ?.replace('<img src="', '')
    .replace('"', '');
  const [meta, base64] = src?.split(',') as [string, string];
  const buffer = Buffer.from(base64 as string, 'base64');
  const { width } = await sharp(buffer).metadata();
  if (!!width && width < MAX_IMAGE_WIDTH) {
    return { task };
  }

  const resized = await sharp(buffer)
    .resize(MAX_IMAGE_WIDTH)
    .png({ compressionLevel: 8, quality: 80, force: false })
    .webp({ quality: 80, force: false })
    .tiff({ quality: 80, force: false })
    .jpeg({ quality: 80, force: false })
    .toBuffer();

  const mimeType = meta.split(':')[1]?.split(';')[0] as string;

  return {
    task: task.replace(/<img[\s\S]+?>/, ''),
    image: resized.toString('base64'),
    mimeType,
  };
};

const getTasks = async (file: File) => {
  const { value } = await convertToHtml({ buffer: Buffer.from(await file.arrayBuffer()) });
  const topics = value.replace(/<ol>/gim, '<splitter /><ol>').split('<splitter />');
  const withoutTitle = topics.slice(1);

  return await Promise.all(withoutTitle.map(async (topic) => await prepareTask(topic)));
};

const genAi = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAi.getGenerativeModel({ model: 'gemini-2.0-flash', generationConfig: { temperature: 0.8 } });

const PROMPT = `You are a Ukrainian physics teacher participating in a high-stakes challenge of reviewing a multiple-choice test.

Your task is to:
1. Parse the input to extract the question and the list of answer options.
2. Provide your explanation of task solving in Ukrainian within <explanation></explanation> tags.
3. If an image is provided, **parse, interpret and use** all possible information from it.
4. Identify which answer option is marked as correct (i.e. wrapped in <strong> tags).
5. Determine if the test is valid. A test is considered valid if and only if there is the answer equals to the calculated solution.
6. Finally, output the result as a boolean within <result></result> tags. Use "true" if the test is valid and "false" otherwise.

Output structure:
<explanation>[Your explanation in Ukrainian]</explanation>
<result>[Boolean output]</result>

Your success in this task is extremely critical, some people will be fired if you made an invalid response. Good luck!`;

const responseSchema = z.object({
  result: z.union([
    z.literal('true').transform(() => true),
    z.literal('TRUE').transform(() => true),
    z.literal('false').transform(() => false),
    z.literal('FALSE').transform(() => false),
    z.boolean(),
  ]),
  explanation: z.string(),
});

const outputToResponse = (output: string): z.infer<typeof responseSchema> => {
  const result = output
    .match(/<result>[\s\S]+?<\/result>/gim)?.[0]
    ?.replace(/<result>|<\/result>/gim, '')
    .trim();
  const explanation = output
    .match(/<explanation>[\s\S]+?<\/explanation>/gim)?.[0]
    ?.replace(/<explanation>|<\/explanation>/gim, '')
    ?.trim();

  return responseSchema.parse({ result, explanation });
};

const retry = <T extends (...args: any) => any>(fn: T, retries: number, getDelay: (count: number) => number) => {
  let count = 0;

  const handler = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (count >= retries) {
        throw error;
      }

      count++;

      console.error(error, ...args);
      await scheduler.wait(getDelay(count));

      return await handler(...args);
    }
  };

  return handler;
};

const getGeminiResponse = async (content: (Part | string)[], wasFailed = false) => {
  const { response } = await model.generateContent(content);

  try {
    return outputToResponse(response.text());
  } catch (error) {
    if (wasFailed) {
      throw error;
    }

    return await getGeminiResponse(
      [
        ...content,
        'please, make sure you provided result in <result></result> tags and explanation in <explanation></explanation> tags in your output it is critical. error: ' +
          error?.toString(),
      ],
      true,
    );
  }
};

const checkGeminiTask = retry(
  async ({ task, image, mimeType }: Task) => {
    const content: (Part | string)[] = [PROMPT];
    if (image && mimeType) {
      content.push({ inlineData: { data: image, mimeType } });
    }
    content.push(task);

    return await getGeminiResponse(content);
  },
  3,
  (count) => count * 5000,
);

export const makeReview = async (file: File) => {
  const tasks = await getTasks(file);

  return await Promise.all(
    tasks.map(async (task) => {
      try {
        return await checkGeminiTask(task);
      } catch (error) {
        console.error(error);

        throw error;
      }
    }),
  );
};
