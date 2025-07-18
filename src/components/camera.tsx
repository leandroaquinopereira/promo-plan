'use client'

import { cn } from '@promo/lib/utils'
import { CameraOffIcon, Loader } from 'lucide-react'
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

type CameraProps = ComponentProps<'div'> & {
  title: string
  description: string
  onTakePhoto: (photo: string) => void
}

export function Camera({
  title,
  description,
  onTakePhoto,
  className,
  children,
  ...props
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCameraSupport, setHasCameraSupport] = useState(true)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  function handleCheckCameraSupport() {
    const hasCameraSupport =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'

    setHasCameraSupport(hasCameraSupport)
    if (!hasCameraSupport) {
      setIsLoading(false)
    }

    return hasCameraSupport
  }

  const handleGetCameraVideo = useCallback(
    async function handleGetCameraVideo() {
      setIsLoading(true)
      const hasCameraSupportResult = handleCheckCameraSupport()
      if (!hasCameraSupportResult) {
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Erro ao obter acesso à câmera:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const handleStopCamera = useCallback(function handleStopCamera() {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => {
        track.stop()
      })

      videoRef.current.srcObject = null
      videoRef.current = null
    }
  }, [])

  useEffect(() => {
    function stopCameraStream() {
      const stream = videoRef.current?.srcObject as MediaStream | null
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current!.srcObject = null
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        stopCameraStream()
      }

      // Opcional: reabrir a câmera se o usuário voltar com o Dialog ainda aberto
      if (document.visibilityState === 'visible' && isCameraOpen) {
        handleGetCameraVideo()
      }
    }

    function handlePageHide() {
      stopCameraStream()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('focus', handleVisibilityChange)
    window.addEventListener('blur', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('focus', handleVisibilityChange)
      window.removeEventListener('blur', handlePageHide)
    }
  }, [isCameraOpen, handleGetCameraVideo, handleStopCamera])

  return (
    <div className={cn('relative', className)} {...props}>
      <Dialog
        open={isCameraOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsLoading(true)
            handleGetCameraVideo()
          }

          if (!open) {
            handleStopCamera()
          }

          setIsCameraOpen(open)
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="flex flex-col size-fit sm:size-fit w-screen rounded-none sm:rounded-lg h-screen max-w-none sm:max-w-lg">
          <DialogHeader className="max-h-fit">
            <DialogTitle className="text-left">{title}</DialogTitle>
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col flex-1 px-6 sm:px-0">
            <div className="flex h-full flex-col items-center justify-center flex-1 p-6 sm:p-0">
              <div
                className={cn(
                  'w-dvw sm:w-auto px-6 sm:px-0 flex grow flex-1 sm:h-auto bg-muted rounded-lg relative',
                  isLoading && 'animate-pulse',
                  !isLoading && !hasCameraSupport && 'bg-muted',
                  !isLoading && hasCameraSupport && 'bg-background',
                )}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full sm:w-full h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-20rem)] object-cover rounded-lg"
                />

                {isLoading && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Loader className="size-4 animate-spin" />
                    <p className="text-center text-sm text-muted-foreground">
                      Carregando câmera...
                    </p>
                  </div>
                )}

                {!hasCameraSupport && !isLoading && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <span className="mb-2 text-2xl text-gray-400">
                        <CameraOffIcon
                          className="size-10 text-destructive"
                          strokeWidth={1.5}
                        />
                      </span>
                      <p className="text-base font-medium text-destructive mb-1">
                        Câmera não suportada
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Seu navegador ou dispositivo não permite o uso da
                        câmera.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
