'use client'

import { useRouter } from '@bprogress/next'
import { deleteGuideByIdAction } from '@promo/actions/delete-guide'
import { Button } from '@promo/components/ui/button'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { Loader, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

type DeleteGuideButtonProps = {
  guideId: string
}

export function DeleteGuideButton({ guideId }: DeleteGuideButtonProps) {
  const { execute, isPending: isDeletingGuide } = useServerAction(
    deleteGuideByIdAction,
  )

  const router = useRouter()

  async function handleDeleteGuide() {
    const [result, resultError] = await execute({ guideId })

    if (resultError) {
      toast.error('Erro ao excluir guia.', {
        description: 'Por favor, tente novamente mais tarde.',
      })
      return
    }

    if (!result.success) {
      let errorMessage = 'Erro ao excluir guia.'
      switch (result.error?.code) {
        case FirebaseErrorCode.OBJECT_NOT_FOUND:
          errorMessage = 'Guia não encontrado. Por favor, recarregue a página.'
          break
        case FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED:
          errorMessage =
            'Aplicativos Firebase não inicializados. Por favor, recarregue a página.'
          break
        case FirebaseErrorCode.USER_NOT_FOUND:
          errorMessage =
            'Usuário não autenticado. Por favor, faça login novamente.'
          break
        default:
          break
      }

      toast.error(`Erro ao tentar deletar`, {
        description: errorMessage,
      })

      return
    }

    toast.success('Guia excluído com sucesso!', {
      description: 'O guia foi removido permanentemente.',
    })

    router.refresh()
  }

  return (
    <Button
      variant="destructive"
      className="size-8"
      onClick={handleDeleteGuide}
      disabled={isDeletingGuide}
    >
      {isDeletingGuide ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  )
}
