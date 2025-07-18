import type { Guide } from '@promo/types/firebase'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Badge } from '@promo/components/ui/badge'
import { buttonVariants } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@promo/components/ui/tooltip'
import { guideCategoryColors } from '@promo/constants/guide-category-color'
import { guideCategoryMap } from '@promo/constants/guide-category-map'
import { cn } from '@promo/lib/utils'
import { Calendar, Eye } from 'lucide-react'
import Link from 'next/link'

import { DeleteGuideButton } from './delete-guide-button'

type GuideCardProps = {
  guide: Guide
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <MotionDiv
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: 'easeOut',
          },
        },
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Tooltip>
              <TooltipTrigger>
                <CardTitle className="text-lg font-semibold leading-tight truncate max-w-40">
                  {guide.title}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent className="max-w-40 wrap-break-word">
                {guide.title}
              </TooltipContent>
            </Tooltip>
            <Badge
              variant="outline"
              className={cn(
                `shrink-0 text-xs`,
                guideCategoryColors[guide.category],
              )}
            >
              {guideCategoryMap[guide.category] || 'Outros'}
            </Badge>
          </div>

          <Tooltip>
            <TooltipTrigger>
              <CardDescription className="text-left text-sm text-muted-foreground line-clamp-3">
                {guide.description}
              </CardDescription>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              {guide.description}
            </TooltipContent>
          </Tooltip>
        </CardHeader>

        <CardContent className="flex-1 pb-3"></CardContent>

        <CardFooter className="pt-3 flex items-baseline justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            <p className="truncate capitalize">{guide.lastUpdated}</p>
          </div>
          <div className="flex items-center gap-2">
            <DeleteGuideButton guideId={guide.id} />
            <Link
              href={`/guides/${guide.id}/editor`}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'ml-auto',
              )}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Link>
          </div>
        </CardFooter>
      </Card>
    </MotionDiv>
  )
}
