import { z } from "zod";

export const projectTags = z.array(
    z.object({
        id: z.string().default(""),
        name: z.string().default(""),
        link: z.string().default(""),
        color: z.string().default(""),
    }),
);

export const projectMembers = z.array(
    z.object({
        userID: z.string().default(""),
        role: z.string().default(""),
    }),
);

export const projectsAutoInstrument = z.array(
    z.object({
        filepath: z.string().default(""),
        content: z.string().default(""),
    }),
);
