import {
  mergeAttributes,
  Node,
  NodeViewWrapper,
  type NodeViewWrapperProps,
  ReactNodeViewRenderer,
  textblockTypeInputRule,
} from '@tiptap/react'
import CodeEditor from '@uiw/react-textarea-code-editor'
import { useState } from 'react'

// Componente React que será renderizado
export function CodeBlockComp(props: NodeViewWrapperProps) {
  const [code, setCode] = useState(`function add(a, b) {\n  return a + b;\n}`)

  return (
    <NodeViewWrapper {...props}>
      <CodeEditor
        value={code}
        language="js"
        placeholder="Please enter JS code."
        onChange={(evn) => setCode(evn.target.value)}
        padding={15}
      />
    </NodeViewWrapper>
  )
}

export const PromoCodeBlock = Node.create({
  name: 'code-block-comp',
  group: 'block',
  content: 'text*',
  selectable: true,

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const textBefore = editor.state.doc.textBetween(
          editor.state.selection.$from.before(),
          editor.state.selection.from,
          '\n',
        )

        if (textBefore.trim() === '```') {
          editor
            .chain()
            .focus()
            .deleteRange({
              from: editor.state.selection.from - 3,
              to: editor.state.selection.from,
            })
            .insertContent({ type: this.name })
            .run()

          return true
        }

        return false
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComp)
  },

  parseHTML() {
    return [{ tag: 'div[data-type="code-block-comp"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'code-block-comp',
      }),
    ]
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^```([a-z]*)$/,
        type: this.type,
      }),
    ]
  },
})
