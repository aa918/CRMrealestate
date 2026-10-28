import { z } from "zod"
import { LEAD_SOURCE, INTEREST_TYPE, PROPERTY_KIND } from "../enums"

const emptyToUndef = (v) => (v === "" || v === null ? undefined : v)

export const createLeadSchema = z.object({
  firstName: z.string().min(1, "נדרש שם פרטי"),
  lastName: z.string().optional().or(z.literal("")),
  phone: z.string().min(6, "נדרש מספר טלפון תקין"),
  email: z.preprocess(emptyToUndef, z.string().email("אימייל לא תקין").optional()),
  source: z.enum(LEAD_SOURCE),
  interestType: z.preprocess(emptyToUndef, z.enum(INTEREST_TYPE).optional()),
  propertyType: z.preprocess(emptyToUndef, z.enum(PROPERTY_KIND).optional()),
  city: z.string().optional().or(z.literal("")),
  budget: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().nonnegative().optional()),
  bedrooms: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().int().nonnegative().optional()),
  message: z.string().optional().or(z.literal("")),
  assignedUserId: z.preprocess(emptyToUndef, z.string().optional()),
})
