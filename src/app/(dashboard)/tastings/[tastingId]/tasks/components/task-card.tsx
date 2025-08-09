'use client'

import { useRouter } from '@bprogress/next'
import { completeTaskAction } from '@promo/actions/complete-task'
import { Camera } from '@promo/components/camera'
import { MotionDiv } from '@promo/components/framer-motion/motion-div'
import { Badge } from '@promo/components/ui/badge'
import { Button } from '@promo/components/ui/button'
import { Card, CardContent } from '@promo/components/ui/card'
import { useAlertDialogProgress } from '@promo/context/alert-dialog-progress'
import { TaskType } from '@promo/enum/tasks'
import {
  FirebaseStorageClient,
  UploadType,
} from '@promo/lib/firebase/storage.client'
import { cn } from '@promo/lib/utils'
import type { Task } from '@promo/types/models/task'
import { CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { TaskChecklistDialog } from './task-checklist-dialog'

interface TaskCardProps {
  task: Task
  index: number
  canStartTask?: (task: Task) => boolean
}

// const categoryColors: Record<TaskType, string> = {
//   [TaskType.SETUP]:
//     'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
//   [TaskType.CHECKLIST]:
//     'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
//   [TaskType.PHOTO_EVIDENCES]:
//     'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
//   [TaskType.REPORTS]:
//     'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
//   [TaskType.BEST_PRACTICES]:
//     'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
// }

// const categoryLabels: Record<TaskType, string> = {
//   [TaskType.SETUP]: 'Configuração',
//   [TaskType.CHECKLIST]: 'Checklist',
//   [TaskType.PHOTO_EVIDENCES]: 'Fotos',
//   [TaskType.REPORTS]: 'Relatórios',
//   [TaskType.BEST_PRACTICES]: 'Melhores Práticas',
// }

export function TaskCard({ task, index, canStartTask }: TaskCardProps) {
  const alertDialogProgress = useAlertDialogProgress()
  const { execute: completeTask } = useServerAction(completeTaskAction)
  const router = useRouter()

  async function handleTakePhoto(photoUrlBase64: string) {
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
          router.refresh()
        },
      },
    })
  }

  async function handleDownloadPhoto() {
    // try {
    //   const _downloadUrl = task.payload?.photoUrl
    //   if (!_downloadUrl) {
    //     toast.error('Foto não encontrada')
    //     return
    //   }
    //   const url = new URL(_downloadUrl)
    //   const pathMatch = url.pathname.match(/\/o\/(.+)/)
    //   if (!pathMatch) {
    //     toast.error('URL da foto inválida')
    //     return
    //   }
    //   const encodedPath = pathMatch[1]
    //   const decodedPath = decodeURIComponent(encodedPath)
    //   // Create a reference to the file in Firebase Storage
    //   const fileRef = ref(storage, decodedPath)
    //   // Download the file as a blob using Firebase SDK
    //   const blob = await getBlob(fileRef)
    //   const downloadUrl = URL.createObjectURL(blob)
    //   const a = document.createElement('a')
    //   a.href = downloadUrl
    //   a.download = task.payload?.photo?.name
    //   a.click()
    //   URL.revokeObjectURL(downloadUrl)
    // } catch (error) {
    //   if (error instanceof FirebaseError) {
    //     if (error.code === 'storage/object-not-found') {
    //       toast.error('Foto não encontrada')
    //       return
    //     }
    //   }
    //   toast.error('Erro ao baixar foto')
    // }

    const downloadUrl = task.payload?.photoUrl
    if (!downloadUrl) {
      toast.error('Foto não encontrada')
      return
    }

    window.open(downloadUrl, '_blank')
  }

  async function handleSubmitChecklist(materials: string, photos: any[]) {
    const [result, resultError] = await completeTask({
      taskId: task.id.toString(),
      taskTastingId: String(task.tasting),
      metadata: {},
      payload: {
        materials,
        photos,
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
    router.refresh()
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className={cn(
          'transition-all duration-200 p-0',
          // getStatusColor(task.status),
          // isBlocked && 'opacity-60',
          // task.status === 'in_progress' &&
          //   'ring-2 ring-blue-200 dark:ring-blue-800',
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            {/* <div className="flex-shrink-0 mt-1">
              {isBlocked ? (
                <Lock className="size-5 text-gray-400" />
              ) : (
                getStatusIcon(task.status)
              )}
            </div> */}

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-base mb-1">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.completedAt && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
                      )}
                    >
                      Concluída
                    </Badge>
                  )}
                  {/* <Badge variant="outline" className="text-xs">
                    {getStatusLabel(task.status)}
                  </Badge> */}
                </div>
              </div>

              {/* Task Details */}
              {/* <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{getEstimatedTime()}</span>
                </div>
                {task.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="size-3" />
                    <span>{task.assignedTo}</span>
                  </div>
                )}
                {task.completedBy && (
                  <div className="flex items-center gap-1">
                    <Users className="size-3" />
                    <span>Por: {task.completedBy}</span>
                  </div>
                )}
              </div> */}

              {/* Dependencies */}
              {/* {task.dependencies && task.dependencies.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Depende de:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getDependencyTasks().map((depTitle, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {depTitle}
                      </Badge>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Timestamps */}
              {/* {(task.startedAt || task.completedAt) && (
                <>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.startedAt && (
                      <span>
                        Iniciado:{' '}
                        {dayjsApi(task.startedAt as Date).format(
                          'DD/MM/YYYY HH:mm',
                        )}
                      </span>
                    )}
                    {task.completedAt && (
                      <span>
                        Concluído:{' '}
                        {dayjsApi(task.completedAt as Date).format(
                          'DD/MM/YYYY HH:mm',
                        )}
                      </span>
                    )}
                  </div>
                </>
              )} */}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                {task.type === TaskType.SETUP && !task.completedAt && (
                  <Camera
                    onTakePhoto={handleTakePhoto}
                    title="Tirar Foto"
                    description="Quando você tirar a foto, o sistema irá salvar a foto e você poderá ver a foto na tarefa."
                  >
                    <Button
                      size="sm"
                      variant="default"
                      disabled={!canStartTask?.(task)}
                    >
                      Tirar Foto
                    </Button>
                  </Camera>
                )}
                {task.type !== TaskType.SETUP && !task.completedAt && (
                  <TaskChecklistDialog
                    canStartTask={() => canStartTask?.(task) ?? true}
                    onSubmit={handleSubmitChecklist}
                    task={task}
                  />
                )}

                {task.completedAt && task.type === TaskType.SETUP && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadPhoto}
                  >
                    <ExternalLink className="size-4 mr-1" />
                    Visualizar foto
                  </Button>
                )}

                {task.type !== TaskType.SETUP && task.completedAt && (
                  <TaskChecklistDialog
                    canStartTask={() => canStartTask?.(task) ?? true}
                    onSubmit={handleSubmitChecklist}
                    task={task}
                    trigger={
                      <Button size="sm" variant="outline">
                        <CheckCircle className="size-4 mr-1" />
                        Visualizar checklist
                      </Button>
                    }
                  />
                )}

                {/* {task.status === 'in_progress' && (
                  <>
                    <Button size="sm" variant="default">
                      <CheckCircle className="size-4 mr-1" />
                      Concluir
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pause className="size-4 mr-1" />
                      Pausar
                    </Button>
                  </>
                )}
                {isBlocked && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="size-3 mr-1" />
                    Bloqueada
                  </Badge>
                )} */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}
