import { RedirectButton } from '@promo/components/redirect-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@promo/components/ui/card'
import { cn } from '@promo/lib/utils'
import type { Task } from '@promo/types/firebase'
import { ArrowRight, CheckCircle, Inbox } from 'lucide-react'

import { TaskCard } from './task-card'
import { TaskNoDayAlertOverlay } from './task-no-day-alert-overlay'

type TaskListProps = {
  tasks: Task[]
  isEnableToStartTasks?: boolean
}

export async function TaskList({
  tasks,
  isEnableToStartTasks = false,
}: TaskListProps) {
  return (
    <Card className={cn(!isEnableToStartTasks && 'h-[52rem] overflow-hidden')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="size-5" />
          Lista de Tarefas
        </CardTitle>
        <CardDescription>
          Abaixo estão as tarefas que você precisa realizar para concluir a
          degustação do dia{' '}
          {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              canStart={isEnableToStartTasks}
              allTasks={tasks}
              index={index}
            />
          ))}
        </div>

        {!isEnableToStartTasks && <TaskNoDayAlertOverlay />}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-10">
            <Inbox className="size-10 text-muted-foreground" />

            <div className="flex items-center justify-center gap-2 max-w-md">
              <p className="text-sm text-muted-foreground text-center">
                Caso a degustação já tenha sido iniciada, aguarde alguns minutos
                para que as tarefas sejam carregadas ou entre em contato com o{' '}
                <a
                  href="mailto:promo.plan000@gmail.com?subject=Suporte%20nas%20tasks%20de%20degusta%C3%A7%C3%A3o&body=Oi,%20tudo%20bem%3F%20%0D%0A%0D%0AEstou%20entrando%20em%20contato%20pois%20..."
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:underline hover:text-primary"
                >
                  promo.plan000@gmail.com
                </a>
              </p>
            </div>
            <RedirectButton to="/tastings">
              <span>Voltar para listagem</span>
              <ArrowRight className="size-4" />
            </RedirectButton>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
