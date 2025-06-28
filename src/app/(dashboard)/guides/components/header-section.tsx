import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Search } from 'lucide-react'

import { GuideInputFilter } from './guide-input-filter'
import { GuideModalCreation } from './guide-modal-creation'

export async function HeaderSection() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <h1 className="text-4xl font-bold text-foreground mb-2">Guias</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Explore nossos guias completos para aprimorar seu conhecimento e
        habilidades. De dicas para iniciantes a técnicas avançadas, encontre
        tudo o que você precisa para ter sucesso em seus objetivos.
      </p>

      <div className="flex items-center justify-between gap-3 flex-col md:flex-row">
        <div className="w-full md:max-w-md flex items-center border border-border rounded px-2 gap-2 focus-within:ring-2 ring-border">
          <Search className="text-muted-foreground size-4" />
          <GuideInputFilter />
        </div>

        <GuideModalCreation />
      </div>
    </MotionDiv>
  )
}
