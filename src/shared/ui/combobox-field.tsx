import { useStore } from '@tanstack/react-form'
import { useCallback } from 'react';
import { useFieldContext } from '../hooks/form-context'
import { Label } from './label'
import type {ComboboxOption} from '@/shared/ui/combobox';
import {
  Combobox,
  
  MultiCombobox
} from '@/shared/ui/combobox'

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 text-sm"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

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

  const handleValueChange = useCallback(
    (value: string) => {
      field.handleChange(value)
    },
    [field],
  )

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={field.name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
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
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
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

  const handleValueChange = useCallback(
    (values: Array<string>) => {
      field.handleChange(values)
    },
    [field],
  )

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={field.name} className="px-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </Label>
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
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
