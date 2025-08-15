import {z} from 'zod';

export const usernamevalidation = z.string()
.min(3, { message: 'Username must be at least 3 characters long' }   
)
.max(20, { message: 'Username must not exceed 20 characters' })

.regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' });




export const signupSchema = z.object({
    username : usernamevalidation,
    email : z.string().email({ message: 'Invalid email address' }),
    password :z.string().min(6, { message: 'Password must be at least 6 characters long' })
    .max(50, { message: 'Password must not exceed 50 characters' }),
})
