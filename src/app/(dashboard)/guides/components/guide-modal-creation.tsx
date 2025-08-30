'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { createNewGuide } from '@promo/actions/create-new-guide'
import { Button } from '@promo/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@promo/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@promo/components/ui/form'
import { Input } from '@promo/components/ui/input'
import { Textarea } from '@promo/components/ui/textarea'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { BookPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
})

type Schema = z.infer<typeof schema>

export function GuideModalCreation() {
  const { execute } = useServerAction(createNewGuide)
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  async function handleCreateGuide({ description, title }: Schema) {
    try {
      const [result, resultError] = await execute({
        description,
        title,
      })

      if (resultError) {
        toast.error('Erro ao criar guia: ' + resultError.message)
        return
      }

      if (result?.error) {
        switch (result.error.code) {
          case FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED:
            toast.error(
              'Erro ao inicializar o Firebase. Tente novamente mais tarde.',
            )
            break
          default:
            toast.error('Erro ao criar guia: \n' + result.error.message)
            break
        }
        return
      }

      toast.success('Guia criado com sucesso!', {
        description: 'Você será redirecionado para o editor do guia.',
      })

      router.push(`/guides/${result.guideId}/editor`)
    } catch (error) {
      toast.error(
        'Ocorreu um erro ao criar o guia. Por favor, tente novamente.',
        {
          description:
            error instanceof Error ? error.message : 'Erro desconhecido',
        },
      )
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <BookPlus className="size-4" />
          Criar Guia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Guia</DialogTitle>
          <DialogDescription>
            Insira um título, descrição e selecione a categoria do novo guia.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleCreateGuide)}
            id="guide-creation-form"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Insira o título do guide"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Insira o título do guide"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="mt-1">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full md:w-auto"
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="guide-creation-form"
            className="w-full md:w-auto"
            isLoading={form.formState.isSubmitting}
          >
            Criar Guia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
