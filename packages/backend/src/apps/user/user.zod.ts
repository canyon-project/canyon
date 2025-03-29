import { z } from 'zod';

export const userSettingZod = z.object({
  theme: z.string().default('auto'),
  language: z.string().default('auto'),
});
