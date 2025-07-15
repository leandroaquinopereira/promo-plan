import { redirect } from 'next/navigation'

export default async function RedirectCompanyPage() {
  redirect(`/companies`)
}
