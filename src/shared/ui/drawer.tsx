import { Children, cloneElement, isValidElement } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'
import type { ReactElement, ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

export const DrawerSize = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  XXL: '2xl',
} as const

export type DrawerSize = (typeof DrawerSize)[keyof typeof DrawerSize]

const DRAWER_SIZE_CLASSES: Record<DrawerSize, string> = {
  [DrawerSize.XS]: 'w-full sm:min-w-[280px] sm:max-w-[320px]',
  [DrawerSize.SM]: 'w-full sm:min-w-[320px] sm:max-w-[384px]',
  [DrawerSize.MD]: 'w-full sm:min-w-[384px] sm:max-w-[448px]',
  [DrawerSize.LG]: 'w-full sm:min-w-[448px] sm:max-w-[512px]',
  [DrawerSize.XL]: 'w-full sm:min-w-[512px] sm:max-w-[640px]',
  [DrawerSize.XXL]: 'w-full sm:min-w-[640px] sm:max-w-[768px]',
}

export interface DrawerCommonProps {
  isOpen: boolean
  onClose: () => void
  onOpen?: () => void
  title: string | ReactNode
  subtitle?: string | ReactNode
  children: ReactNode
  preventCloseOnOutsideClick?: boolean
  preventCloseOnEscape?: boolean
  withoutCloseButton?: boolean
  className?: string
  contentClassName?: string
  drawerFooter?: ReactNode
  size?: DrawerSize
  trigger?: ReactNode
  triggerDisabled?: boolean
}

export function DrawerCommonFooter({ children }: { children: ReactNode }) {
  return <>{children}</>
}
DrawerCommonFooter.displayName = 'DrawerCommonFooter'

type ElementWithChildren = ReactElement<{ children?: ReactNode }>

function isElementWithChildren(el: ReactElement): el is ElementWithChildren {
  return (
    el.props !== null && typeof el.props === 'object' && 'children' in el.props
  )
}

function isDrawerFooter(el: ReactElement): el is ElementWithChildren {
  return (
    el.type === DrawerCommonFooter ||
    (typeof el.type === 'function' &&
      (el.type as { displayName?: string }).displayName ===
        'DrawerCommonFooter')
  )
}

function extractFooter(nodes: ReactNode): {
  content: Array<ReactNode>
  footer: ReactNode | null
} {
  let footer: ReactNode | null = null

  const content = Children.toArray(nodes).flatMap((child) => {
    if (!isValidElement(child)) return child

    if (isDrawerFooter(child)) {
      footer ??= child.props.children ?? null
      return []
    }

    if (
      isElementWithChildren(child) &&
      typeof child.props.children !== 'function' &&
      child.props.children
    ) {
      const result = extractFooter(child.props.children)

      if (result.footer && !footer) footer = result.footer

      return cloneElement(child, { children: result.content })
    }

    return child
  })

  return { content, footer }
}

export function DrawerCommon({
  isOpen,
  onClose,
  onOpen,
  title,
  subtitle,
  children,
  preventCloseOnOutsideClick = false,
  preventCloseOnEscape = false,
  withoutCloseButton = false,
  className,
  contentClassName,
  drawerFooter,
  size = DrawerSize.MD,
  trigger,
  triggerDisabled = false,
}: DrawerCommonProps) {
  const handleOutsideInteraction = (event: Event) => {
    if (preventCloseOnOutsideClick) event.preventDefault()
  }

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (preventCloseOnEscape) event.preventDefault()
  }

  const { content, footer } = extractFooter(children)
  const finalFooter = footer ?? drawerFooter

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          onOpen?.()
          return
        }

        onClose()
      }}
    >
      {trigger && (
        <SheetTrigger asChild disabled={triggerDisabled}>
          {trigger}
        </SheetTrigger>
      )}
      <SheetContent
        data-testid="shared-drawer-common-root"
        className={cn(
          'flex flex-col gap-0',
          DRAWER_SIZE_CLASSES[size],
          className,
        )}
        onInteractOutside={handleOutsideInteraction}
        onEscapeKeyDown={handleEscapeKeyDown}
        onCloseAutoFocus={(event) => event.preventDefault()}
        withoutCloseButton={withoutCloseButton}
      >
        <SheetHeader className="bg-card relative z-10 pb-2 [--blur-fade-bg:var(--card)]">
          <SheetTitle>{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
          <div className="blur-fade-dialog" aria-hidden="true" />
        </SheetHeader>

        <div className={cn('flex-1 overflow-y-auto py-4', contentClassName)}>
          {content}
        </div>

        {finalFooter && (
          <SheetFooter className="mt-auto shrink-0 gap-2 border-t pt-4">
            {finalFooter}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default DrawerCommon
