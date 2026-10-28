import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import { Field, Input, Select } from "../ui/FormField"
import { createUserSchema } from "../../lib/validation/user.schema"
import { useCreateUser } from "../../hooks/useUsers"
import { ROLE, ROLE_LABELS } from "../../lib/enums"

export default function UserFormModal({ open, onClose, onCreated }) {
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(createUserSchema), defaultValues: { role: "AGENT" } })

  const close = () => {
    reset()
    createUser.reset()
    onClose()
  }

  const onSubmit = async (values) => {
    const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""))
    try {
      const user = await createUser.mutateAsync(payload)
      reset()
      onCreated?.(user)
    } catch {
      // surfaced below
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="הוספת איש צוות"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            ביטול
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            הוספה
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="שם פרטי" required error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </Field>
          <Field label="שם משפחה" required error={errors.lastName?.message}>
            <Input {...register("lastName")} />
          </Field>
        </div>
        <Field label="אימייל" required error={errors.email?.message}>
          <Input type="email" dir="ltr" className="text-left" {...register("email")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="סיסמה זמנית" required error={errors.password?.message} hint="לפחות 8 תווים">
            <Input type="password" {...register("password")} />
          </Field>
          <Field label="תפקיד" error={errors.role?.message}>
            <Select {...register("role")}>
              {ROLE.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="טלפון" error={errors.phone?.message}>
          <Input dir="ltr" className="text-left" {...register("phone")} />
        </Field>

        {createUser.isError && <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{createUser.error.message}</div>}
      </form>
    </Modal>
  )
}
