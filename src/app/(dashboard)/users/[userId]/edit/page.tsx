import { Collections } from '@promo/collections'
import { getFirebaseApps } from '@promo/lib/firebase/server'
import type { User } from '@promo/types/firebase'
import { notFound } from 'next/navigation'

import { EditUserForm } from './components/form'

interface EditUserProps {
  params: Promise<{
    userId: string
  }>
}

export default async function EditUser({ params }: EditUserProps) {
  const { userId } = await params
  const apps = getFirebaseApps()
  if (!apps) {
    notFound()
  }

  const userRef = apps.firestore.collection(Collections.USERS).doc(userId)
  const user = await userRef.get()

  if (!user.exists) {
    notFound()
  }

  const userData = {
    id: user.id,
    ...user.data(),
  } as User

  userData.role = userData.role.id as any
  userData.createdAt =
    userData.createdAt instanceof Date
      ? userData.createdAt
      : userData.createdAt.toDate()
  userData.updatedAt =
    userData.updatedAt instanceof Date
      ? userData.updatedAt
      : userData.updatedAt.toDate()
  userData.lastLoggedAt =
    userData.lastLoggedAt instanceof Date
      ? userData.lastLoggedAt
      : userData.lastLoggedAt?.toDate() || null

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Editar Usuário</h1>
        <p className="text-muted-foreground">
          Modifique os dados do usuário conforme necessário.
        </p>
      </div>

      <EditUserForm
        defaultValues={{ ...userData, permission: userData.role as any }}
      />
    </div>
  )
}
