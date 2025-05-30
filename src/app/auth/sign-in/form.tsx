'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PasswordField } from '@promo/components/password-field'
import { PhoneNumberField } from '@promo/components/phone-number-field'
import { Button } from '@promo/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@promo/components/ui/form'
import { cn } from '@promo/lib/utils'
import { permanentRedirect } from 'next/navigation'
import { signIn } from 'next-auth/react'
import type { ComponentPropsWithoutRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type LoginFormProps = ComponentPropsWithoutRef<'form'>

const schema = z.object({
  phone_number: z
    .string({
      required_error: 'Telefone é obrigatório',
      description: 'Número de telefone',
    })
    .min(1, { message: 'Telefone é obrigatório' }),
  password: z
    .string({
      required_error: 'Senha é obrigatória',
      description: 'Senha',
    })
    .min(1, { message: 'Senha é obrigatória' }),
})

type Schema = z.infer<typeof schema>

export function LoginForm({ className, ...props }: LoginFormProps) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  async function handleLogin({ password, phone_number }: Schema) {
    const result = await signIn('credentials', {
      phoneNumber: phone_number.replace(/\D/g, ''),
      password,
      redirect: false,
    })

    if (result?.error) {
      toast.error(result.code || 'Credenciais inválidas')
      form.setError('password', {
        message: result.code || 'Credenciais inválidas',
      })

      form.setError('phone_number', {
        message: result.code || 'Credenciais inválidas',
      })

      return
    }

    toast.success('Login realizado com sucesso')
    permanentRedirect('/')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleLogin)}
        className={cn('', className)}
        {...props}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="phone_number">Telefone</FormLabel>
                  <FormControl>
                    <PhoneNumberField
                      {...field}
                      disabled={form.formState.isSubmitting}
                      placeholder="(123) 456-7890"
                      autoComplete="off"
                      autoCapitalize="none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Senha</FormLabel>
                  <FormControl>
                    <PasswordField
                      {...field}
                      disabled={form.formState.isSubmitting}
                      placeholder="••••••••"
                      autoComplete="off"
                      autoCapitalize="none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              isLoading={form.formState.isSubmitting}
              type="submit"
              className="w-full"
            >
              Login
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
