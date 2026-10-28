import Modal from "./Modal"
import Button from "./Button"

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "לאשר פעולה?",
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  danger = true,
  isLoading,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{description}</p>
    </Modal>
  )
}
