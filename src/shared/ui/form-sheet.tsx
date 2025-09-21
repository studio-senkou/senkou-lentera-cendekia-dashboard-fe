import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import { Button } from '../ui/button'
import { cn } from '@/shared/lib/utils'

interface FormSheetProps {
  id?: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
  trigger: React.ReactNode
  title: string
  description?: string
  onSubmitForm?: () => Promise<void> | void
  onSuccess?: () => void
  preventClose?: boolean
  onBeforeClose?: () => boolean
}

export function FormSheet({
  id,
  className,
  children,
  disabled,
  trigger,
  title,
  description,
  onSubmitForm = () => {},
  onSuccess,
  preventClose = false,
  onBeforeClose,
}: FormSheetProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild disabled={disabled}>
        {trigger}
      </SheetTrigger>
      <SheetContent
        id={id}
        className={cn('max-w-2xl flex flex-col', className)}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-1 pb-4">{children}</div>
        <SheetFooter className="flex-shrink-0 border-t bg-background pt-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || isSubmitting}
            className="min-w-[100px]"
            variant={hasError ? 'destructive' : 'default'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : hasError ? (
              'Coba Lagi'
            ) : (
              'Submit'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
