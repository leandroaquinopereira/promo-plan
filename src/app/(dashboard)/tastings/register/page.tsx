import { RegisterTastingForm } from '../components/form'

export default async function RegisterTastingPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Registrar Degustação</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para criar uma nova degustação no sistema.
        </p>
      </div>

      <RegisterTastingForm />
    </div>
  )
}
