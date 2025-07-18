import type { Product } from '@promo/types/firebase'
import { Collections } from '@promo/collections'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import { notFound } from 'next/navigation'

import { EditProductForm } from './components/form'

type EditProductPageProps = {
  params: Promise<{
    productId: string
  }>
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { productId } = await params

  const apps = getFirebaseApps()
  if (!apps) {
    notFound()
  }

  const product = await apps.firestore
    .collection(Collections.PRODUCTS)
    .doc(productId)
    .get()
  if (!product.exists) {
    notFound()
  }

  const productData = {
    id: product.id,
    ...product.data(),
    createdAt: product.data()?.createdAt?.toDate(),
    updatedAt: product.data()?.updatedAt?.toDate(),
  } as Product

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Editar Produto</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para editar o produto.
        </p>
      </div>

      <EditProductForm product={productData} />
    </div>
  )
}
