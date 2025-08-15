import { z } from 'zod';

export const acceptMessageSchema = z.object({
  acceptMessages: z.boolean()
});

export type AcceptMessageForm = z.infer<typeof acceptMessageSchema>;