import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Button } from '@promo/components/ui/button'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'

export async function HeaderSection() {
  return (
    <MotionDiv
      className="flex flex-col gap-4 @xl:flex-row @xl:items-center @xl:justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:gap-1">
        <h2 className="text-3xl text-foreground font-semibold">Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie todos os usuários do sistema e monitore atividades tempo real
        </p>
      </div>
      <div className="gap-3 grid grid-cols-1 @xl:flex @xl:items-start">
        <Link href="/users/register">
          <Button className="w-full @lg:w-auto" variant="default">
            <UserPlus className="size-4" />
            Novo Usuário
          </Button>
        </Link>
      </div>
    </MotionDiv>
  )
}
