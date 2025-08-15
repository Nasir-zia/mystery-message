import {z} from "zod"


export const siginSchema = z.object({
    username: z.string(),
    password: z.string()

})
export type SignInSchemaType = z.infer<typeof siginSchema>;
