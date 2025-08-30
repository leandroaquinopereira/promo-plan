import { MotionDiv } from '@promo/components/framer-motion/motion-div'

export async function HeaderSection() {
  return (
    <MotionDiv
      className="flex flex-col gap-4 @xl:flex-row @xl:items-center @xl:justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:gap-1">
        <h2 className="text-3xl text-foreground font-semibold">Tarefas</h2>
        <p className="text-muted-foreground">
          Gerencie todas as tarefas do sistema e monitore o progresso em tempo
          real
        </p>
      </div>
      <div className="gap-3 grid grid-cols-1 @xl:flex @xl:items-start"></div>
    </MotionDiv>
  )
}
