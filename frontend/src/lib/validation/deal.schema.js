import { z } from "zod"
import { DEAL_STAGE } from "../enums"

const emptyToUndef = (v) => (v === "" ? undefined : v)

export const createDealSchema = z.object({
  contactId: z.string().min(1, "נדרש איש קשר"),
  propertyId: z.preprocess(emptyToUndef, z.string().optional()),
  ownerId: z.preprocess(emptyToUndef, z.string().optional()),
  title: z.string().min(1, "נדרשת כותרת"),
  value: z.preprocess((v) => Number(v), z.number().nonnegative("נדרש סכום תקין")),
  stage: z.enum(DEAL_STAGE),
  probability: z.preprocess((v) => (v === "" ? 0 : Number(v)), z.number().int().min(0).max(100)),
  expectedCloseDate: z.string().optional().or(z.literal("")),
})
