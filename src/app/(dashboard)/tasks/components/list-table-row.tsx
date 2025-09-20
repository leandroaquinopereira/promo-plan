'use client'

import { useRouter } from '@bprogress/next'
import { completeTaskAction } from '@promo/actions/complete-task'
import { Camera } from '@promo/components/camera'
import { Badge } from '@promo/components/ui/badge'
import { Button } from '@promo/components/ui/button'
import { TableCell, TableRow } from '@promo/components/ui/table'
import { useAlertDialogProgress } from '@promo/context/alert-dialog-progress'
import { TaskType } from '@promo/enum/tasks'
import {
  FirebaseStorageClient,
  UploadType,
} from '@promo/lib/firebase/storage.client'
import { cn } from '@promo/lib/utils'
import type { Task } from '@promo/types/models/task'
import {
  CameraIcon,
  CheckCircle,
  ClipboardList,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Lightbulb,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { TaskChecklistDialog } from './task-checklist'

interface TaskWithTasting extends Task {
  tastingName?: string
  companyName?: string
  tastingId?: string
}

type ListTableRowProps = {
  data: TaskWithTasting
  canStartTask?: (task: Task) => boolean
  isSubRow?: boolean
  packageId?: string
  onCompleteTask?: () => void
}

export function ListTableRow({
  data: task,
  canStartTask,
  isSubRow,
  packageId,
  onCompleteTask,
}: ListTableRowProps) {
  const alertDialogProgress = useAlertDialogProgress()
  const { execute: completeTask } = useServerAction(completeTaskAction)
  const router = useRouter()

  function getTaskTypeIcon(type: TaskType) {
    switch (type) {
      case TaskType.SETUP:
        return <Settings className="size-4" />
      case TaskType.CHECKLIST:
        return <ClipboardList className="size-4" />
      case TaskType.PHOTO_EVIDENCES:
        return <CameraIcon className="size-4" />
      case TaskType.REPORTS:
        return <FileText className="size-4" />
      case TaskType.BEST_PRACTICES:
        return <Lightbulb className="size-4" />
      default:
        return <Settings className="size-4" />
    }
  }

  function getTaskTypeName(type: TaskType) {
    switch (type) {
      case TaskType.SETUP:
        return 'Configuração'
      case TaskType.CHECKLIST:
        return 'Checklist'
      case TaskType.PHOTO_EVIDENCES:
        return 'Evidências Fotográficas'
      case TaskType.REPORTS:
        return 'Relatórios'
      case TaskType.BEST_PRACTICES:
        return 'Boas Práticas'
      default:
        return 'Desconhecido'
    }
  }

  function getTaskStatus() {
    if (task.completedAt) {
      return {
        label: 'Concluída',
        variant: 'default' as const,
        icon: <CheckCircle className="size-3" />,
      }
    }
    return {
      label: 'Pendente',
      variant: 'secondary' as const,
      icon: <Clock className="size-3" />,
    }
  }

  async function handleTakePhoto(photoUrlBase64: string) {
    if (!packageId) {
      toast.warning('Pacote de tarefas não selecionado', {
        description:
          'Você precisa selecionar um pacote para adicionar uma foto.',
      })

      return
    }

    const storage = new FirebaseStorageClient()

    alertDialogProgress.showAlertDialogProgress({
      buttonText: 'Uploading...',
      progress: 10,
      title: 'Uploading Photo',
      description: 'Please wait while we upload your photo...',
    })

    const blobResponse = await fetch(photoUrlBase64)
    const blob = await blobResponse.blob()

    const uploadFile = new File([blob], `${crypto.randomUUID()}.png`, {
      type: blob.type,
    })

    const path = `tastings/${task.tasting}/tasks/${task.id}/photos`

    await storage.upload({
      file: uploadFile,
      path,
      type: UploadType.TASTING_PHOTO,
      metadata: {
        contentType: 'image/png',
      },
      listeners: {
        onProgress: (progress) => {
          alertDialogProgress.updateProgress(progress)
        },
        onError: () => {
          alertDialogProgress.changeButtonText('Upload Failed')
          alertDialogProgress.stopError()
        },
        onComplete: async ({ downloadUrl }) => {
          if (!packageId) {
            toast.warning('Pacote de tarefas não selecionado', {
              description:
                'Você precisa selecionar um pacote para adicionar uma foto.',
            })

            return
          }

          if (task.type === TaskType.SETUP) {
            const [result, resultError] = await completeTask({
              taskId: task.id.toString(),
              taskTastingId: String(task.tasting),
              metadata: {
                photo: {
                  url: downloadUrl,
                  name: uploadFile.name,
                  size: uploadFile.size,
                  type: uploadFile.type,
                  extension: uploadFile.name.split('.').pop(),
                  path,
                },
              },
              packageId,
              payload: {
                photoUrl: downloadUrl,
              },
            })

            if (resultError) {
              toast.error('Erro ao concluir tarefa', {
                description: resultError.message,
              })
              return
            }

            if (!result?.success) {
              toast.error('Erro ao concluir tarefa', {
                description: result?.error?.message,
              })
              return
            }

            toast.success('Tarefa concluída com sucesso!')
          }

          alertDialogProgress.changeButtonText('Fechar')
          alertDialogProgress.stopSuccess()

          alertDialogProgress.hideAlertDialogProgress()

          onCompleteTask?.()
        },
      },
    })
  }

  async function handleDownloadPhoto() {
    const downloadUrl = task.payload?.photoUrl
    if (!downloadUrl) {
      toast.error('Foto não encontrada')
      return
    }

    window.open(downloadUrl, '_blank')
  }

  async function handleSubmitChecklist(
    materials: string,
    photos: any[],
    observations: string,
  ) {
    if (!packageId) {
      toast.warning('Pacote de tarefas não selecionado', {
        description:
          'Você precisa selecionar um pacote para adicionar uma foto.',
      })

      return
    }

    const [result, resultError] = await completeTask({
      taskId: task.id.toString(),
      taskTastingId: String(task.tasting),
      packageId,
      metadata: {},
      payload: {
        materials,
        photos,
        observations,
      },
    })

    if (resultError) {
      toast.error('Erro ao concluir tarefa', {
        description: resultError.message,
      })
      return
    }

    if (!result?.success) {
      toast.error('Erro ao concluir tarefa', {
        description: result?.error?.message,
      })
      return
    }

    toast.success('Tarefa concluída com sucesso!')

    onCompleteTask?.()
  }

  const status = getTaskStatus()

  return (
    <TableRow
      className={cn(
        task.completedAt && 'opacity-75',
        isSubRow && 'bg-muted/30 border-l-4 border-l-primary/20',
      )}
    >
      <TableCell className={cn(isSubRow && 'pl-12')}>
        <div className="font-mono text-sm font-medium">
          #{task.id.toString().padStart(3, '0')}
        </div>
      </TableCell>

      <TableCell>
        <div className="font-medium">{task.title}</div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {getTaskTypeIcon(task.type)}
          <span className="text-sm">{getTaskTypeName(task.type)}</span>
        </div>
      </TableCell>

      <TableCell>
        <Badge
          variant={status.variant}
          className="flex items-center gap-1 w-fit"
        >
          {status.icon}
          {status.label}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-1">
          <Link
            href={`/tastings/${task.tastingId}/detail`}
            className="text-sm font-medium underline hover:underline text-blue-300 dark:text-blue-500 hover:text-blue-400 dark:hover:text-blue-600"
          >
            {task.tastingName}
          </Link>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm text-muted-foreground">
          {task.companyName || '-'}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {task.type === TaskType.SETUP && !task.completedAt && (
            <Camera
              onTakePhoto={handleTakePhoto}
              title="Tirar Foto"
              description="Quando você tirar a foto, o sistema irá salvar a foto e você poderá ver a foto na tarefa."
            >
              <Button
                size="icon"
                variant="secondary"
                disabled={!canStartTask?.(task)}
              >
                <CameraIcon className="size-4" />
              </Button>
            </Camera>
          )}

          {task.type !== TaskType.SETUP && !task.completedAt && (
            <TaskChecklistDialog
              canStartTask={() => {
                return canStartTask?.(task) ?? true
              }}
              onSubmit={handleSubmitChecklist}
              task={task}
              trigger={
                <Button
                  disabled={!canStartTask?.(task)}
                  size="icon"
                  variant="outline"
                >
                  <CheckCircle className="size-4" />
                </Button>
              }
            />
          )}

          {task.completedAt && task.type === TaskType.SETUP && (
            <Button size="icon" variant="outline" onClick={handleDownloadPhoto}>
              <ExternalLink className="size-4" />
            </Button>
          )}

          {task.type !== TaskType.SETUP && task.completedAt && (
            <TaskChecklistDialog
              canStartTask={() => canStartTask?.(task) ?? true}
              onSubmit={handleSubmitChecklist}
              task={task}
              trigger={
                <Button
                  disabled={!canStartTask?.(task)}
                  size="icon"
                  variant="outline"
                >
                  <Eye className="size-4" />
                </Button>
              }
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
