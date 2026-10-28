import { z } from "zod"
import { PROPERTY_KIND, TRANSACTION_TYPE, PROPERTY_STATUS } from "../enums"

const num = z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().nonnegative().optional())

export const propertySchema = z.object({
  title: z.string().min(1, "נדרשת כותרת"),
  description: z.string().optional().or(z.literal("")),
  propertyType: z.enum(PROPERTY_KIND),
  transactionType: z.enum(TRANSACTION_TYPE),
  city: z.string().min(1, "נדרשת עיר"),
  address: z.string().optional().or(z.literal("")),
  price: z.preprocess((v) => Number(v), z.number().nonnegative("נדרש מחיר תקין")),
  bedrooms: num,
  bathrooms: num,
  sizeSqm: num,
  status: z.enum(PROPERTY_STATUS).optional(),
})
