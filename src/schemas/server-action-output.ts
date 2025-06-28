import { z } from 'zod'

export const serverActionOutputSchema = z.object({
  error: z
    .object({
      message: z.string(),
      code: z.string(),
    })
    .optional(),
  success: z.boolean().optional().default(false),
})
