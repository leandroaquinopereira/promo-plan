import { storage } from '@promo/lib/firebase/client'
import type { Transaction } from '@tiptap/pm/state'
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTask,
} from 'firebase/storage'

type UploadParams = {
  file: File
  uploadId: string
  nodePos: number | null
  onStart?: () => void
  onProgress?: (progress: number) => void
  onSuccess?: (url: string) => void
  onError?: (error: Error) => void
}

type MountFilenameParams = {
  file: File
  uploadId: string
}

function mountFilename(params: MountFilenameParams) {
  const { file, uploadId } = params
  const extension = file.name.split('.').pop() || 'file'
  return `${uploadId}.${extension}`
}

export function upload(transaction: Transaction, params: UploadParams) {
  const uploadId = params.uploadId
  const filename = mountFilename({
    file: params.file,
    uploadId,
  })

  const storageRef = ref(storage, `guides/uploads/${filename}`)
  const uploadTask: UploadTask = uploadBytesResumable(storageRef, params.file)

  params.onStart?.()

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      switch (snapshot.state) {
        case 'running':
          params.onProgress?.(progress)
          break
        default:
          break
      }
    },
    (error) => {
      if (error.code === 'storage/canceled') {
        return
      }

      params.onError?.(error)
    },
    () => {
      getDownloadURL(storageRef).then(async (downloadUrl) => {
        const { onSuccess } = params

        onSuccess?.(downloadUrl)
      })
    },
  )
}
