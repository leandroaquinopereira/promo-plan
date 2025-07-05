import { RegisterCompanyForm } from './components/form'

export default async function RegisterCompanyPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Cadastrar Empresa</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para criar uma nova empresa no sistema.
        </p>
      </div>

      <RegisterCompanyForm />
    </div>
  )
}
