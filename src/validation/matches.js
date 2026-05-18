import { z } from "zod";

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

const isoDateTimeSchema = z.iso.datetime({ offset: true });

const isoDateStringSchema = z.string().refine((value) => isoDateTimeSchema.safeParse(value).success, {
  message: "Invalid ISO date string",
});

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().nonempty(),
    homeTeam: z.string().nonempty(),
    awayTeam: z.string().nonempty(),
    startTime: isoDateStringSchema,
    endTime: isoDateStringSchema,
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((match, ctx) => {
    const startTime = Date.parse(match.startTime);
    const endTime = Date.parse(match.endTime);

    if (!Number.isNaN(startTime) && !Number.isNaN(endTime) && endTime <= startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "endTime must be chronologically after startTime",
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
