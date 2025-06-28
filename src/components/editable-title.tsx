'use client'

import { cn } from '@promo/lib/utils'
import { Pen, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from './ui/button'

interface EditableTitleProps {
  initialTitle?: string
  onSave?: (title: string) => void
  disabled?: boolean
}

export function EditableTitle({
  initialTitle = '',
  onSave,
  disabled = false,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const contentRef = useRef<HTMLDivElement>(null)

  function handleSave() {
    const newTitle =
      contentRef.current?.innerText
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim() || ''

    let titleToSave = newTitle
    if (newTitle === '') {
      titleToSave = 'Guia sem título'
    }

    setTitle(titleToSave)
    setIsEditing(false)

    onSave?.(titleToSave)
  }

  useEffect(() => {
    if (isEditing) {
      const el = contentRef.current
      if (el) {
        el.focus()

        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)

        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }, [isEditing])

  return (
    <div className="relative w-full gap-3 max-w-full">
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={cn(
          'min-h-20 w-full max-w-full overflow-hidden mt-1.5 text-center flex items-center justify-center break-words whitespace-pre-wrap font-bold text-3xl px-4 py-2 focus:outline-none transition-colors',
          !isEditing && 'cursor-default',
          isEditing && 'border border-blue-500 rounded',
        )}
      >
        {title || 'Digite o título do guia...'}
      </div>

      {!disabled && (
        <Button
          className="absolute -top-2 -right-2 z-50 size-10 rounded-full"
          onClick={() => {
            if (isEditing) {
              handleSave()
            } else {
              setIsEditing(true)
            }
          }}
        >
          {isEditing ? <Save className="size-4" /> : <Pen className="size-4" />}
        </Button>
      )}
    </div>
  )
}
