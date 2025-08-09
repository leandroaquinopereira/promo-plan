import { RedirectButton } from '@promo/components/redirect-button'
import { Alert, AlertDescription, AlertTitle } from '@promo/components/ui/alert'
import { ArrowRight, Calendar } from 'lucide-react'

export async function TaskNoDayAlertOverlay() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-auto p-4">
      <div className="absolute inset-0 backdrop-blur-xs bg-black/10" />
      <div className="relative flex items-center justify-center h-full">
        <Alert className="sm:max-w-md">
          <AlertTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            <Calendar className="size-4 text-amber-600 shrink-0" />
            Não é o dia da inspeção
          </AlertTitle>
          <AlertDescription className="text-gray-700 dark:text-gray-300 w-full gap-6">
            As tarefas só podem ser iniciadas durante o período da degustação.
            <div className="flex items-center justify-end w-full">
              <RedirectButton to="/tastings">
                <span className="dark:text-zinc-950">Voltar para listagem</span>
                <ArrowRight className="size-4" />
              </RedirectButton>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
