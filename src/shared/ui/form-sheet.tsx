import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '../ui/button'
import { DrawerCommon, DrawerSize } from '../ui/drawer'
import type { DrawerCommonProps } from '../ui/drawer'

interface FormSheetProps {
  id?: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  onSubmitForm?: () => Promise<void> | void
  onSuccess?: () => void
  preventClose?: boolean
  onBeforeClose?: () => boolean
  size?: DrawerSize
  withoutCloseButton?: boolean
}

export function FormSheet({
  id,
  className,
  children,
  disabled,
  trigger,
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  onSubmitForm = () => {},
  onSuccess,
  preventClose = false,
  onBeforeClose,
  size = DrawerSize.MD,
  withoutCloseButton = false,
}: FormSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) setInternalOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setHasError(false)

    try {
      await onSubmitForm()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      setHasError(true)
      if (error instanceof Error) {
        console.error('Form submission error:', error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setHasError(false)
      setOpen(newOpen)
      return
    }

    if (isSubmitting) return

    if (preventClose && onBeforeClose && !onBeforeClose()) return
    if (preventClose && !onBeforeClose) return

    setOpen(newOpen)
  }

  const drawerFooter: DrawerCommonProps['drawerFooter'] = (
    <Button
      type="button"
      onClick={handleSubmit}
      disabled={disabled || isSubmitting}
      className="min-w-[100px]"
      variant={hasError ? 'destructive' : 'default'}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : hasError ? (
        'Coba Lagi'
      ) : (
        'Submit'
      )}
    </Button>
  )

  return (
    <DrawerCommon
      isOpen={open}
      onOpen={() => handleOpenChange(true)}
      onClose={() => handleOpenChange(false)}
      title={title}
      subtitle={description}
      size={size}
      className={className}
      contentClassName="px-2"
      drawerFooter={drawerFooter}
      trigger={trigger}
      triggerDisabled={disabled}
      withoutCloseButton={withoutCloseButton}
      preventCloseOnOutsideClick
      preventCloseOnEscape
    >
      <div id={id}>{children}</div>
    </DrawerCommon>
  )
}
