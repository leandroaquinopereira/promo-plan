'use client'

import { useRouter } from '@bprogress/next'
import type { Tasting } from '@promo/@types/firebase'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Badge } from '@promo/components/ui/badge'
import { Button } from '@promo/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { Separator } from '@promo/components/ui/separator'
import { tastingStatusColors } from '@promo/constants/tasting-status-colors'
import { tastingStatusMap } from '@promo/constants/tasting-status-map'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import { convertFirebaseDate } from '@promo/utils/date-helpers'
import { formatPhoneNumber } from '@promo/utils/format-phone-number'
import { getUserInitials } from '@promo/utils/get-user-initials'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Package,
  User,
  Users,
} from 'lucide-react'

import { TastingTasksHeader } from './header'
import { TaskCard } from './task-card'
import { TaskProgress } from './task-progress'

interface TastingTasksContentProps {
  tasting: Tasting
}

// Mock data for tasks - This will be replaced with real data later
const MOCK_TASKS = [
  {
    id: 1,
    title: 'Preparação do Local',
    description: 'Organizar e preparar o espaço para a degustação',
    status: 'completed' as const,
    category: 'preparation',
    estimatedTime: '30 min',
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    completedBy: 'João Silva',
  },
  {
    id: 2,
    title: 'Verificação dos Produtos',
    description:
      'Conferir se todos os produtos estão disponíveis e em boas condições',
    status: 'in_progress' as const,
    category: 'verification',
    estimatedTime: '45 min',
    startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    assignedTo: 'Maria Santos',
  },
  {
    id: 3,
    title: 'Configuração dos Equipamentos',
    description: 'Instalar e testar todos os equipamentos necessários',
    status: 'pending' as const,
    category: 'setup',
    estimatedTime: '20 min',
    dependencies: [2], // Depends on task 2
  },
  {
    id: 4,
    title: 'Recepção dos Participantes',
    description: 'Receber e orientar os participantes da degustação',
    status: 'pending' as const,
    category: 'reception',
    estimatedTime: '15 min',
    dependencies: [1, 3], // Depends on tasks 1 and 3
  },
  {
    id: 5,
    title: 'Condução da Degustação',
    description: 'Conduzir a degustação seguindo o protocolo estabelecido',
    status: 'pending' as const,
    category: 'execution',
    estimatedTime: '60 min',
    dependencies: [4], // Depends on task 4
  },
  {
    id: 6,
    title: 'Coleta de Feedback',
    description: 'Coletar feedback dos participantes sobre os produtos',
    status: 'pending' as const,
    category: 'feedback',
    estimatedTime: '30 min',
    dependencies: [5], // Depends on task 5
  },
  {
    id: 7,
    title: 'Finalização e Limpeza',
    description: 'Finalizar a degustação e limpar o local',
    status: 'pending' as const,
    category: 'cleanup',
    estimatedTime: '25 min',
    dependencies: [6], // Depends on task 6
  },
]

export function TastingTasksContent({ tasting }: TastingTasksContentProps) {
  const router = useRouter()

  const isInspectionDay = () => {
    const today = dayjsApi()
    const startDate = dayjsApi(convertFirebaseDate(tasting.startDate))
    const endDate = dayjsApi(convertFirebaseDate(tasting.endDate))

    return (
      (today.isAfter(startDate, 'day') || today.isSame(startDate, 'day')) &&
      (today.isBefore(endDate, 'day') || today.isSame(endDate, 'day'))
    )
  }

  const canStartTasks = isInspectionDay()
  const completedTasks = MOCK_TASKS.filter(
    (task) => task.status === 'completed',
  )
  const inProgressTasks = MOCK_TASKS.filter(
    (task) => task.status === 'in_progress',
  )
  const pendingTasks = MOCK_TASKS.filter((task) => task.status === 'pending')

  const progressPercentage = Math.round(
    (completedTasks.length / MOCK_TASKS.length) * 100,
  )

  return (
    <div className="container mx-auto max-w-6xl py-6 space-y-6">
      <TastingTasksHeader tasting={tasting} />

      {/* Tasting Info Card */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Informações da Degustação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  Promotora
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {getUserInitials(tasting.promoter.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{tasting.promoter.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPhoneNumber(tasting.promoter.phone)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="size-4" />
                  Empresa
                </div>
                <p className="font-medium">{tasting.company.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  Localização
                </div>
                <p className="font-medium">
                  {tasting.promoter.city}, {tasting.promoter.state}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  Período
                </div>
                <p className="font-medium">
                  {dayjsApi(convertFirebaseDate(tasting.startDate)).format(
                    'DD/MM/YYYY',
                  )}{' '}
                  -{' '}
                  {dayjsApi(convertFirebaseDate(tasting.endDate)).format(
                    'DD/MM/YYYY',
                  )}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="size-4" />
                Produtos ({tasting.products.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {tasting.products.map((product) => (
                  <Badge
                    key={product.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {product.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>

      {/* Progress Overview */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TaskProgress
          totalTasks={MOCK_TASKS.length}
          completedTasks={completedTasks.length}
          inProgressTasks={inProgressTasks.length}
          pendingTasks={pendingTasks.length}
          progressPercentage={progressPercentage}
        />
      </MotionDiv>

      {/* Inspection Day Alert */}
      {!canStartTasks && (
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Clock className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900 dark:text-amber-100">
                    Não é o dia da inspeção
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    As tarefas só podem ser iniciadas durante o período da
                    degustação:{' '}
                    {dayjsApi(convertFirebaseDate(tasting.startDate)).format(
                      'DD/MM/YYYY',
                    )}{' '}
                    -{' '}
                    {dayjsApi(convertFirebaseDate(tasting.endDate)).format(
                      'DD/MM/YYYY',
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      )}

      {/* Tasks Grid */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5" />
              Lista de Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_TASKS.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canStart={canStartTasks}
                  allTasks={MOCK_TASKS}
                  index={index}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
}
