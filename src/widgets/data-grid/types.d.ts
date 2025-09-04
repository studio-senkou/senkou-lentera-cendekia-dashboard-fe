export interface SelectOption {
  value: unknown
  label: string
}

export interface ChangedRowField {
  oldValue: unknown
  newValue: unknown
}

export interface DataGridChangedRow<T> {
  index: number
  row: T
  field: Record<string, ChangedRowField>
}
