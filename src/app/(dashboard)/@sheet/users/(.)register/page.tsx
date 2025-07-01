import { RegisterUserForm } from '@promo/app/(dashboard)/users/register/components/form'
import { InterceptedSheetContent } from '@promo/components/intercepted-sheet-content'
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@promo/components/ui/sheet'

export default async function RegisterUserSheet() {
  return (
    <Sheet defaultOpen>
      <InterceptedSheetContent className="px-4 w-screen md:max-w-2xl">
        <SheetHeader className="px-0">
          <SheetTitle>Cadastrar Usuário</SheetTitle>
          <SheetDescription>
            Preencha os dados abaixo para criar um novo usuário no sistema.
          </SheetDescription>
        </SheetHeader>

        <RegisterUserForm />
      </InterceptedSheetContent>
    </Sheet>
  )
}
