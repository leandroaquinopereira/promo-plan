'use client'

import { useAlertDialog } from '@promo/context/alert-dialog'
import { dayjsApi } from '@promo/lib/dayjs'
import { cn } from '@promo/lib/utils'
import { CameraIcon, CameraOffIcon, Loader, XIcon } from 'lucide-react'
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'

import { GoogleMap, type GoogleMapMethods, GoogleMapMode } from './map'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Skeleton } from './ui/skeleton'

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
  const cameraContainerRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<GoogleMapMethods | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [hasCameraSupport, setHasCameraSupport] = useState(true)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isOutsideOfApplication, setIsOutsideOfApplication] = useState(false)
  const [isGettingUserLocation, startGettingUserLocationTransition] =
    useTransition()

  const [isTakingPhoto, startTakingPhotoTransition] = useTransition()
  const [userLocation, setUserLocation] = useState<{
    numberRoad: string
    suburb: string
    city: string
    state: string
    coordinates: {
      latitude: number
      longitude: number
    }
  } | null>(null)

  const { showAlertDialog } = useAlertDialog()

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

  const handleStopCamera = useCallback(function handleStopCamera() {
    if (videoRef.current) {
      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach((track) => {
        track.stop()
      })

      if (videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current = null
      }
    }
  }, [])

  const handleAlertDialogAction = useCallback(
    function handleAlertDialogAction() {
      setIsLoading(false)
      setIsCameraOpen(false)
      setIsOutsideOfApplication(false)
      handleStopCamera()
    },
    [handleStopCamera],
  )

  const handleGetCameraVideo = useCallback(
    async function handleGetCameraVideo() {
      setIsOutsideOfApplication(false)
      setIsLoading(true)
      const hasCameraSupportResult = handleCheckCameraSupport()
      if (!hasCameraSupportResult) {
        showAlertDialog({
          title: 'Câmera não suportada',
          description:
            'Seu navegador ou dispositivo não permite o uso da câmera.',
          onCancel: () => {
            handleAlertDialogAction()
          },
          onConfirm: () => {
            handleAlertDialogAction()
          },
        })

        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        showAlertDialog({
          title: 'Erro ao obter acesso à câmera',
          description: 'Por favor, tente novamente.',
          onCancel: () => {
            handleAlertDialogAction()
          },
          onConfirm: () => {
            handleAlertDialogAction()
          },
        })
      } finally {
        setIsLoading(false)
      }
    },
    [handleAlertDialogAction, showAlertDialog],
  )

  function handleGetUserLocation() {
    startGettingUserLocationTransition(async () => {
      const geolocation = navigator.geolocation
      if (!geolocation) {
        showAlertDialog({
          title: 'Geolocalização não suportada',
          description:
            'Seu navegador ou dispositivo não permite o uso da geolocalização.',
          onCancel: () => {
            handleAlertDialogAction()
          },
          onConfirm: () => {
            handleAlertDialogAction()
          },
        })

        return
      }

      try {
        const userLocation = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            })
          },
        )

        const { latitude, longitude } = userLocation.coords

        const nominatimApiUrl = new URL(
          'https://nominatim.openstreetmap.org/reverse',
        )
        nominatimApiUrl.searchParams.set('lat', latitude.toString())
        nominatimApiUrl.searchParams.set('lon', longitude.toString())
        nominatimApiUrl.searchParams.set('format', 'json')
        nominatimApiUrl.searchParams.set('zoom', '18')
        nominatimApiUrl.searchParams.set('addressdetails', '1')

        const nominatimApiResponse = await fetch(nominatimApiUrl.toString())
        if (!nominatimApiResponse.ok) {
          showAlertDialog({
            title: 'Erro ao obter a geolocalização',
            description:
              'Não foi possível obter o endereço do usuário. Por favor, tente novamente. Caso o problema persista, entre em contato com o suporte.',
            onCancel: () => {
              handleAlertDialogAction()
            },
            onConfirm: () => {
              handleAlertDialogAction()
            },
          })

          return
        }

        const nominatimApiResponseJson = await nominatimApiResponse.json()
        const address = nominatimApiResponseJson.address

        if (!address) {
          showAlertDialog({
            title: 'Erro ao obter a geolocalização',
            description:
              'Não foi possível obter o endereço do usuário. Por favor, tente novamente. Caso o problema persista, entre em contato com o suporte.',
            onCancel: () => {
              handleAlertDialogAction()
            },
            onConfirm: () => {
              handleAlertDialogAction()
            },
          })

          return
        }

        const numberRoad = [address.house_number, address.road]
          .filter(Boolean)
          .join(' ')
        const suburb = address.suburb || address.neighbourhood || ''
        const city = address.city || address.town || address.village || ''
        const state = address.state || ''

        setUserLocation({
          numberRoad,
          suburb,
          city,
          state,
          coordinates: {
            latitude,
            longitude,
          },
        })
      } catch {
        showAlertDialog({
          title: 'Erro ao obter a geolocalização',
          description:
            'Seu navegador ou dispositivo não permite o uso da geolocalização ou foi negado pelo usuário. Por favor, tente novamente.',
          onCancel: () => {
            handleAlertDialogAction()
          },
          onConfirm: () => {
            handleAlertDialogAction()
          },
        })
      }
    })
  }

  function drawVideoOnCanvas() {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const video = videoRef.current
    if (!video) {
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas
  }

  async function drawMapOnCanvas(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const staticMapUrl = googleMapRef.current?.getStaticMapUrl()
    if (!staticMapUrl) {
      return
    }

    const mapSize = googleMapRef.current?.getMapSize()
    if (!mapSize) {
      return
    }

    return new Promise<boolean>((resolve) => {
      const img = new Image()
      img.src = staticMapUrl

      img.onload = () => {
        const targetSize = 11 * 16

        const originalWidth = img.naturalWidth
        const originalHeight = img.naturalHeight

        const cropSize = Math.min(originalWidth, originalHeight)

        const offsetX = (originalWidth - cropSize) / 2
        const offsetY = (originalHeight - cropSize) / 2

        context.drawImage(
          img,
          offsetX,
          offsetY,
          cropSize,
          cropSize,
          0,
          canvas.height - targetSize,
          targetSize,
          targetSize,
        )
        resolve(true)
      }
    })
  }

  function drawUserLocationOnCanvas(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const textsToDraw = [
      dayjsApi(new Date()).format('D [de] MMM [de] YYYY HH:mm:ss'),
    ]

    if (userLocation?.numberRoad) {
      textsToDraw.push(userLocation.numberRoad)
    }

    if (userLocation?.suburb) {
      textsToDraw.push(userLocation.suburb)
    }

    if (userLocation?.city) {
      textsToDraw.push(userLocation.city)
    }

    if (userLocation?.state) {
      textsToDraw.push(userLocation.state)
    }

    context.fillStyle = 'white'

    // Draw the text in the bottom right corner with 20px padding to the right and bottom
    context.textAlign = 'right'

    const dateLineHeight = 24 // bigger spacing for the date
    const otherLineHeight = 16 // minimum spacing for the other texts

    const totalHeight =
      dateLineHeight + (textsToDraw.length - 1) * otherLineHeight

    let y = context.canvas.height - totalHeight - 20 + dateLineHeight // initial position (first line, the date)

    for (let index = 0; index < textsToDraw.length; index++) {
      const text = textsToDraw[index]
      context.fillText(
        text,
        context.canvas.width - 20, // align right with 10px padding
        y,
      )

      if (index === 0) {
        y += dateLineHeight
        continue
      }

      y += otherLineHeight
    }
  }

  async function handleTakePhoto() {
    try {
      if (!cameraContainerRef.current) {
        return
      }

      if (!videoRef.current) {
        showAlertDialog({
          title: 'Erro ao tirar foto',
          description:
            'Não foi possível tirar a foto. Por favor, tente novamente.',
          onCancel: () => {
            handleAlertDialogAction()
          },
          onConfirm: () => {
            handleAlertDialogAction()
          },
        })

        return
      }

      if (!userLocation) {
        showAlertDialog({
          title: 'Erro ao tirar foto',
          description:
            'Não foi possível tirar a foto. Por favor, tente novamente.',
          onCancel: () => {
            handleAlertDialogAction()
          },
          onConfirm: () => {
            handleAlertDialogAction()
          },
        })

        return
      }

      const canvas = drawVideoOnCanvas()
      if (!canvas) {
        return
      }

      await Promise.all([
        drawMapOnCanvas(canvas),
        drawUserLocationOnCanvas(canvas),
      ])

      const dataUrl = await canvas.toDataURL('image/png', 1.0)

      handleAlertDialogAction()
      onTakePhoto(dataUrl)
    } catch (error) {
      console.log(error, 'error')
    }
  }

  useEffect(() => {
    function stopCameraStream() {
      const stream = videoRef.current?.srcObject as MediaStream | null
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current!.srcObject = null
      }

      setIsOutsideOfApplication(true)
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
            handleGetUserLocation()
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
                ref={cameraContainerRef}
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
                  className="w-full sm:w-full h-auto sm:h-[calc(100dvh-20rem)] object-cover rounded-lg"
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

                {isOutsideOfApplication && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-2">
                    <CameraOffIcon className="size-10 text-muted-foreground" />

                    <p className="text-center text-sm text-muted-foreground">
                      Você está fora da aplicação. <br />
                      Por favor, volte para a aplicação para que a câmera
                      funcione novamente.
                    </p>
                  </div>
                )}

                {isCameraOpen && !isOutsideOfApplication && (
                  <div className="size-44 opacity-80 z-50 absolute left-6 sm:left-0 bottom-0 rounded-bl-lg overflow-hidden">
                    <GoogleMap
                      initialPosition={{
                        lat: userLocation?.coordinates?.latitude ?? 0,
                        lng: userLocation?.coordinates?.longitude ?? 0,
                      }}
                      initialZoom={16}
                      mode={GoogleMapMode.STATIC_READ_ONLY}
                      ref={googleMapRef}
                    />
                  </div>
                )}

                {isCameraOpen && !isOutsideOfApplication && (
                  <div className="absolute flex flex-col justify-end items-end bottom-0 right-6 sm:right-0 w-full p-4">
                    <span className="text-sm text-white">
                      {dayjsApi(new Date()).format(
                        'D [de] MMM [de] YYYY HH:mm:ss',
                      )}
                    </span>

                    {isGettingUserLocation && (
                      <div className="flex flex-col items-end gap-2 mt-2">
                        <Skeleton className="bg-muted-foreground/50 w-32 h-4" />
                        <Skeleton className="bg-muted-foreground/50 w-24 h-4" />
                        <Skeleton className="bg-muted-foreground/50 w-20 h-4" />
                        <Skeleton className="bg-muted-foreground/50 w-28 h-4" />
                      </div>
                    )}

                    {!isGettingUserLocation && userLocation && (
                      <div className="flex flex-col items-end mt-2">
                        {userLocation.numberRoad && (
                          <p className="text-sm text-white truncate max-w-xs w-64 text-right">
                            {userLocation.numberRoad}
                          </p>
                        )}
                        {userLocation.suburb && (
                          <p className="text-sm text-white truncate max-w-xs w-64 text-right">
                            {userLocation.suburb}
                          </p>
                        )}
                        {userLocation.city && (
                          <p className="text-sm text-white truncate max-w-xs w-64 text-right">
                            {userLocation.city}
                          </p>
                        )}
                        {userLocation.state && (
                          <p className="text-sm text-white truncate max-w-xs w-64 text-right">
                            {userLocation.state}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isTakingPhoto} variant="outline">
                <XIcon className="size-4" />
                Cancelar
              </Button>
            </DialogClose>
            <Button
              disabled={isGettingUserLocation}
              isLoading={isTakingPhoto}
              onClick={() => startTakingPhotoTransition(handleTakePhoto)}
            >
              {!isTakingPhoto && <CameraIcon className="size-4" />}
              Tirar foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
