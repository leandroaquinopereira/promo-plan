'use client'

import { useDebouncedState } from '@mantine/hooks'
import { Button } from '@promo/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@promo/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@promo/components/ui/popover'
import { QueryKeys } from '@promo/constants/query-keys'
import { cn } from '@promo/lib/utils'
import { buildSeparator } from '@promo/utils/build-value-for-combobox'
import { extractValueFromCombobox } from '@promo/utils/extract-value-from-combobox'
import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDownIcon, Loader } from 'lucide-react'
import { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type Option = {
  value: string
  label: string
  raw?: any
}

type ComboboxProps = {
  placeholder?: string
  queryFn: (query: string) => Promise<Option[]>
  value: string
  onChange: (value: string, raw?: any) => void
  toasts?: {
    loadingError?: string
  }
  loadingText?: string
  entity: string
  disabled?: boolean
}

const ComboboxComp = function ({
  placeholder,
  queryFn,
  value,
  onChange,
  toasts,
  loadingText = 'Carregando...',
  entity,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useDebouncedState('', 300)

  const popoverTriggerRef = useRef<HTMLButtonElement>(null)
  const popoverContentRef = useRef<HTMLDivElement>(null)

  const {
    data: options,
    isLoading: isLoadingOptions,
    refetch,
  } = useQuery({
    queryKey: QueryKeys.users.combobox(searchQuery, entity),
    queryFn: async () => {
      try {
        const options = await queryFn(searchQuery)

        return options
      } catch (error) {
        toast.error(toasts?.loadingError || 'Erro ao buscar opções', {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido',
        })

        return []
      }
    },
    initialData: [],
  })

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (open && popoverTriggerRef.current) {
      timeout = setTimeout(() => {
        if (popoverContentRef.current) {
          popoverContentRef.current.style.width =
            popoverTriggerRef.current?.clientWidth + 'px'
        }
      }, 10)
    }

    return () => clearTimeout(timeout)
  }, [open, popoverTriggerRef, popoverContentRef])

  useEffect(() => {
    refetch()
  }, [searchQuery, refetch])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between gap-2 px-2"
          data-value={extractValueFromCombobox(value)}
          isLoading={isLoadingOptions}
          icon={ChevronsUpDownIcon}
          iconPosition="right"
          iconClassName="ml-auto"
          contentContainerClassName="w-full"
          ref={popoverTriggerRef}
        >
          {value
            ? options.find((option) => {
                const hasSeparatorInValue = value?.includes(buildSeparator)

                if (hasSeparatorInValue) {
                  return option.raw?.id === extractValueFromCombobox(value)
                }

                return option.raw?.id === value
              })?.label || value
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={popoverContentRef} className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Pesquisar..."
            onValueChange={(value) => setSearchQuery(value)}
          />
          <CommandList>
            {isLoadingOptions ? (
              <CommandItem className="flex cursor-progress items-center gap-2 py-12 !bg-white w-full justify-center text-center">
                <Loader className="ml-2 size-4 shrink-0 opacity-50 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {loadingText}
                </span>
              </CommandItem>
            ) : (
              <Fragment>
                <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    let isSelected = false
                    const hasSeparatorInValue = value?.includes(buildSeparator)

                    if (hasSeparatorInValue) {
                      isSelected =
                        option.raw?.id === extractValueFromCombobox(value)
                    } else {
                      isSelected = option.raw?.id === value
                    }

                    return (
                      <CommandItem
                        className="cursor-pointer"
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          onChange(
                            currentValue === value ? '' : currentValue,
                            currentValue === value ? undefined : option.raw,
                          )
                          setOpen(false)
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 size-4',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </Fragment>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const Combobox = memo(ComboboxComp)
