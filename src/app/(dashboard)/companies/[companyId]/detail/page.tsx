import type { Company } from '@promo/@types/firebase'
import { Collections } from '@promo/collections'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { notFound } from 'next/navigation'

import { DetailCompanyForm } from './components/form'

type DetailCompanyPageProps = {
  params: Promise<{
    companyId: string
  }>
}

export default async function DetailCompanyPage({
  params,
}: DetailCompanyPageProps) {
  const { companyId } = await params

  const apps = getFirebaseApps()
  if (!apps) {
    notFound()
  }

  const company = await apps.firestore
    .collection(Collections.COMPANIES)
    .doc(companyId)
    .get()
  if (!company.exists) {
    notFound()
  }

  const companyData = {
    id: company.id,
    ...company.data(),
    createdAt: company.data()?.createdAt?.toDate(),
    updatedAt: company.data()?.updatedAt?.toDate(),
  } as Company

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Detalhes da Empresa</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para visualizar os detalhes da empresa.
        </p>
      </div>

      <DetailCompanyForm company={companyData} />
    </div>
  )
}
