import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import { Field, Input, Select, Textarea } from "../ui/FormField"
import { propertySchema } from "../../lib/validation/property.schema"
import { useCreateProperty, useUpdateProperty } from "../../hooks/useProperties"
import {
  PROPERTY_KIND,
  PROPERTY_KIND_LABELS,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LABELS,
  PROPERTY_STATUS,
  PROPERTY_STATUS_LABELS,
} from "../../lib/enums"

export default function PropertyFormModal({ open, onClose, property, onSaved }) {
  const isEdit = Boolean(property)
  const createProperty = useCreateProperty()
  const updateProperty = useUpdateProperty()
  const mutation = isEdit ? updateProperty : createProperty

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(propertySchema) })

  useEffect(() => {
    if (open) {
      reset(
        property
          ? { ...property, description: property.description || "", address: property.address || "" }
          : { propertyType: "APARTMENT", transactionType: "SALE", status: "AVAILABLE" }
      )
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, property])

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values) => {
    try {
      const saved = isEdit
        ? await updateProperty.mutateAsync({ id: property.id, payload: values })
        : await createProperty.mutateAsync(values)
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
      title={isEdit ? "עריכת נכס" : "נכס חדש"}
      size="lg"
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
        <Field label="כותרת" required error={errors.title?.message}>
          <Input {...register("title")} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="סוג נכס" error={errors.propertyType?.message}>
            <Select {...register("propertyType")}>
              {PROPERTY_KIND.map((v) => (
                <option key={v} value={v}>{PROPERTY_KIND_LABELS[v]}</option>
              ))}
            </Select>
          </Field>
          <Field label="סוג עסקה" error={errors.transactionType?.message}>
            <Select {...register("transactionType")}>
              {TRANSACTION_TYPE.map((v) => (
                <option key={v} value={v}>{TRANSACTION_TYPE_LABELS[v]}</option>
              ))}
            </Select>
          </Field>
          <Field label="סטטוס" error={errors.status?.message}>
            <Select {...register("status")}>
              {PROPERTY_STATUS.map((v) => (
                <option key={v} value={v}>{PROPERTY_STATUS_LABELS[v]}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="עיר" required error={errors.city?.message}>
            <Input {...register("city")} />
          </Field>
          <Field label="כתובת" error={errors.address?.message}>
            <Input {...register("address")} />
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Field label="מחיר (₪)" required error={errors.price?.message}>
            <Input type="number" dir="ltr" className="text-left" {...register("price")} />
          </Field>
          <Field label="חדרים" error={errors.bedrooms?.message}>
            <Input type="number" dir="ltr" className="text-left" {...register("bedrooms")} />
          </Field>
          <Field label="חדרי רחצה" error={errors.bathrooms?.message}>
            <Input type="number" dir="ltr" className="text-left" {...register("bathrooms")} />
          </Field>
          <Field label='שטח (מ"ר)' error={errors.sizeSqm?.message}>
            <Input type="number" dir="ltr" className="text-left" {...register("sizeSqm")} />
          </Field>
        </div>

        <Field label="תיאור" error={errors.description?.message}>
          <Textarea rows={4} {...register("description")} />
        </Field>

        {mutation.isError && <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{mutation.error.message}</div>}
      </form>
    </Modal>
  )
}
