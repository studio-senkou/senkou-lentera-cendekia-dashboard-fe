import { cn } from '@/lib/utils'
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

interface FormSheetProps {
  id?: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
  trigger: React.ReactNode
  title: string
  description?: string
  onSubmitForm?: () => Promise<void> | void
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
}: FormSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild disabled={disabled}>
        {trigger}
      </SheetTrigger>
      <SheetContent id={id} className={cn('max-w-2xl', className)}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
        <SheetFooter>
          <Button type="button" onClick={onSubmitForm} disabled={disabled}>
            Submit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
