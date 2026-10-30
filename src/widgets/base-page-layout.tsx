import type { ComponentProps, ReactNode } from 'react'

import { useHeaderStore } from '@/shared/hooks/use-header'
import { cn } from '@/shared/lib/utils'

export interface BasePageLayoutProps
  extends Omit<ComponentProps<'section'>, 'title' | 'subtitle'> {
  title?: ReactNode
  subtitle?: ReactNode
  backgrounded?: boolean
  titleTestId?: string
}

export default function BasePageLayout({
  children,
  className,
  title,
  subtitle,
  backgrounded = true,
  titleTestId,
  ...rest
}: BasePageLayoutProps) {
  const pageTitle = useHeaderStore((state) => state.title)
  const resolvedTitle = title ?? pageTitle
  const hasHeader = Boolean(resolvedTitle || subtitle)

  return (
    <>
      {hasHeader && (
        <div className="flex flex-col space-y-2">
          {resolvedTitle &&
            (typeof resolvedTitle === 'string' ? (
              <h1 className="text-2xl font-medium" data-testid={titleTestId}>
                {resolvedTitle}
              </h1>
            ) : (
              resolvedTitle
            ))}
          {subtitle &&
            (typeof subtitle === 'string' ? (
              <p className="text-base text-muted-foreground">{subtitle}</p>
            ) : (
              subtitle
            ))}
        </div>
      )}

      <section
        className={cn(
          className,
          backgrounded ? 'bg-card rounded-md p-5' : 'py-5',
          backgrounded && hasHeader && 'mt-5',
        )}
        {...rest}
      >
        {children}
      </section>
    </>
  )
}
