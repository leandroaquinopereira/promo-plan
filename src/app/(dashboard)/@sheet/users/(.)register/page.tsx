'use client'

import { useRouter } from '@bprogress/next'
import { RegisterUserForm } from '@promo/app/(dashboard)/users/register/components/form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@promo/components/ui/sheet'
import { useState } from 'react'

export default function RegisterUserSheet() {
  const [sheetOpened, setSheetOpened] = useState(true)
  const router = useRouter()

  function handleOpenStateChange(open: boolean) {
    if (!open) {
      router.push('/users')
    }

    setSheetOpened(open)
  }

  return (
    <Sheet open={sheetOpened} onOpenChange={handleOpenStateChange}>
      <SheetContent className="px-4 w-screen md:max-w-2xl">
        <SheetHeader className="px-0">
          <SheetTitle>Cadastrar Usuário</SheetTitle>
          <SheetDescription>
            Preencha os dados abaixo para criar um novo usuário no sistema.
          </SheetDescription>
        </SheetHeader>

        <RegisterUserForm onSubmit={() => handleOpenStateChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
