import {
  type FirebaseStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'

import { storage } from './client'

export enum UploadType {
  TASTING_PHOTO = 'tasting_photo',
  COMMON_PHOTO = 'common_photo',
  COMMON_VIDEO = 'common_video',
}

type OnCompleteParams = {
  downloadUrl: string
  filepath: string
}

type UploadParams = {
  file: File
  path: string
  type: UploadType
  metadata?: {
    contentType?: string
  }
  listeners?: {
    onProgress?: (progress: number) => void
    onError?: (error: Error) => void
    onComplete?: (params: OnCompleteParams) => Promise<void>
    onCancel?: () => void
  }
}

export class FirebaseStorageClient {
  private storage: FirebaseStorage

  constructor() {
    this.storage = storage
  }

  async upload({ file, path, type, metadata, listeners }: UploadParams) {
    const filepath = `${path}/${type}/${file.name}`
    const storageRef = ref(this.storage, filepath)

    const uploadTask = uploadBytesResumable(storageRef, file, metadata)

    return new Promise<OnCompleteParams>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          listeners?.onProgress?.(progress)
        },
        (error) => {
          listeners?.onError?.(error)
          reject(error)
        },
        async () => {
          try {
            const url = await getDownloadURL(storageRef)
            await listeners?.onComplete?.({
              downloadUrl: url,
              filepath,
            })

            resolve({
              downloadUrl: url,
              filepath,
            })
          } catch (error) {
            listeners?.onError?.(error as Error)
            reject(error)
          }
        },
      )
    })
  }
}
