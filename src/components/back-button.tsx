'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from './ui/button'

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      className="w-full justify-center"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4 flex-shrink-0" />
      Voltar à Página Anterior
    </Button>
  )
}
