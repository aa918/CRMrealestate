import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "נדרש אימייל").email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "נדרשת סיסמה"),
})

export const registerSchema = z.object({
  organizationName: z.string().min(2, "שם המשרד חייב להכיל לפחות 2 תווים"),
  organizationPhone: z.string().optional().or(z.literal("")),
  organizationEmail: z.string().email("כתובת אימייל לא תקינה").optional().or(z.literal("")),
  firstName: z.string().min(1, "נדרש שם פרטי"),
  lastName: z.string().min(1, "נדרש שם משפחה"),
  email: z.string().min(1, "נדרש אימייל").email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
  phone: z.string().optional().or(z.literal("")),
})
