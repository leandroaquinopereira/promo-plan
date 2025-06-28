import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import { UploadImageExtension } from './upload-image'
import { upload } from './utils/uploader'

function uploadFiles(view: EditorView, files: File[]) {
  const { state, dispatch } = view
  const { schema } = state

  files.forEach((file: File) => {
    const uploadId = crypto.randomUUID()
    const node = schema.nodes.uploadImage.create({
      src: '', // empty for now
      loading: true,
      uploadId,
      progress: 0, // initial progress
    })

    const tr = state.tr.replaceSelectionWith(node)
    dispatch(tr)

    // Encontrar a posição do nó após inserir
    const findNodePos = () => {
      let pos: number | null = null
      view.state.doc.descendants((n, p) => {
        if (
          n.type.name === UploadImageExtension.name &&
          n.attrs.uploadId === uploadId
        ) {
          pos = p
          return false
        }
      })
      return pos
    }

    upload(tr, {
      file,
      uploadId,
      nodePos: findNodePos(),
      onProgress: (progress) => {
        const pos = findNodePos()
        if (pos !== null) {
          const newTr = view.state.tr.setNodeMarkup(pos, undefined, {
            src: '',
            loading: true,
            uploadId,
            progress: Math.round(progress),
          })
          view.dispatch(newTr)
        }
      },
      onSuccess: (url) => {
        const pos = findNodePos()
        if (pos !== null) {
          const newTr = view.state.tr.setNodeMarkup(pos, undefined, {
            src: url,
            loading: false,
            uploadId,
            progress: 100,
          })
          view.dispatch(newTr)
        }
      },
      onError: (error) => {
        console.error('Upload failed for', uploadId, error)
        // Optionally remove the node or show error state
        const pos = findNodePos()
        if (pos !== null) {
          view.dispatch(view.state.tr.delete(pos, pos + 1))
        }
      },
    })
  })
}

export const FileHandler = Extension.create({
  name: 'pasteImage',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const files = Array.from(event.clipboardData?.files || [])
            if (files.length) {
              uploadFiles(view, files)

              return true
            }
            return false
          },
          handleDrop: (view, event) => {
            const files = Array.from(event.dataTransfer?.files || [])
            if (files.length) {
              uploadFiles(view, files)
              return true
            }
            return false
          },
        },
      }),
    ]
  },
})

// 2) kick off upload
// uploadFile(file)
//   .then((url) => {
//     // 3) once done, find & update that same node
//     const { doc } = view.state
//     let pos = null
//     doc.descendants((n, p) => {
//       if (
//         n.type.name === 'uploadableImage' &&
//         n.attrs.uploadId === uploadId
//       ) {
//         pos = p
//         return false
//       }
//     })
//     if (pos != null) {
//       view.dispatch(
//         view.state.tr.setNodeMarkup(pos, undefined, {
//           src: url,
//           loading: false,
//           uploadId,
//         }),
//       )
//     }
//   })
//   .catch(() => {
//     // on error you could replace it with an error placeholder or remove it
//     console.error('Upload failed for', uploadId)
//   })
