import { EllipsisVertical } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export interface RowActionOverflow {
  icon: ReactNode
  label: string
  onSelect: () => void
  variant?: 'default' | 'destructive'
  group?: string
  groupIcon?: ReactNode
}

export interface RowAction {
  key: string
  /** The inline control rendered in the row. */
  node: ReactNode
  /** Menu entry used when the action is pushed into the overflow menu. */
  overflow?: RowActionOverflow
  /** Always render this action inside the overflow menu. */
  alwaysOverflow?: boolean
  hidden?: boolean
}

type OverflowRowAction = RowAction & { overflow: RowActionOverflow }

type RowActionEntry =
  | { type: 'item'; action: OverflowRowAction }
  | {
      type: 'group'
      name: string
      icon?: ReactNode
      actions: Array<OverflowRowAction>
    }

export interface RowActionsProps {
  actions: Array<RowAction>
  maxVisible?: number
  className?: string
}

/**
 * Renders a table row's actions inline and demotes the extras into an
 * overflow menu, mirroring the shared row-actions pattern.
 */
export function RowActions({
  actions,
  maxVisible = 3,
  className,
}: RowActionsProps) {
  const visible = actions.filter((action) => !action.hidden)

  const forced = visible.filter(
    (action): action is OverflowRowAction =>
      !!action.overflow && !!action.alwaysOverflow,
  )

  const overflowable = visible.filter(
    (action): action is OverflowRowAction =>
      !!action.overflow && !action.alwaysOverflow,
  )

  const fixedCount = visible.length - overflowable.length - forced.length

  const overflowCount = Math.max(
    0,
    overflowable.length - (maxVisible - fixedCount),
  )

  const demoted: Array<OverflowRowAction> = [
    ...forced,
    ...(overflowCount > 0 ? overflowable.slice(-overflowCount) : []),
  ]

  const shown = visible.filter(
    (action) => !demoted.includes(action as OverflowRowAction),
  )

  const entries: Array<RowActionEntry> = []
  demoted.forEach((action) => {
    const group = action.overflow.group
    if (!group) {
      entries.push({ type: 'item', action })
      return
    }

    const existing = entries.find(
      (entry): entry is Extract<RowActionEntry, { type: 'group' }> =>
        entry.type === 'group' && entry.name === group,
    )

    if (existing) {
      existing.actions.push(action)
    } else {
      entries.push({
        type: 'group',
        name: group,
        icon: action.overflow.groupIcon,
        actions: [action],
      })
    }
  })

  if (shown.length === 0 && demoted.length === 0) return null

  return (
    <div
      className={cn('flex items-center justify-end gap-2', className)}
      data-slot="row-actions"
    >
      {shown.map((action) => (
        <span key={action.key}>{action.node}</span>
      ))}

      {demoted.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Aksi lainnya"
              data-testid="row-actions-overflow-trigger"
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {entries.map((entry) =>
              entry.type === 'item' ? (
                <DropdownMenuItem
                  key={entry.action.key}
                  variant={entry.action.overflow.variant ?? 'default'}
                  onClick={entry.action.overflow.onSelect}
                >
                  {entry.action.overflow.icon}
                  {entry.action.overflow.label}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuSub key={entry.name}>
                  <DropdownMenuSubTrigger>
                    {entry.icon}
                    {entry.name}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {entry.actions.map((action) => (
                      <DropdownMenuItem
                        key={action.key}
                        variant={action.overflow.variant ?? 'default'}
                        onClick={action.overflow.onSelect}
                      >
                        {action.overflow.icon}
                        {action.overflow.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
