import { Check, ChevronsUpDown, X } from 'lucide-react'

import {  useCallback, useMemo, useState } from 'react'
import type {MouseEventHandler} from 'react';
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: Array<ComboboxOption>
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  contentClassName?: string
  width?: string | number
  clearable?: boolean
  loading?: boolean
  loadingMessage?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  disabled = false,
  className,
  buttonClassName,
  contentClassName,
  width = 'w-[200px]',
  clearable = false,
  loading = false,
  loadingMessage = 'Loading...',
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onValueChange?.(selectedValue)
      setOpen(false)
      setSearchValue('')
    },
    [onValueChange],
  )

  const handleClear: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation()
      onValueChange?.('')
      setSearchValue('')
    },
    [onValueChange],
  )

  const filteredOptions = useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [options, searchValue])

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              typeof width === 'string' ? width : `w-[${width}px]`,
              'justify-between',
              !selectedOption && 'text-muted-foreground',
              buttonClassName,
            )}
            disabled={disabled || loading}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center gap-1">
              {clearable && selectedOption && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            typeof width === 'string' ? width : `w-[${width}px]`,
            'p-0',
            contentClassName,
          )}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>{loadingMessage}</CommandEmpty>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={(currentValue) => {
                        handleSelect(currentValue === value ? "" : currentValue)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export interface MultiComboboxProps
  extends Omit<ComboboxProps, 'value' | 'onValueChange' | 'clearable'> {
  value?: Array<string>
  onValueChange?: (value: Array<string>) => void
  maxSelected?: number
  displayValue?: (selectedCount: number) => string
  showSelectedCount?: boolean
}

export function MultiCombobox({
  options = [],
  value = [],
  onValueChange,
  placeholder = 'Select options...',
  maxSelected,
  displayValue,
  showSelectedCount = true,
  ...props
}: MultiComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  )

  const getDisplayValue = useCallback(() => {
    if (selectedOptions.length === 0) return placeholder
    if (displayValue) return displayValue(selectedOptions.length)
    if (selectedOptions.length === 1) return selectedOptions[0].label
    if (showSelectedCount) return `${selectedOptions.length} selected`
    return selectedOptions.map((opt) => opt.label).join(', ')
  }, [selectedOptions, placeholder, displayValue, showSelectedCount])

  const handleSelect = useCallback(
    (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : maxSelected && value.length >= maxSelected
          ? value
          : [...value, optionValue]

      onValueChange?.(newValue)
    },
    [value, maxSelected, onValueChange],
  )

  const handleClearAll: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation()
      onValueChange?.([])
      setSearchValue('')
    },
    [onValueChange],
  )

  const filteredOptions = useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [options, searchValue])

  return (
    <div className={cn('relative', props.className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              typeof props.width === 'string'
                ? props.width
                : `w-[${props.width || 200}px]`,
              'justify-between',
              selectedOptions.length === 0 && 'text-muted-foreground',
              props.buttonClassName,
            )}
            disabled={props.disabled || props.loading}
          >
            <span className="truncate">{getDisplayValue()}</span>
            <div className="flex items-center gap-1">
              {selectedOptions.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={handleClearAll}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            typeof props.width === 'string'
              ? props.width
              : `w-[${props.width || 200}px]`,
            'p-0',
            props.contentClassName,
          )}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={props.searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              {props.loading ? (
                <CommandEmpty>{props.loadingMessage}</CommandEmpty>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty>{props.emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = value.includes(option.value)
                    const isDisabled = Boolean(
                      option.disabled ||
                        (maxSelected &&
                          !isSelected &&
                          value.length >= maxSelected),
                    )

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={isDisabled}
                        onSelect={(currentValue) => {
                          handleSelect(currentValue)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="flex-1">{option.label}</span>
                        {maxSelected &&
                          !isSelected &&
                          value.length >= maxSelected && (
                            <span className="text-xs text-muted-foreground">
                              Max reached
                            </span>
                          )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
