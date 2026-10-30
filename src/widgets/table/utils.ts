import { rankItem } from '@tanstack/match-sorter-utils'
import type { Column, FilterFn } from '@tanstack/react-table'

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank,
  })

  return itemRank.passed
}

/**
 * Global variant of `fuzzyFilter`. Global filtering runs once per column, so it
 * must not write per-column filter metadata.
 */
export const globalFuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  return rankItem(row.getValue(columnId), value).passed
}

const ACTION_HEADER_PATTERN = /^(aksi|action|actions|opsi)$/i

/**
 * Detects the actions column either from its explicit `meta.fixed` marker or
 * from its id/header, so every table gets the same pinned actions column.
 */
export function isFixedRightColumn<T>(column: Column<T, unknown>): boolean {
  if (column.columnDef.meta?.fixed === 'right') {
    return true
  }

  const header = column.columnDef.header

  return (
    column.id === 'actions' ||
    (typeof header === 'string' && ACTION_HEADER_PATTERN.test(header.trim()))
  )
}

/** Shared classes that pin a cell to the right edge of a scrolling table. */
export const fixedRightCellClass =
  'sticky right-0 w-px whitespace-nowrap border-l border-border bg-card shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.12)]'

export const fixedRightHeaderClass = `${fixedRightCellClass} z-30`
export const fixedRightBodyClass = `${fixedRightCellClass} z-[1]`
