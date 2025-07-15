'use client'

import { Button } from '@promo/components/ui/button'
import { usersListEvents } from '@promo/events/users-list'
import { UserX } from 'lucide-react'

export function DisableAllUsersSelected() {
  function handleDisableSelectedRows() {
    window.dispatchEvent(
      new CustomEvent(usersListEvents.disableAllEvents, {
        detail: {},
      }),
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full @lg:w-auto"
      onClick={handleDisableSelectedRows}
    >
      <UserX className="size-4" />
      Desativar Selecionados
    </Button>
  )
}
