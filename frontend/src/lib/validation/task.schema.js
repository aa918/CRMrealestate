import { z } from "zod"
import { TASK_TYPE, TASK_PRIORITY } from "../enums"

export const createTaskSchema = z.object({
  title: z.string().min(1, "נדרשת כותרת"),
  description: z.string().optional().or(z.literal("")),
  type: z.enum(TASK_TYPE),
  priority: z.enum(TASK_PRIORITY),
  dueAt: z.string().min(1, "נדרש תאריך יעד"),
  assignedUserId: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional()),
})
