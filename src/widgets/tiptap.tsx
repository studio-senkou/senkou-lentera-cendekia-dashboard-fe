import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  ImageIcon,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { useState, useEffect, useCallback } from 'react'

const MenuBar = ({ editor }: { editor: any }) => {
  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            editor.chain().focus().setImage({ src: result }).run()
          }
        }
        reader.readAsDataURL(file)
      }

      event.target.value = ''
    },
    [editor],
  )

  if (!editor) {
    return null
  }

  return (
    <div className="border border-input bg-background rounded-md p-1 flex items-center gap-1 flex-wrap">
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('code') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Type className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload image"
        />
        <Button variant="ghost" size="sm" type="button">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={addImage}
        title="Add image from URL"
      >
        <ImageIcon className="h-4 w-4" />
        URL
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

const CustomFloatingMenu = ({ editor }: { editor: any }) => {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!editor) return

    const updateFloatingMenu = () => {
      const { empty } = editor.state.selection
      const { doc, selection } = editor.state
      const { from } = selection

      if (empty && editor.isEditable) {
        const $from = doc.resolve(from)
        const isAtStartOfEmptyParagraph =
          $from.parent.type.name === 'paragraph' &&
          $from.parent.content.size === 0 &&
          $from.parentOffset === 0

        if (isAtStartOfEmptyParagraph) {
          const { view } = editor

          try {
            const coords = view.coordsAtPos(from)
            const editorRect = view.dom.getBoundingClientRect()
            const left = coords.left - editorRect.left
            const top = coords.top - editorRect.top - 50

            setPosition({ top, left })
            setShow(true)
          } catch (error) {
            setShow(false)
          }
        } else {
          setShow(false)
        }
      } else {
        setShow(false)
      }
    }

    editor.on('selectionUpdate', updateFloatingMenu)
    editor.on('transaction', updateFloatingMenu)
    editor.on('focus', updateFloatingMenu)
    editor.on('blur', () => setShow(false))

    return () => {
      editor.off('selectionUpdate', updateFloatingMenu)
      editor.off('transaction', updateFloatingMenu)
      editor.off('focus', updateFloatingMenu)
      editor.off('blur', () => setShow(false))
    }
  }, [editor])

  if (!show || !editor) return null

  return (
    <div
      className="absolute flex items-center gap-1 bg-background border border-input rounded-md p-1 shadow-lg z-40 pointer-events-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: 'max-content',
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''
        }
      >
        H1
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''
        }
      >
        H2
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-secondary' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

const CustomBubbleMenu = ({ editor }: { editor: any }) => {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!editor) return

    const updateBubbleMenu = () => {
      const { from, to, empty } = editor.state.selection

      if (!empty && from !== to && editor.isEditable) {
        const selectedText = editor.state.doc.textBetween(from, to, ' ')

        if (selectedText && selectedText.trim().length > 0) {
          const { view } = editor

          try {
            const start = view.coordsAtPos(from)
            const end = view.coordsAtPos(to)

            const editorRect = view.dom.getBoundingClientRect()
            const left = (start.left + end.left) / 2 - editorRect.left
            const top = start.top - editorRect.top - 50

            setPosition({ top, left })
            setShow(true)
          } catch (error) {
            setShow(false)
          }
        } else {
          setShow(false)
        }
      } else {
        setShow(false)
      }
    }

    editor.on('selectionUpdate', updateBubbleMenu)
    editor.on('transaction', updateBubbleMenu)

    return () => {
      editor.off('selectionUpdate', updateBubbleMenu)
      editor.off('transaction', updateBubbleMenu)
    }
  }, [editor])

  if (!show || !editor) return null

  return (
    <div
      className="absolute flex items-center gap-1 bg-background border border-input rounded-md p-1 shadow-lg z-50 pointer-events-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        minWidth: 'max-content',
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-secondary' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-secondary' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-secondary' : ''}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
    </div>
  )
}

export interface TiptapProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  editable?: boolean
  minHeight?: string
  className?: string
}

export function Tiptap({
  value = '<p>Hello World! 🌍</p>',
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  minHeight = '200px',
  className = '',
}: TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-2',
        },
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-lg lg:prose-xl xl:prose-2xl mx-auto focus:outline-none p-4 prose-img:max-w-full prose-img:h-auto prose-img:rounded-md`,
        style: `min-height: ${minHeight}`,
        'data-placeholder': placeholder,
      },
      handlePaste: (_view, event, _slice) => {
        const items = Array.from(event.clipboardData?.items || [])
        const imageItems = items.filter((item) => item.type.includes('image'))

        if (imageItems.length > 0) {
          event.preventDefault()

          imageItems.forEach((item) => {
            const file = item.getAsFile()
            if (file) {
              const reader = new FileReader()
              reader.onload = (readerEvent) => {
                const result = readerEvent.target?.result as string
                if (result) {
                  editor?.chain().focus().setImage({ src: result }).run()
                }
              }
              reader.readAsDataURL(file)
            }
          })

          return true
        }

        return false
      },
      handleDrop: (view, event, _slice, moved) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files.length > 0
        ) {
          const files = Array.from(event.dataTransfer.files)
          const imageFiles = files.filter((file) => file.type.includes('image'))

          if (imageFiles.length > 0) {
            event.preventDefault()

            const { schema } = view.state
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })

            imageFiles.forEach((file) => {
              const reader = new FileReader()
              reader.onload = (readerEvent) => {
                const result = readerEvent.target?.result as string
                if (result) {
                  const node = schema.nodes.image.create({ src: result })
                  const transaction = view.state.tr.insert(
                    coordinates?.pos || 0,
                    node,
                  )
                  view.dispatch(transaction)
                }
              }
              reader.readAsDataURL(file)
            })

            return true
          }
        }

        return false
      },
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  return (
    <div className={`w-full ${className}`}>
      <MenuBar editor={editor} />

      <div className="border border-input rounded-md mt-2 relative">
        <CustomFloatingMenu editor={editor} />
        <CustomBubbleMenu editor={editor} />
        <div className="tiptap-editor [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_img]:my-2 [&_.ProseMirror_img]:block">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
