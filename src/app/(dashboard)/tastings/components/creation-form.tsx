'use client'

import {
  Modal,
  ModalContent,
  ModalFormContainer,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@promo/components/modal'
import { Button } from '@promo/components/ui/button'

import { RegisterTastingForm } from './form'

export function CreationForm() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button className="w-full md:w-auto">Criar Nova Degustação</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Criar Nova Degustação</ModalTitle>
        </ModalHeader>

        <ModalFormContainer>
          <RegisterTastingForm />
        </ModalFormContainer>
      </ModalContent>
    </Modal>
  )
}
