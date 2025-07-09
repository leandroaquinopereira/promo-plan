import { redirect } from 'next/navigation'

export default async function RedirectProductPage() {
  redirect(`/products`)
}
