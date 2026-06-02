'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Code2, Eye } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function Editor({ content, onChange, placeholder = "Start writing..." }: EditorProps) {
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        html: true,           // Important: Allow raw HTML
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setRawHtml(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[400px] p-6 bg-white',
      },
    },
  });

  const toggleRawMode = () => {
    if (!isRawMode) {
      // Switching to Raw HTML mode
      setRawHtml(editor?.getHTML() || '');
    } else {
      // Switching back to WYSIWYG
      if (editor) {
        editor.commands.setContent(rawHtml, true);
        onChange(rawHtml);
      }
    }
    setIsRawMode(!isRawMode);
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setRawHtml(newHtml);
    onChange(newHtml);
  };

  return (
    <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <Bold size={18} />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <Italic size={18} />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            <List size={18} />
          </button>

          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          >
            <ListOrdered size={18} />
          </button>

          <button
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) editor?.chain().focus().setImage({ src: url }).run();
            }}
            className="p-2 rounded hover:bg-gray-200"
          >
            <ImageIcon size={18} />
          </button>

          <button
            onClick={() => {
              const url = prompt('Enter link URL:');
              if (url) editor?.chain().focus().setLink({ href: url }).run();
            }}
            className="p-2 rounded hover:bg-gray-200"
          >
            <LinkIcon size={18} />
          </button>
        </div>

        {/* Raw HTML Toggle */}
        <button
          onClick={toggleRawMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isRawMode ? 'bg-red-100 text-red-700' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {isRawMode ? <Eye size={18} /> : <Code2 size={18} />}
          {isRawMode ? 'Preview' : 'Raw HTML'}
        </button>
      </div>

      {/* Editor Area */}
      {isRawMode ? (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          className="w-full min-h-[400px] p-6 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none"
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      <div className="text-xs text-gray-500 p-3 bg-gray-50 border-t">
        💡 Tip: You can paste full HTML directly in Raw HTML mode
      </div>
    </div>
  );
}
