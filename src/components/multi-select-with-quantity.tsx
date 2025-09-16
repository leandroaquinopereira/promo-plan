'use client'

import { useDebouncedValue } from '@mantine/hooks'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@promo/components/ui/command'
import { cn } from '@promo/lib/utils'
import { Command as CommandPrimitive, useCommandState } from 'cmdk'
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react'
import {
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { MultiselectItem } from './multiselect-item'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export interface Option {
  value: string
  label: string
  disable?: boolean
  /** fixed option that can't be removed. */
  fixed?: boolean
  /** quantity of the selected option. */
  quantity?: number
  /** Group the options by providing key. */
  [key: string]: string | boolean | number | undefined
}
interface GroupOption {
  [key: string]: Option[]
}

export type MultipleSelectorWithQuantityRef = {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}

interface MultipleSelectorWithQuantityProps {
  value?: Option[]
  defaultOptions?: Option[]

  ref?: RefObject<MultipleSelectorWithQuantityRef | null>

  /**
   * @param isLoading - Whether the options are loading
   */
  isLoading?: boolean

  /**
   * @param value - The value of the search input
   * @returns void
   */
  onInputValueChange?: (value: string) => void

  /** manually controlled options */
  options?: Option[]
  placeholder?: string
  /** Loading component. */
  loadingIndicator?: React.ReactNode
  /** Empty component. */
  emptyIndicator?: React.ReactNode
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number
  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`.
   * For example, when user click on the input, it will trigger the search to get initial options.
   **/
  triggerSearchOnFocus?: boolean
  /** async search */
  onSearch?: (value: string) => Promise<Option[]>
  /**
   * sync search. This search will not showing loadingIndicator.
   * The rest props are the same as async search.
   * i.e.: creatable, groupBy, delay.
   **/
  onSearchSync?: (value: string) => Option[]
  onChange?: (options: Option[]) => void
  /** Limit the maximum number of selected options. */
  maxSelected?: number
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean
  disabled?: boolean
  /** Group the options base on provided key. */
  groupBy?: string
  className?: string
  badgeClassName?: string
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    'value' | 'placeholder' | 'disabled'
  >
  /** hide the clear all button. */
  hideClearAllButton?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {}
  }
  if (!groupBy) {
    return {
      '': options,
    }
  }

  const groupOption: GroupOption = {}
  options.forEach((option) => {
    const key = (option[groupBy] as string) || ''
    if (!groupOption[key]) {
      groupOption[key] = []
    }
    groupOption[key].push(option)
  })
  return groupOption
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value),
    )
  }
  return cloneOption
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    ) {
      return true
    }
  }
  return false
}

const CommandEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
  const render = useCommandState((state) => state.filtered.count === 0)

  if (!render) return null

  return (
    <div
      className={cn('px-2 py-4 text-center text-sm', className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  )
}

CommandEmpty.displayName = 'CommandEmpty'

function MultipleSelectorWithQuantity({
  value,
  onChange,
  placeholder,
  defaultOptions: arrayDefaultOptions = [],
  options: arrayOptions,
  delay,
  onSearch,
  onSearchSync,
  onInputValueChange,
  loadingIndicator,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  disabled,
  groupBy,
  className,
  badgeClassName,
  selectFirstItem = true,
  creatable = false,
  triggerSearchOnFocus = false,
  commandProps,
  inputProps,
  hideClearAllButton = false,
  ref,
}: MultipleSelectorWithQuantityProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [onScrollbar, setOnScrollbar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null) // Added this

  const [internalSelected, setInternalSelected] = useState<Option[]>(
    value || [],
  )
  const [options, setOptions] = useState<GroupOption>(
    transToGroupOption(arrayDefaultOptions, groupBy),
  )
  const [inputValue, setInputValue] = useState('')
  const [debouncedSearchTerm] = useDebouncedValue(inputValue, delay || 500)

  // Use controlled or uncontrolled pattern
  const selected = value || internalSelected
  const setSelected = useMemo(
    () =>
      value
        ? (newValue: Option[]) => onChange?.(newValue)
        : setInternalSelected,
    [value, onChange],
  )

  function handleClickOutside(event: MouseEvent | TouchEvent) {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setOpen(false)
      inputRef.current.blur()
    }
  }

  const handleUnselect = useCallback(
    (option: Option) => {
      const newOptions = selected.filter((s) => s.value !== option.value)
      setSelected(newOptions)
    },
    [selected, setSelected],
  )

  const handleQuantityChange = useCallback(
    (optionValue: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        handleUnselect({ value: optionValue } as Option)
        return
      }

      const newOptions = selected.map((s) =>
        s.value === optionValue ? { ...s, quantity: newQuantity } : s,
      )

      setSelected(newOptions)
    },
    [selected, setSelected, handleUnselect],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && selected.length > 0) {
            const lastSelectOption = selected[selected.length - 1]
            if (!lastSelectOption.fixed) {
              handleUnselect(selected[selected.length - 1])
            }
          }
        }

        if (e.key === 'Escape') {
          input.blur()
        }
      }
    },
    [handleUnselect, selected],
  )

  useImperativeHandle(ref, () => ({
    selectedValue: selected,
    input: inputRef.current as HTMLInputElement,
    focus: () => inputRef.current?.focus(),
    reset: () => setSelected([]),
  }))

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchend', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside)
    }
  }, [open])

  useEffect(() => {
    if (!arrayOptions || onSearch) {
      return
    }
    const newOption = transToGroupOption(arrayOptions || [], groupBy)
    if (JSON.stringify(newOption) !== JSON.stringify(options)) {
      setOptions(newOption)
    }
  }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options])

  useEffect(() => {
    const doSearchSync = () => {
      const res = onSearchSync?.(debouncedSearchTerm)
      setOptions(transToGroupOption(res || [], groupBy))
    }

    const exec = async () => {
      if (!onSearchSync || !open) return

      if (triggerSearchOnFocus) {
        doSearchSync()
      }

      if (debouncedSearchTerm) {
        doSearchSync()
      }
    }

    void exec()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

  useEffect(() => {
    async function doSearch() {
      setIsLoading(true)
      const res = await onSearch?.(debouncedSearchTerm)
      setOptions(transToGroupOption(res || [], groupBy))
      setIsLoading(false)
    }

    async function exec() {
      if (!onSearch || !open) return

      if (triggerSearchOnFocus) {
        await doSearch()
      }

      if (debouncedSearchTerm) {
        await doSearch()
      }
    }

    void exec()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus])

  function CreatableItem() {
    if (!creatable) return undefined
    if (
      isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
      selected.find((s) => s.value === inputValue)
    ) {
      return undefined
    }

    const Item = (
      <CommandItem
        value={inputValue}
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onSelect={(value: string) => {
          if (selected.length >= maxSelected) {
            onMaxSelected?.(selected.length)
            return
          }
          setInputValue('')
          onInputValueChange?.(value)
          const newOptions = [...selected, { value, label: value, quantity: 1 }]
          setSelected(newOptions)
        }}
      >
        {`Create "${inputValue}"`}
      </CommandItem>
    )

    // For normal creatable
    if (!onSearch && inputValue.length > 0) {
      return Item
    }

    // For async search creatable. avoid showing creatable item before loading at first.
    if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
      return Item
    }

    return undefined
  }

  const EmptyItem = useCallback(() => {
    if (!emptyIndicator) return undefined

    // For async search that showing emptyIndicator
    if (onSearch && !creatable && Object.keys(options).length === 0) {
      return (
        <CommandItem value="-" disabled>
          {emptyIndicator}
        </CommandItem>
      )
    }

    return <CommandEmpty>{emptyIndicator}</CommandEmpty>
  }, [creatable, emptyIndicator, onSearch, options])

  const selectables = useMemo<GroupOption>(
    () => removePickedOption(options, selected),
    [options, selected],
  )

  /** Avoid Creatable Selector freezing or lagging when paste a long string. */
  const commandFilter = useCallback(() => {
    if (commandProps?.filter) {
      return commandProps.filter
    }

    if (creatable) {
      return (value: string, search: string) => {
        return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
      }
    }
    // Using default filter in `cmdk`. We don&lsquo;t have to provide it.
    return undefined
  }, [creatable, commandProps?.filter])

  return (
    <div
      className={cn(
        'w-full border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive relative min-h-[38px] rounded-md border text-sm transition-[color,box-shadow] outline-none focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50',
        {
          'p-1': selected.length !== 0,
          'cursor-text': !disabled && selected.length !== 0,
        },
        !hideClearAllButton && 'pe-9',
        className,
      )}
    >
      <div className="flex flex-wrap gap-1">
        {selected.map((option) => {
          return (
            <MultiselectItem
              key={option.value}
              quantity={option.quantity || 1}
              option={option}
              badgeClassName={badgeClassName}
              disabled={disabled}
              onQuantityChange={handleQuantityChange}
              onUnselect={handleUnselect}
            />
          )
        })}
        {/* Avoid having the "Search" Icon */}
      </div>
      <Command
        ref={dropdownRef}
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e)
          commandProps?.onKeyDown?.(e)
        }}
        className={cn(
          'h-auto overflow-visible bg-transparent dark:bg-input/30',
          commandProps?.className,
        )}
        shouldFilter={
          commandProps?.shouldFilter !== undefined
            ? commandProps.shouldFilter
            : !onSearch
        } // When onSearch is provided, we don&lsquo;t want to filter the options. You can still override it.
        filter={commandFilter()}
      >
        <div
          className="w-full h-9"
          onClick={() => {
            if (disabled) return
            inputRef?.current?.focus()
          }}
        >
          <CommandPrimitive.Input
            {...inputProps}
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={(value) => {
              setInputValue(value)
              onInputValueChange?.(value)
              inputProps?.onValueChange?.(value)
            }}
            onBlur={(event) => {
              if (!onScrollbar) {
                setOpen(false)
              }
              inputProps?.onBlur?.(event)
            }}
            onFocus={(event) => {
              setOpen(true)
              if (triggerSearchOnFocus) {
                onSearch?.(debouncedSearchTerm)
              }
              inputProps?.onFocus?.(event)
            }}
            placeholder={
              hidePlaceholderWhenSelected && selected.length !== 0
                ? ''
                : placeholder
            }
            className={cn(
              'placeholder:text-muted-foreground/70 flex-1 bg-transparent outline-hidden disabled:cursor-not-allowed h-9',
              {
                'w-full': hidePlaceholderWhenSelected,
                'px-3 py-2': selected.length === 0,
                'ml-1': selected.length !== 0,
              },
              inputProps?.className,
            )}
          />
          <button
            type="button"
            onClick={() => {
              const filteredOptions = selected.filter((s) => s.fixed)
              setSelected(filteredOptions)
            }}
            className={cn(
              'text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute end-0 top-0 flex size-9 items-center justify-center rounded-md border border-transparent transition-[color,box-shadow] outline-none focus-visible:ring-[3px]',
              (hideClearAllButton ||
                disabled ||
                selected.length < 1 ||
                selected.filter((s) => s.fixed).length === selected.length) &&
                'hidden',
            )}
            aria-label="Clear all"
          >
            <XIcon size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="relative">
          <div
            className={cn(
              'border-input absolute top-2 z-50 w-full overflow-hidden rounded-md border',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              !open && 'hidden',
            )}
            data-state={open ? 'open' : 'closed'}
          >
            {open && (
              <CommandList
                className="bg-popover text-popover-foreground shadow-lg outline-hidden"
                onMouseLeave={() => {
                  setOnScrollbar(false)
                }}
                onMouseEnter={() => {
                  setOnScrollbar(true)
                }}
                onMouseUp={() => {
                  inputRef?.current?.focus()
                }}
              >
                {isLoading ? (
                  <>{loadingIndicator}</>
                ) : (
                  <>
                    {EmptyItem()}
                    {CreatableItem()}
                    {!selectFirstItem && (
                      <CommandItem value="-" className="hidden" />
                    )}
                    {Object.entries(selectables).map(([key, dropdowns]) => (
                      <CommandGroup
                        key={key}
                        heading={key}
                        className="h-full overflow-auto"
                      >
                        <>
                          {dropdowns.map((option) => {
                            return (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                disabled={option.disable}
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                onSelect={() => {
                                  if (selected.length >= maxSelected) {
                                    onMaxSelected?.(selected.length)
                                    return
                                  }
                                  setInputValue('')
                                  onInputValueChange?.(option.value)
                                  const newOptions = [
                                    ...selected,
                                    { ...option, quantity: 1 },
                                  ]
                                  setSelected(newOptions)
                                }}
                                className={cn(
                                  'cursor-pointer',
                                  option.disable &&
                                    'pointer-events-none cursor-not-allowed opacity-50',
                                )}
                              >
                                {option.label}
                              </CommandItem>
                            )
                          })}
                        </>
                      </CommandGroup>
                    ))}
                  </>
                )}
              </CommandList>
            )}
          </div>
        </div>
      </Command>
    </div>
  )
}

MultipleSelectorWithQuantity.displayName = 'MultipleSelectorWithQuantity'
export { MultipleSelectorWithQuantity }
