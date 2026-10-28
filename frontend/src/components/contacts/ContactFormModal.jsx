import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import { Field, Input, Textarea } from "../ui/FormField"
import { contactSchema } from "../../lib/validation/contact.schema"
import { useCreateContact, useUpdateContact } from "../../hooks/useContacts"

export default function ContactFormModal({ open, onClose, contact, onSaved }) {
  const isEdit = Boolean(contact)
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const mutation = isEdit ? updateContact : createContact

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema) })

  useEffect(() => {
    if (open) {
      reset(
        contact
          ? { firstName: contact.firstName, lastName: contact.lastName || "", phone: contact.phone, email: contact.email || "", notes: contact.notes || "" }
          : { firstName: "", lastName: "", phone: "", email: "", notes: "" }
      )
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contact])

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values) => {
    const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== ""))
    try {
      const saved = isEdit
        ? await updateContact.mutateAsync({ id: contact.id, payload })
        : await createContact.mutateAsync(payload)
      reset()
      onSaved?.(saved)
    } catch {
      // surfaced below
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? "עריכת איש קשר" : "איש קשר חדש"}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            ביטול
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? "שמירה" : "יצירה"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="שם פרטי" required error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </Field>
          <Field label="שם משפחה" error={errors.lastName?.message}>
            <Input {...register("lastName")} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="טלפון" required error={errors.phone?.message}>
            <Input dir="ltr" className="text-left" {...register("phone")} />
          </Field>
          <Field label="אימייל" error={errors.email?.message}>
            <Input dir="ltr" className="text-left" {...register("email")} />
          </Field>
        </div>
        <Field label="הערות" error={errors.notes?.message}>
          <Textarea {...register("notes")} />
        </Field>

        {mutation.isError && <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{mutation.error.message}</div>}
      </form>
    </Modal>
  )
}
