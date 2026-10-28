import { z } from "zod"

const emptyToUndef = (v) => (v === "" ? undefined : v)

export const contactSchema = z.object({
  firstName: z.string().min(1, "נדרש שם פרטי"),
  lastName: z.string().optional().or(z.literal("")),
  phone: z.string().min(6, "נדרש מספר טלפון תקין"),
  email: z.preprocess(emptyToUndef, z.string().email("אימייל לא תקין").optional()),
  notes: z.string().optional().or(z.literal("")),
})
