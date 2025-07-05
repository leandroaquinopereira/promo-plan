import { RegisterCompanyForm } from '@promo/app/(dashboard)/companies/register/components/form'
import { InterceptedSheetContent } from '@promo/components/intercepted-sheet-content'
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@promo/components/ui/sheet'

export default async function RegisterCompanySheet() {
  return (
    <Sheet defaultOpen>
      <InterceptedSheetContent className="px-4 w-screen md:max-w-2xl">
        <SheetHeader className="px-0">
          <SheetTitle>Cadastrar Empresa</SheetTitle>
          <SheetDescription>
            Preencha os dados abaixo para criar uma nova empresa no sistema.
          </SheetDescription>
        </SheetHeader>

        <RegisterCompanyForm />
      </InterceptedSheetContent>
    </Sheet>
  )
}
