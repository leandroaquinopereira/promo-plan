import type { Company, Product, Tasting, User } from '@promo/@types/firebase'
import { Collections } from '@promo/collections'
import { CompanyStatusEnum } from '@promo/enum/company-status'
import { ProductStatusEnum } from '@promo/enum/product-status'
import { TastingStatusEnum } from '@promo/enum/tasting-status'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import {
  convertFirebaseDate,
  convertFirebaseDateForForm,
} from '@promo/utils/date-helpers'
import { notFound } from 'next/navigation'

import { DetailTastingForm } from './components/form'

type RegisterTastingPageProps = {
  params: Promise<{ tastingId: string }>
}

export default async function RegisterTastingPage({
  params,
}: RegisterTastingPageProps) {
  const { tastingId } = await params

  const apps = getFirebaseApps()
  if (!apps) {
    notFound()
  }

  try {
    // Fetch tasting document
    const tastingRef = apps.firestore
      .collection(Collections.TASTINGS)
      .doc(tastingId)

    const tastingDoc = await tastingRef.get()
    if (!tastingDoc.exists) {
      notFound()
    }

    const tastingData = tastingDoc.data()
    if (!tastingData) {
      notFound()
    }

    // Extract promoter ID safely
    const promoterRefStr = tastingData.promoter
    const promoterId =
      typeof promoterRefStr === 'string'
        ? String(promoterRefStr).replace('/users/', '')
        : promoterRefStr?.id || promoterRefStr?.path?.split('/').pop() || ''

    // Extract company ID safely
    const companyRefStr = tastingData.company
    const companyId =
      typeof companyRefStr === 'string'
        ? String(companyRefStr).replace('/companies/', '')
        : companyRefStr?.id || companyRefStr?.path?.split('/').pop() || ''

    // Extract product IDs safely
    const productsRefStrs = tastingData.products || []
    const productIds = productsRefStrs
      .map((productRef: any) => {
        if (typeof productRef === 'string') {
          return String(productRef).replace('/products/', '')
        }
        return productRef?.id || productRef?.path?.split('/').pop() || ''
      })
      .filter(Boolean)

    // Fetch all documents in parallel
    const [promoterDoc, companyDoc, ...productDocs] = await Promise.all([
      apps.firestore.collection(Collections.USERS).doc(promoterId).get(),
      apps.firestore.collection(Collections.COMPANIES).doc(companyId).get(),
      ...productIds.map((id: string) =>
        apps.firestore.collection(Collections.PRODUCTS).doc(id).get(),
      ),
    ])

    // Check if required documents exist
    if (!promoterDoc.exists || !companyDoc.exists) {
      notFound()
    }

    const promoterData = promoterDoc.data()
    const companyData = companyDoc.data()

    if (!promoterData || !companyData) {
      notFound()
    }

    // Create clean promoter object (CRITICAL: role as simple string)
    const promoter: User = {
      id: promoterDoc.id,
      name: promoterData.name || '',
      phone: promoterData.phone || '',
      email: promoterData.email || '',
      password: promoterData.password || '',
      role: 'freelancer' as any,
      active: promoterData.active || false,
      state: promoterData.state || '',
      city: promoterData.city || '',
      createdAt: convertFirebaseDate(promoterData.createdAt),
      updatedAt: convertFirebaseDate(promoterData.updatedAt),
      createdBy: promoterData.createdBy || '',
      updatedBy: promoterData.updatedBy || '',
      lastLoggedAt: convertFirebaseDate(promoterData.lastLoggedAt),
      avatar: promoterData.avatar,
      situation: promoterData.situation || 'active',
      status: promoterData.status || 'offline',
    }

    // Create clean company object
    const company: Company = {
      id: companyDoc.id,
      name: companyData.name || '',
      status: companyData.status || CompanyStatusEnum.ACTIVE,
      createdAt: convertFirebaseDate(companyData.createdAt),
      updatedAt: convertFirebaseDate(companyData.updatedAt),
      createdBy: companyData.createdBy || '',
      updatedBy: companyData.updatedBy || '',
    }

    // Create clean products array
    const products: Product[] = productDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data()!
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          status: data.status || ProductStatusEnum.ACTIVE,
          createdAt: convertFirebaseDate(data.createdAt),
          updatedAt: convertFirebaseDate(data.updatedAt),
          createdBy: data.createdBy || '',
          updatedBy: data.updatedBy || '',
        }
      })

    // Create clean tasting object
    const tasting: Tasting = {
      id: parseInt(tastingDoc.id),
      promoter,
      company,
      products,
      startDate: convertFirebaseDateForForm(tastingData.startDate),
      endDate: convertFirebaseDateForForm(tastingData.endDate),
      notes: tastingData.notes || '',
      status: tastingData.status || TastingStatusEnum.DRAFT,
      createdAt: convertFirebaseDate(tastingData.createdAt),
      updatedAt: convertFirebaseDate(tastingData.updatedAt),
      createdBy: tastingData.createdBy || '',
      updatedBy: tastingData.updatedBy || '',
    }

    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Detalhes da Degustação</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para atualizar a degustação.
          </p>
        </div>

        <DetailTastingForm tasting={tasting} />
      </div>
    )
  } catch (error) {
    console.error('Error in RegisterTastingPage:', error)
    notFound()
  }
}
