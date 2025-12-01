"use client";

import { useEditor, EditorContent, NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { common, createLowlight } from "lowlight";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2,
  Heading3,
  Code,
  FileCode,
  ImageIcon,
  Undo,
  Redo,
  ChevronDown,
  X
} from "lucide-react";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Supported programming languages
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
];

// Export languages and lowlight for use in CardGenerator
export { LANGUAGES, lowlight };

interface NovelEditorProps {
  initialContent?: string;
  onContentChange?: (html: string) => void;
  className?: string;
}

// Custom Image component with resize controls
function ResizableImageComponent({ node, updateAttributes, deleteNode }: any) {
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const width = node.attrs.width || '100%';

  const handleResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = imageRef.current?.offsetWidth || 300;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(100, Math.min(600, startWidth + diff));
      updateAttributes({ width: `${newWidth}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateAttributes]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNode();
  }, [deleteNode]);

  return (
    <NodeViewWrapper className="image-wrapper relative inline-block my-2 group">
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        style={{ width: width, maxWidth: '100%' }}
        className="rounded-lg block"
      />
      {/* Hover border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-400 rounded-lg pointer-events-none transition-colors" />
      
      {/* Delete button (top-left) */}
      <button
        className="absolute top-2 left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        style={{ pointerEvents: 'auto' }}
        onClick={handleDelete}
        contentEditable={false}
        title="Delete image"
      >
        <X size={14} />
      </button>
      
      {/* Right resize handle */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-12 bg-indigo-500 rounded-l-md cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ pointerEvents: 'auto' }}
        onMouseDown={handleResize}
      />
      
      {/* Width indicator */}
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {width}
      </div>
    </NodeViewWrapper>
  );
}

// Custom Code Block component with language selector
function CodeBlockComponent({ node, updateAttributes, deleteNode, editor }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLanguage = node.attrs.language || 'plaintext';
  const currentLabel = LANGUAGES.find(l => l.value === currentLanguage)?.label || 'Plain Text';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-delete when content is empty
  useEffect(() => {
    const content = node.textContent;
    if (content === '' || content === '\n') {
      // Use setTimeout to avoid deleting during render
      const timer = setTimeout(() => {
        deleteNode();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [node.textContent, deleteNode]);

  return (
    <NodeViewWrapper className="code-block-wrapper relative my-2">
      <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#333]">
        {/* Language selector header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526]">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors px-1.5 py-0.5 rounded hover:bg-[#333]"
              contentEditable={false}
            >
              <span>{currentLabel}</span>
              <ChevronDown size={10} />
            </button>
            
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 bg-[#252526] border border-[#404040] rounded-md shadow-xl z-50 py-0.5 min-w-[120px] max-h-[180px] overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      updateAttributes({ language: lang.value });
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-1 text-left text-[10px] transition-colors ${
                      currentLanguage === lang.value 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:bg-[#333] hover:text-slate-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Code content */}
        <pre className="!m-0 !rounded-none !border-0">
          {/* @ts-expect-error: Tiptap allows rendering as <code>, but the typings only expose div */}
          <NodeViewContent as="code" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

// Convert simple markdown to HTML for initial content
function markdownToHtml(markdown: string): string {
  if (!markdown) return "<p></p>";
  
  // If it already looks like HTML, return as-is
  if (markdown.trim().startsWith("<")) return markdown;
  
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  
  const flushList = () => {
    if (listItems.length > 0) {
      result.push(`<ul>${listItems.map(item => `<li><p>${item}</p></li>`).join('')}</ul>`);
      listItems = [];
    }
    inList = false;
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines but flush list if we were in one
    if (!trimmed) {
      if (inList) flushList();
      continue;
    }
    
    // Headers
    if (trimmed.startsWith('### ')) {
      if (inList) flushList();
      result.push(`<h3>${processInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) flushList();
      result.push(`<h2>${processInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) flushList();
      result.push(`<h1>${processInline(trimmed.slice(2))}</h1>`);
      continue;
    }
    
    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (inList) flushList();
      result.push(`<blockquote><p>${processInline(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }
    
    // List items (handle various spacing: *, - with any number of spaces)
    const listMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
    if (listMatch) {
      inList = true;
      const content = listMatch[1].trim();
      if (content) { // Only add non-empty list items
        listItems.push(processInline(content));
      }
      continue;
    }
    
    // Regular paragraph
    if (inList) flushList();
    result.push(`<p>${processInline(trimmed)}</p>`);
  }
  
  // Flush any remaining list
  if (inList) flushList();
  
  return result.join('') || "<p></p>";
}

// Process inline markdown (bold, italic, code)
function processInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Toolbar button component
function ToolbarButton({ 
  onClick, 
  isActive = false, 
  disabled = false,
  children,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive 
          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

// Code Block Dropdown component for toolbar
function CodeBlockDropdown({ 
  editor,
  isActive 
}: { 
  editor: ReturnType<typeof useEditor>;
  isActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    if (isActive && editor) {
      editor.chain().focus().toggleCodeBlock().run();
      return;
    }
    setIsOpen(!isOpen);
  };

  const insertCodeBlock = (language: string) => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock({ language }).run();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleClick}
        title={isActive ? "Remove Code Block" : "Insert Code Block"}
        className={`p-1.5 rounded transition-colors flex items-center gap-0.5 ${
          isActive 
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <FileCode size={16} />
        {!isActive && <ChevronDown size={12} />}
      </button>
      
      {isOpen && !isActive && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[140px] max-h-[280px] overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => insertCodeBlock(lang.value)}
              className="w-full px-3 py-1.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NovelEditor({ 
  initialContent = "", 
  onContentChange,
  className = ""
}: NovelEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [, forceUpdate] = useState({});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: element => element.getAttribute('width'),
              renderHTML: attributes => {
                if (!attributes.width) {
                  return {};
                }
                return { width: attributes.width };
              },
            },
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(ResizableImageComponent);
        },
      }).configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: markdownToHtml(initialContent),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        let html = editor.getHTML();
        html = html
          .replace(/<li[^>]*>\s*<p[^>]*>\s*<\/p>\s*<\/li>/gi, '')
          .replace(/<li[^>]*>\s*<\/li>/gi, '')
          .replace(/<ul[^>]*>\s*<\/ul>/gi, '')
          .replace(/<ol[^>]*>\s*<\/ol>/gi, '');
        onContentChange(html);
      }
      // Force toolbar re-render to update button states
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Force toolbar re-render when selection changes
      forceUpdate({});
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-slate-600 dark:text-slate-300',
      },
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !editor) {
    return (
      <div className={`flex items-center justify-center h-full text-slate-400 text-sm ${className}`}>
        Loading editor...
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </ToolbarButton>
        
        <div className="w-px h-5 bg-slate-200 dark:bg-gray-600 mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>
        
        <div className="w-px h-5 bg-slate-200 dark:bg-gray-600 mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={16} />
        </ToolbarButton>
        
        <div className="w-px h-5 bg-slate-200 dark:bg-gray-600 mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={16} />
        </ToolbarButton>
        
        <CodeBlockDropdown 
          editor={editor} 
          isActive={editor.isActive('codeBlock')}
        />
        
        <div className="w-px h-5 bg-slate-200 dark:bg-gray-600 mx-1" />
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const base64 = event.target?.result as string;
                  if (base64 && editor) {
                    editor.chain().focus().setImage({ src: base64 }).run();
                  }
                };
                reader.readAsDataURL(file);
              }
              // Reset input so same file can be selected again
              e.target.value = '';
            }}
          />
          <div
            className={`p-1.5 rounded transition-colors inline-flex items-center ${
              editor.isActive('image')
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
            title="Upload Image"
          >
            <ImageIcon size={16} />
          </div>
        </label>
        
        <div className="w-px h-5 bg-slate-200 mx-1" />
        
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
      
      {/* Editor Styles */}
      <style jsx global>{`
        /* Override prose heading margins */
        .prose h1:first-child,
        .prose h2:first-child,
        .prose h3:first-child,
        .ProseMirror h1:first-child,
        .ProseMirror h2:first-child,
        .ProseMirror h3:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        
        .ProseMirror h1 {
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
        }
        
        .ProseMirror h2 {
          margin-top: 1.25rem !important;
          margin-bottom: 0.625rem !important;
        }
        
        .ProseMirror h3 {
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
        }
        
        /* Also override in card preview */
        .prose > h1:first-child,
        .prose > h2:first-child,
        .prose > h3:first-child {
          margin-top: 0 !important;
        }
        
        /* Image wrapper and styling */
        .image-wrapper {
          max-width: 100%;
          margin: 0.75rem auto;
        }
        
        .image-wrapper img {
          max-width: 100%;
          max-height: 500px;
          height: auto;
          object-fit: contain;
        }
        
        .ProseMirror .image-wrapper.ProseMirror-selectednode {
          outline: none;
        }
        
        .ProseMirror .image-wrapper.ProseMirror-selectednode > div:first-child {
          border-color: #6366f1 !important;
        }
        
        /* Inline code styling in editor */
        .ProseMirror code:not(pre code) {
          background: #f1f5f9;
          color: #e11d48;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 0.875em;
        }
        
        /* Dark mode inline code */
        .dark .ProseMirror code:not(pre code) {
          background: #374151;
          color: #f472b6;
        }
        
        /* Code block wrapper */
        .code-block-wrapper {
          position: relative;
        }
        
        /* Code block styling */
        .ProseMirror pre {
          background: #1e1e1e;
          color: #d4d4d4;
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          padding: 0.75rem 1rem;
          border-radius: 0 0 0.5rem 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
          overflow-x: auto;
          margin: 0;
        }
        
        .ProseMirror pre code {
          background: none;
          color: inherit;
          font-size: inherit;
          padding: 0;
        }
        
        /* Dark mode editor text colors */
        .dark .ProseMirror p,
        .dark .ProseMirror li {
          color: #d1d5db;
        }
        
        .dark .ProseMirror h1,
        .dark .ProseMirror h2,
        .dark .ProseMirror h3,
        .dark .ProseMirror h4 {
          color: #f3f4f6;
        }
        
        .dark .ProseMirror blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }
        
        .dark .ProseMirror ul li::marker,
        .dark .ProseMirror ol li::marker {
          color: #6b7280;
        }
        
        /* Syntax highlighting colors (VS Code Dark+ theme) */
        .ProseMirror .hljs-keyword { color: #569cd6; }
        .ProseMirror .hljs-string { color: #ce9178; }
        .ProseMirror .hljs-number { color: #b5cea8; }
        .ProseMirror .hljs-function { color: #dcdcaa; }
        .ProseMirror .hljs-comment { color: #6a9955; font-style: italic; }
        .ProseMirror .hljs-variable { color: #9cdcfe; }
        .ProseMirror .hljs-class { color: #4ec9b0; }
        .ProseMirror .hljs-attr { color: #9cdcfe; }
        .ProseMirror .hljs-tag { color: #569cd6; }
        .ProseMirror .hljs-attribute { color: #9cdcfe; }
        .ProseMirror .hljs-built_in { color: #4ec9b0; }
        .ProseMirror .hljs-type { color: #4ec9b0; }
        .ProseMirror .hljs-params { color: #9cdcfe; }
        .ProseMirror .hljs-meta { color: #569cd6; }
        .ProseMirror .hljs-title { color: #dcdcaa; }
        .ProseMirror .hljs-section { color: #dcdcaa; }
        .ProseMirror .hljs-name { color: #569cd6; }
        .ProseMirror .hljs-selector-tag { color: #d7ba7d; }
        .ProseMirror .hljs-selector-class { color: #d7ba7d; }
        .ProseMirror .hljs-selector-id { color: #d7ba7d; }
        .ProseMirror .hljs-property { color: #9cdcfe; }
        .ProseMirror .hljs-literal { color: #569cd6; }
        .ProseMirror .hljs-symbol { color: #b5cea8; }
        .ProseMirror .hljs-punctuation { color: #d4d4d4; }
        .ProseMirror .hljs-operator { color: #d4d4d4; }
      `}</style>
    </div>
  );
}
