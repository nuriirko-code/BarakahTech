import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

// A rich text editor produces raw HTML, which is ideal for lesson content because
// we can preserve structure such as headings, bullets, code blocks, and emphasis.
const RichTextEditor = ({ content = '', onChange = () => {}, placeholder = 'Write here...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // The editor emits HTML, not plain text, so the parent can store rich formatting
      // without losing heading, list, or code-block structure.
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'min-h-64 p-4 focus:outline-none prose prose-lg max-w-none text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-code:text-slate-800',
      },
    },
  })

  // Course editing can load saved HTML after this component mounts. This keeps
  // TipTap synchronized with the parent without overwriting a local edit.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  if (!editor) return null

  const toolbarButtons = [
    { label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), icon: 'fas fa-bold' },
    { label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), icon: 'fas fa-italic' },
    { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), icon: 'H2' },
    { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), icon: 'H3' },
    { label: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), icon: 'fas fa-list-ul' },
    { label: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), icon: 'fas fa-list-ol' },
    // Code blocks preserve formatting learners need in technology courses.
    { label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), icon: 'fas fa-code' },
    { label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), icon: 'fas fa-quote-left' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-2">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={button.action}
            title={button.label}
            className={`rounded-lg p-2 text-sm font-semibold transition ${button.active ? 'bg-[#F0FDF4] text-[#16A34A]' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {button.label === 'H2' || button.label === 'H3' ? button.icon : <i className={button.icon} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <EditorContent editor={editor} className="min-h-64" />
    </div>
  )
}

export default RichTextEditor
