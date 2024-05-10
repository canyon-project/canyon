import { z } from 'zod';

export const projectTags = z.array(
  z.object({
    id: z.string().default(''),
    name: z.string().default(''),
    link: z.string().default(''),
    color: z.string().default(''),
  }),
);
// console.log(User.parse([{ usernam: "Ludwig" }]));
