import z from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const passwordMessage =
    "Password must be at least 6 characters and include uppercase, lowercase, number, and special character.";

export const signupInput = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().regex(passwordRegex, passwordMessage),
    name: z.string().optional()
})

export type SignupInput = z.infer<typeof signupInput>

export const signinInput = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(1, "Password is required"),
})

export type SigninInput = z.infer<typeof signinInput>

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()).optional(),
})
export type CreateBlogInput = z.infer<typeof createBlogInput>

export const updateBlogInput = z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    tags: z.array(z.string()).optional(),
})
export type UpdateBlogInput = z.infer<typeof updateBlogInput>

export const updateProfileInput = z.object({
    name: z.string().min(1),
})
export type UpdateProfileInput = z.infer<typeof updateProfileInput>

