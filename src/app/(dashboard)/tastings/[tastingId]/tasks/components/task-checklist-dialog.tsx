'use client'

import { Camera } from '@promo/components/camera'
import { Button } from '@promo/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@promo/components/ui/dialog'
import { Label } from '@promo/components/ui/label'
import { Textarea } from '@promo/components/ui/textarea'
import { useAlertDialogProgress } from '@promo/context/alert-dialog-progress'
import {
  FirebaseStorageClient,
  UploadType,
} from '@promo/lib/firebase/storage.client'
import type { Task } from '@promo/types/models/task'
import {
  CameraIcon,
  CheckCircle,
  ExternalLink,
  ImageOffIcon,
  Trash2Icon,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export type TaskChecklistDialogProps = {
  onSubmit?: (materials: string, photos: any[]) => Promise<void>
  canStartTask?: () => boolean
  task: Task
  trigger?: React.ReactNode
}

export function TaskChecklistDialog({
  onSubmit,
  canStartTask,
  task,
  trigger,
}: TaskChecklistDialogProps) {
  const [materials, setMaterials] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const alertDialogProgress = useAlertDialogProgress()

  async function handleUploadPhotos() {
    const storage = new FirebaseStorageClient()

    alertDialogProgress.showAlertDialogProgress({
      buttonText: 'Uploading...',
      progress: 10,
      title: 'Uploading Photo',
      description: 'Please wait while we upload your photo...',
    })

    const uploadedPhotos: {
      url: string
      name: string
      size: number
      type: string
      extension: string
      path: string
    }[] = []
    for await (const photo of photos) {
      const blobResponse = await fetch(photo)
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
            alertDialogProgress.stopError()
          },
          onComplete: async ({ downloadUrl }) => {
            uploadedPhotos.push({
              url: downloadUrl,
              name: uploadFile.name,
              size: uploadFile.size,
              type: uploadFile.type,
              extension: uploadFile.name.split('.').pop() || '',
              path,
            })
          },
        },
      })
    }

    alertDialogProgress.stopSuccess()
    alertDialogProgress.hideAlertDialogProgress()

    return uploadedPhotos
  }

  async function handleSubmit() {
    const uploadedPhotos = await handleUploadPhotos()
    await onSubmit?.(materials, uploadedPhotos)
  }

  useEffect(() => {
    if (task.payload?.photos) {
      setPhotos(task.payload.photos.map((photo: any) => photo.url))
    }

    if (task.payload?.materials) {
      setMaterials(task.payload.materials)
    }
  }, [task.payload])

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpened) => {
        if (!isOpened) {
          setMaterials('')
          setPhotos([])
        }

        setIsDialogOpen(isOpened)
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" disabled={!canStartTask?.()}>
            <CheckCircle className="size-4 mr-1" />
            Preencher checklist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Concluir</DialogTitle>
          <DialogDescription>
            Preencher checklist para concluir a tarefa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Materiais e produtos</Label>
            <Textarea
              placeholder="Digite os materiais e produtos"
              className="min-h-40"
              rows={4}
              value={materials}
              disabled={task.payload?.materials !== undefined}
              onChange={(e) => setMaterials(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Fotos</Label>

            <div className="grid gap-2 w-full">
              {photos.map((photo) => (
                <div
                  key={photo}
                  className="relative flex items-center justify-between gap-2 bg-accent rounded-md p-2"
                >
                  <div className="relative size-10 rounded overflow-hidden">
                    <Image
                      src={photo}
                      alt="Foto"
                      className="w-full h-full object-cover"
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.open(photo, '_blank')
                      }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span>Abrir foto</span>
                      <ExternalLink className="size-4" />
                    </Button>
                    {task.payload?.photos === undefined && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPhotos((prev) => prev.filter((p) => p !== photo))
                        }}
                        className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300"
                      >
                        <span>Remover foto</span>
                        <Trash2Icon className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {photos.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground py-8">
                  <ImageOffIcon />
                  <span>Nenhuma foto adicionada</span>
                </div>
              )}
            </div>

            <Camera
              title="Tirar Foto"
              description="Quando você tirar a foto, o sistema irá salvar a foto e você poderá ver a foto na tarefa."
              onTakePhoto={(photoUrlBase64) => {
                setPhotos((prev) => [...prev, photoUrlBase64])
              }}
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={task.payload?.photos !== undefined}
              >
                <CameraIcon className="size-4 mr-1" />
                Adicionar foto
              </Button>
            </Camera>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline">
              {!task.payload ? 'Cancelar' : 'Fechar'}
            </Button>
          </DialogClose>

          {!task.payload && (
            <Button size="sm" variant="default" onClick={handleSubmit}>
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
