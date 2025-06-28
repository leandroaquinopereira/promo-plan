import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { ImageBlockComponent } from '../blocks/image'

export const UploadImageExtension = Node.create({
  name: 'uploadImage',
  group: 'block', // Mudança para block ao invés de inline
  inline: false,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      loading: {
        default: false,
        parseHTML: (element) => {
          // Se não tiver data-loading, considerar como false (imagem já carregada)
          return element.getAttribute('data-loading') === 'true'
        },
      },
      uploadId: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute('data-upload-id') || null
        },
      },
      progress: {
        default: 0, // Default para 100% quando não especificado
        parseHTML: (element) => {
          const progress = element.getAttribute('data-progress')
          return progress ? parseInt(progress, 10) : 0
        },
      },
      src: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('src') || ''
        },
      },
      alt: {
        default: '',
        parseHTML: (element) => {
          return element.getAttribute('alt') || ''
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-upload-id]', // Imagens com upload-id (durante upload)
      },
      {
        tag: 'img[src]', // Qualquer imagem com src (imagens já salvas)
        getAttrs: (element) => {
          const img = element as HTMLImageElement
          return {
            src: img.src,
            alt: img.alt || '',
            loading: false,
            progress: 100,
            uploadId: img.getAttribute('data-upload-id') || null,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { uploadId, loading, progress, alt, ...rest } = HTMLAttributes

    return [
      'img',
      mergeAttributes(rest, {
        'data-upload-id': uploadId,
        'data-loading': loading ? 'true' : undefined,
        'data-progress': progress ?? 100,
        alt: alt || 'Uma imagem do bloco',
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockComponent)
  },
})
