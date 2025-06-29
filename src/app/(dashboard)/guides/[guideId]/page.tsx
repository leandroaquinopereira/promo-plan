import { redirect } from 'next/navigation'

type GuideByIdProps = {
  params: Promise<{
    guideId: string
  }>
}

export default async function GuideById({ params }: GuideByIdProps) {
  const { guideId } = await params

  redirect(`/guides/${guideId}/editor`)
}
