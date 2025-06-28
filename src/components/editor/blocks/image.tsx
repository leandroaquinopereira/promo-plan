import { Progress } from '@promo/components/ui/progress'
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { ImageUpIcon, Loader } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" opacity="0.4" />
  <animateTransform attributeName="transform" attributeType="XML" values="0 0; ${w} 0; 0 0" dur="1.5s" repeatCount="indefinite"/>
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

export function ImageBlockComponent({ node }: ReactNodeViewProps) {
  const { src, loading, progress, alt } = node.attrs
  const [imageLoaded, setImageLoaded] = useState(false)

  // Se não tem src, não renderiza nada
  if (!src && !loading) {
    return null
  }

  return (
    <NodeViewWrapper className="uploadable-image">
      {loading ? (
        <div className="w-full flex items-center justify-center flex-col">
          <div className="flex bg-zinc-100 items-center justify-center p-4 h-[20rem] w-[40rem] animate-pulse">
            <ImageUpIcon className="size-6 text-gray-500" />
          </div>
          <div className="flex items-center justify-start p-4 pl-0 pt-2 w-[40rem]">
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg">Salvando imagem</p>
                <Loader className="animate-spin size-4 text-gray-500" />
              </div>
              <Progress value={progress ?? 0} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Image
            width={400}
            height={320}
            src={src}
            className={`rounded overflow-hidden w-full h-[32rem] transition-all duration-700 ${
              imageLoaded ? 'blur-0' : 'blur-sm'
            }`}
            alt={alt || 'Uma imagem do bloco'}
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(400, 320))}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>
      )}
    </NodeViewWrapper>
  )
}
