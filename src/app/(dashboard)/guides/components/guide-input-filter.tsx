'use client'

import { useRouter } from '@bprogress/next'
import { useDebouncedCallback } from '@mantine/hooks'
import { Input } from '@promo/components/ui/input'
import { useQueryState } from 'nuqs'

export function GuideInputFilter() {
  const [query, setQuery] = useQueryState('q', {
    defaultValue: '',
  })

  const router = useRouter()

  const handleSetQuery = useDebouncedCallback(function () {
    router.refresh()
  }, 500)

  return (
    <Input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        handleSetQuery()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          router.refresh()
        }
      }}
      placeholder="Pesquise pelo nome..."
      className="border-0 focus-visible:ring-0 focus-visible:border-0 shadow-none px-0 !bg-transparent"
    />
  )
}
