import { useStore } from '@tanstack/react-form'
import { useCallback } from 'react'

import { useFieldContext } from '../hooks/form-context'
import type { ComboboxOption } from '@/shared/ui/combobox'
import { Combobox, MultiCombobox } from '@/shared/ui/combobox'
import { FormField, fieldErrorMessage } from '@/shared/ui/form-field'

export function ComboboxField({
  label,
  options = [],
  placeholder,
  searchPlaceholder,
  emptyMessage,
  clearable = false,
  loading = false,
  loadingMessage,
  required = false,
  disabled = false,
  className,
  buttonClassName,
  contentClassName,
  width = 'w-full',
}: {
  label: string
  options: Array<ComboboxOption>
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearable?: boolean
  loading?: boolean
  loadingMessage?: string
  required?: boolean
  disabled?: boolean
  className?: string
  buttonClassName?: string
  contentClassName?: string
  width?: string | number
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const error = fieldErrorMessage(errors)

  const handleValueChange = useCallback(
    (value: string) => {
      field.handleChange(value)
    },
    [field],
  )

  return (
    <FormField
      label={label}
      htmlFor={field.name}
      required={required}
      error={field.state.meta.isTouched ? error : undefined}
    >
      <Combobox
        options={options}
        value={field.state.value || ''}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        clearable={clearable}
        loading={loading}
        loadingMessage={loadingMessage}
        disabled={disabled}
        className={className}
        buttonClassName={buttonClassName}
        contentClassName={contentClassName}
        width={width}
      />
    </FormField>
  )
}

export function MultiComboboxField({
  label,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  maxSelected,
  displayValue,
  showSelectedCount = true,
  loading = false,
  loadingMessage,
  required = false,
  disabled = false,
  className,
  buttonClassName,
  contentClassName,
  width = 'w-full',
}: {
  label: string
  options: Array<ComboboxOption>
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  maxSelected?: number
  displayValue?: (selectedCount: number) => string
  showSelectedCount?: boolean
  loading?: boolean
  loadingMessage?: string
  required?: boolean
  disabled?: boolean
  className?: string
  buttonClassName?: string
  contentClassName?: string
  width?: string | number
}) {
  const field = useFieldContext<Array<string>>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const error = fieldErrorMessage(errors)

  const handleValueChange = useCallback(
    (values: Array<string>) => {
      field.handleChange(values)
    },
    [field],
  )

  return (
    <FormField
      label={label}
      htmlFor={field.name}
      required={required}
      error={field.state.meta.isTouched ? error : undefined}
    >
      <MultiCombobox
        options={options}
        value={field.state.value}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        maxSelected={maxSelected}
        displayValue={displayValue}
        showSelectedCount={showSelectedCount}
        loading={loading}
        loadingMessage={loadingMessage}
        disabled={disabled}
        className={className}
        buttonClassName={buttonClassName}
        contentClassName={contentClassName}
        width={width}
      />
    </FormField>
  )
}
