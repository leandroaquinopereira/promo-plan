'use client'

import 'highlight.js/styles/github.css'

import { saveGuideContentAction } from '@promo/actions/save-guide-content'
import { defaultTiptapContent } from '@promo/constants/default-tiptap-content'
import { FirebaseErrorCode } from '@promo/constants/firebase-error-code'
import { cn } from '@promo/lib/utils'
import type { Guide } from '@promo/types/firebase'
import {
  CodeIcon,
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons'
import CodeBlock from '@tiptap/extension-code-block'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Dropcursor from '@tiptap/extension-dropcursor'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextStyle from '@tiptap/extension-text-style'
import Typograph from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { all, createLowlight } from 'lowlight'
import {
  ArrowLeft,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  SquarePilcrow,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'

import { EditableTitle } from './editable-title'
import { BubbleButton } from './editor/bubble-button'
import { FileHandler } from './editor/extensions/file-handler'
import { UploadImageExtension } from './editor/extensions/upload-image'
import {
  FloatMenuGroup,
  FloatMenuGroupButton,
  FloatMenuGroupTitle,
} from './editor/float-menu'
import { Button, buttonVariants } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

type EditorProps = {
  guide: Guide
}

const lowlight = createLowlight(all)

lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

export function Editor({ guide }: EditorProps) {
  const { execute, isPending } = useServerAction(saveGuideContentAction)
  const [guideTitle, setGuideTitle] = useState(guide.title)

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlock.configure({
        languageClassPrefix: 'language-',
        defaultLanguage: 'typescript',
        HTMLAttributes: {
          class: cn(
            'bg-zinc-100 dark:bg-zinc-800 rounded p-4 overflow-x-auto',
            'text-sm text-zinc-800 dark:text-zinc-200',
          ),
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Underline,
      TextStyle.configure({ mergeNestedSpanStyles: true }),
      Typograph,
      Dropcursor.configure({
        class: 'height-2 w-[1px] bg-zinc-500 dark:bg-zinc-400',
      }),
      Placeholder.configure({
        placeholder: "Digite '/' para ver os blocos disponíveis",
        showOnlyCurrent: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      UploadImageExtension,
      FileHandler,
    ],
    content: guide.content || defaultTiptapContent,
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[calc(100dvh-16rem)] w-screen max-w-full',
          'prose prose-lg prose-slate dark:prose-invert [&>*]:leading-5',
          'focus:outline-none px-6 py-4 transition-colors',
          'prose-code:before:content-none prose-code:after:content-none prose-code:bg-zinc-100 prose-code:text-zinc-400 dark:prose-code:bg-zinc-800 prose-code:p-1 prose-code:px-2 prose-code:rounded',
          'prose-pre:[&>code]:!bg-transparent prose-pre:[&>code]:text-zinc-500 prose-pre:[&>code]:p-0 prose-pre:bg-zinc-100',
        ),
      },
    },
  })

  async function handleSaveGuide() {
    if (!editor) {
      return
    }

    const content = editor.getHTML()
    const [result, resultError] = await execute({
      guideId: guide.id,
      content,
    })

    if (resultError) {
      toast.error(`Erro ao salvar guia.`, {
        description: resultError.message || 'Erro desconhecido ao salvar guia.',
      })

      return
    }

    if (!result.success) {
      let message = 'Erro desconhecido ao salvar guia.'
      switch (result.error?.code) {
        case FirebaseErrorCode.OBJECT_NOT_FOUND:
          message = 'Guia não encontrado. Por favor, recarregue a página.'
          break
        case FirebaseErrorCode.FIREBASE_APPS_NOT_INITIALIZED:
          message =
            'Aplicativos Firebase não inicializados. Por favor, recarregue a página.'
          break
        case FirebaseErrorCode.USER_NOT_FOUND:
          message = 'Usuário não autenticado. Por favor, faça login novamente.'
          break
        default:
          break
      }

      toast.error(`Erro ao salvar guia.`, {
        description: message,
      })

      return
    }

    toast.success('Guia salvo com sucesso!', {
      description: 'O conteúdo do guia foi atualizado.',
    })
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        const lastChar = editor?.state.doc
          .textBetween(0, editor.state.selection.from, '\n')
          .slice(-1)

        if (lastChar === '/') {
          editor
            ?.chain()
            .focus()
            .deleteRange({
              from: editor.state.selection.from - 1,
              to: editor.state.selection.to,
            })
            .run()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor])

  return (
    <div className="w-full flex grow flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <EditableTitle
          initialTitle={guideTitle}
          onSave={setGuideTitle}
          disabled
        />
      </div>
      <EditorContent className="w-full" editor={editor} />
      {editor && (
        <FloatingMenu
          editor={editor}
          shouldShow={({ state }) => {
            const { selection } = state
            const textBeforeCursor = state.doc.textBetween(
              0,
              selection.from,
              '\n',
            )

            const lastChar = textBeforeCursor.slice(-1)
            const shouldShow = lastChar === '/'

            return shouldShow
          }}
          tippyOptions={{
            hideOnClick: true,
            getReferenceClientRect: () => {
              const coords = editor.view.coordsAtPos(
                editor.state.selection.from,
              )

              return new DOMRect(coords.left + 10, coords.top, 0, 0)
            },
            placement: 'bottom-start',
            offset: [0, 4],
          }}
          className="bg-zinc-200 flex-col dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg flex items-center p-2"
        >
          <ScrollArea className="h-64 max-h-64">
            <FloatMenuGroup>
              <FloatMenuGroupTitle title="Blocos básicos" />
              <FloatMenuGroupButton
                icon={FontBoldIcon}
                description="Deixe o texto selecionado em <b>negrito</b>"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .toggleBold()
                    .run()
                }
              />
              <FloatMenuGroupButton
                icon={FontItalicIcon}
                description="Deixe o texto selecionado em <i>itálico</i>"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .toggleItalic()
                    .run()
                }
              />
              <FloatMenuGroupButton
                icon={StrikethroughIcon}
                description="Adicione <s>riscado</s> ao texto selecionado"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .toggleStrike()
                    .run()
                }
              />
            </FloatMenuGroup>

            <FloatMenuGroup>
              <FloatMenuGroupTitle title="Blocos avançados" />
              <FloatMenuGroupButton
                icon={CodeIcon}
                description="Insira um bloco de código ou destaque um trecho como <code>código</code>"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .setCodeBlock()
                    .run()
                }
              />
              <FloatMenuGroupButton
                icon={SquarePilcrow}
                description="Insira um <span class='font-semibold'>callout</span> (caixa de destaque)"
              />
              <FloatMenuGroupButton
                icon={Quote}
                description="Insira uma citação em bloco"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .setBlockquote()
                    .run()
                }
              />
              {/* <FloatMenuGroupButton
                icon={DividerHorizontalIcon}
                description="Insira uma linha divisória"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .run()
                }
              /> */}
            </FloatMenuGroup>

            <FloatMenuGroup>
              <FloatMenuGroupTitle title="Listas" />
              <FloatMenuGroupButton
                icon={List}
                description="Insira uma <b>lista com marcadores</b> (bullet list)"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .toggleBulletList()
                    .run()
                }
              />
              <FloatMenuGroupButton
                icon={ListOrdered}
                description="Insira uma <b>lista numerada</b> (numeric list)"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .toggleOrderedList()
                    .run()
                }
              />
              <FloatMenuGroupButton
                icon={ListTodo}
                description="Insira uma <b>lista de tarefas</b> (todo list)"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - 1,
                      to: editor.state.selection.from,
                    })
                    .toggleTaskList()
                    .run()
                }
              />
            </FloatMenuGroup>
          </ScrollArea>
        </FloatingMenu>
      )}
      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-2 p-2 bg-white border rounded shadow-lg dark:bg-zinc-900"
        >
          <BubbleButton
            data-state={editor.isActive('bold') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FontBoldIcon className="size-4" />
          </BubbleButton>
          <BubbleButton
            data-state={editor.isActive('italic') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FontItalicIcon className="size-4" />
          </BubbleButton>
          <BubbleButton
            data-state={editor.isActive('code') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <CodeIcon className="size-4" />
          </BubbleButton>
          <BubbleButton
            data-state={editor.isActive('strike') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughIcon className="size-4" />
          </BubbleButton>
          <BubbleButton
            data-state={editor.isActive('underline') ? 'on' : 'off'}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </BubbleButton>

          {/* <Separator orientation="vertical" className="!h-4" />
          <Popover>
            <PopoverTrigger asChild>
              <BubbleButton size="sm" className="size-auto py-1">
                <Languages className="size-4" />
                Texto
                <ChevronDown className="ml-2 size-4" />
              </BubbleButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 z-[99999999999999999999]"
              align="start"
              sideOffset={10}
            >
              <div className="w-full flex items-center justify-between gap-2">
                <Small>
                  <div className="flex items-center gap-2">
                    <Languages className="size-4" />
                    Formatação de texto
                  </div>
                </Small>

                <PopoverClose asChild>
                  <Button variant="ghost" size="icon" className="size-6">
                    <X className="size-4" />
                  </Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover> */}
        </BubbleMenu>
      )}

      <div className="self-end flex items-center gap-2">
        <Link
          href="/guides"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            isPending && 'opacity-50 pointer-events-none',
          )}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <Button
          isLoading={isPending}
          className="w-fit"
          onClick={handleSaveGuide}
        >
          Salvar guia
        </Button>
      </div>
    </div>
  )
}
