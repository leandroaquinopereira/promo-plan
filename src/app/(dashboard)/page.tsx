import { MotionDiv } from '@promo/components/framer-motion/motion-div'

import { GuideSection } from './components/guide-section'
import { HomeSection } from './components/home-section'
import { InfoSection } from './components/info-section'
import { QuickActionsSection } from './components/quick-actions-section'

export default async function Home() {
  return (
    <div className="flex flex-col gap-4">
      <HomeSection />
      <InfoSection />

      <MotionDiv
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <GuideSection />
        <QuickActionsSection />
      </MotionDiv>
    </div>
  )
}
