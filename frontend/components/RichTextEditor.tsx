/* eslint-disable */

"use client"

import { useState, useEffect, useRef } from "react"
import { Suspense } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

// Lazy-loaded CKEditor component
const LazyEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [Editor, setEditor] = useState<any>(null)
  const [ClassicEditor, setClassicEditor] = useState<any>(null)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const [editorModule, classicEditorModule] = await Promise.all([
          import("@ckeditor/ckeditor5-react"),
          import("@ckeditor/ckeditor5-build-classic"),
        ])

        setEditor(() => editorModule.CKEditor)
        setClassicEditor(() => classicEditorModule.default)
      } catch (error) {
        console.error("Failed to load CKEditor:", error)
      }
    }

    loadEditor()
  }, [])

  if (!Editor || !ClassicEditor) {
    return (
      <div className="p-8 h-80 bg-gray-50 animate-pulse flex items-center justify-center rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent mx-auto mb-4"></div>
          <span className="text-gray-600 font-medium">جاري تحميل المحرر...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden bg-white">
      <Editor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "|",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "outdent",
              "indent",
              "|",
              "blockQuote",
              "insertTable",
              "|",
              "undo",
              "redo",
            ],
          },
          placeholder: placeholder || "ابدأ في كتابة محتوى رائع هنا...",
          language: "ar",
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
          heading: {
            options: [
              { model: "paragraph", title: "فقرة", class: "ck-heading_paragraph" },
              { model: "heading1", view: "h1", title: "عنوان رئيسي", class: "ck-heading_heading1" },
              { model: "heading2", view: "h2", title: "عنوان فرعي", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "عنوان صغير", class: "ck-heading_heading3" },
            ],
          },
        }}
        onReady={(editor: any) => {
          editorRef.current = editor
          // Set minimum height and styling for better UX
          editor.editing.view.change((writer: any) => {
            writer.setStyle("min-height", "300px", editor.editing.view.document.getRoot())
            writer.setStyle("padding", "20px", editor.editing.view.document.getRoot())
            writer.setStyle("font-size", "16px", editor.editing.view.document.getRoot())
            writer.setStyle("line-height", "1.6", editor.editing.view.document.getRoot())
          })
        }}
        onChange={(_: any, editor: any) => {
          const data = editor.getData()
          onChange(data)
        }}
        onError={(error: any) => {
          console.error("CKEditor error:", error)
        }}
      />
    </div>
  )
}

export default function RichTextEditor({ value, onChange, placeholder, error }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="p-8 h-80 bg-gray-50 animate-pulse flex items-center justify-center rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent mx-auto mb-4"></div>
            <span className="text-gray-600 font-medium">جاري التحميل...</span>
          </div>
        </div>
        {error && (
          <p className="text-red-600 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Suspense
        fallback={
          <div className="p-8 h-80 bg-gray-50 animate-pulse flex items-center justify-center rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF37] border-t-transparent mx-auto mb-4"></div>
              <span className="text-gray-600 font-medium">جاري تحميل المحرر...</span>
            </div>
          </div>
        }
      >
        <LazyEditor value={value} onChange={onChange} placeholder={placeholder} />
      </Suspense>
      {error && (
        <p className="text-red-600 text-sm font-medium flex items-center gap-2 mt-3">
          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  )
}
