import { z } from "zod"
import { ROLE } from "../enums"

export const createUserSchema = z.object({
  firstName: z.string().min(1, "נדרש שם פרטי"),
  lastName: z.string().min(1, "נדרש שם משפחה"),
  email: z.string().min(1, "נדרש אימייל").email("אימייל לא תקין"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(ROLE),
})

export const profileSchema = z.object({
  firstName: z.string().min(1, "נדרש שם פרטי"),
  lastName: z.string().min(1, "נדרש שם משפחה"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים").optional().or(z.literal("")),
})
