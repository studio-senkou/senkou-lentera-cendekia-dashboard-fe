import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-lg text-sm font-medium outline-none transition-[background-color,box-shadow,color] select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          'button-emphasis [--btn-emphasis:var(--primary)] text-white ring-1 ring-[var(--button-emphasis-ring)] focus-visible:ring-2 focus-visible:ring-[var(--button-emphasis-ring)] active:ring-[var(--button-emphasis-ring)]',
        destructive:
          'bg-card text-destructive shadow-xs ring-1 ring-border hover:bg-destructive/10 hover:text-destructive hover:ring-destructive/25 active:bg-destructive/15',
        outline:
          'bg-transparent text-foreground shadow-none ring-1 ring-border hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-card text-foreground shadow-xs ring-1 ring-border hover:bg-muted active:bg-muted/80',
        ghost:
          'bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-foreground active:bg-accent',
        link: 'text-primary shadow-none underline-offset-4 hover:underline',
        success:
          'border border-emerald-600/20 bg-emerald-50 text-emerald-700 shadow-xs hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60',
        warning:
          'border border-amber-600/20 bg-amber-50 text-amber-700 shadow-xs hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60',
      },
      size: {
        default: 'h-9 rounded-lg px-3 pb-0.5 text-sm',
        sm: 'h-8 rounded-md px-2.5 text-xs',
        lg: 'h-10 rounded-lg px-4 pb-0.5 text-sm',
        icon: 'size-9 rounded-lg p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
