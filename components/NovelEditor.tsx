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
  X,
  Upload,
  Link,
  Smile,
  Search
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
    <NodeViewWrapper className="image-wrapper relative inline-block my-1 group">
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
  let inOrderedList = false;
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockContent: string[] = [];
  
  const flushList = () => {
    if (listItems.length > 0) {
      result.push(`<ul>${listItems.map(item => `<li><p>${item}</p></li>`).join('')}</ul>`);
      listItems = [];
    }
    inList = false;
  };
  
  const flushOrderedList = () => {
    if (orderedListItems.length > 0) {
      result.push(`<ol>${orderedListItems.map(item => `<li><p>${item}</p></li>`).join('')}</ol>`);
      orderedListItems = [];
    }
    inOrderedList = false;
  };
  
  const flushCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      const code = codeBlockContent.join('\n')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      result.push(`<pre><code class="language-${codeBlockLanguage || 'plaintext'}">${code}</code></pre>`);
      codeBlockContent = [];
    }
    inCodeBlock = false;
    codeBlockLanguage = '';
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Code block handling
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        flushCodeBlock();
      } else {
        // Start of code block
        if (inList) flushList();
        if (inOrderedList) flushOrderedList();
        inCodeBlock = true;
        codeBlockLanguage = trimmed.slice(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Skip empty lines but flush list if we were in one
    if (!trimmed) {
      if (inList) flushList();
      if (inOrderedList) flushOrderedList();
      continue;
    }
    
    // Headers
    if (trimmed.startsWith('### ')) {
      if (inList) flushList();
      if (inOrderedList) flushOrderedList();
      result.push(`<h3>${processInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) flushList();
      if (inOrderedList) flushOrderedList();
      result.push(`<h2>${processInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) flushList();
      if (inOrderedList) flushOrderedList();
      result.push(`<h1>${processInline(trimmed.slice(2))}</h1>`);
      continue;
    }
    
    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (inList) flushList();
      if (inOrderedList) flushOrderedList();
      result.push(`<blockquote><p>${processInline(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }
    
    // Ordered list items (1. 2. 3. etc)
    const orderedListMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedListMatch) {
      if (inList) flushList();
      inOrderedList = true;
      const content = orderedListMatch[1].trim();
      if (content) {
        orderedListItems.push(processInline(content));
      }
      continue;
    }
    
    // Unordered list items (handle various spacing: *, - with any number of spaces)
    const listMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
    if (listMatch) {
      if (inOrderedList) flushOrderedList();
      inList = true;
      const content = listMatch[1].trim();
      if (content) { // Only add non-empty list items
        listItems.push(processInline(content));
      }
      continue;
    }
    
    // Standalone image line - handle before regular paragraph
    // Match ![alt](url) where url can contain any characters until the final )
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\((.+)\)$/);
    if (imageMatch) {
      if (inList) flushList();
      if (inOrderedList) flushOrderedList();
      const alt = imageMatch[1] || '';
      const src = imageMatch[2] || '';
      if (src) {
        result.push(`<img src="${src}" alt="${alt}" />`);
      }
      continue;
    }
    
    // Regular paragraph
    if (inList) flushList();
    if (inOrderedList) flushOrderedList();
    result.push(`<p>${processInline(trimmed)}</p>`);
  }
  
  // Flush any remaining lists or code blocks
  if (inList) flushList();
  if (inOrderedList) flushOrderedList();
  if (inCodeBlock) flushCodeBlock();
  
  return result.join('') || "<p></p>";
}

// Check if text looks like Markdown
function looksLikeMarkdown(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers
    /\*\*[^*]+\*\*/,         // Bold
    /\*[^*]+\*/,             // Italic
    /^>\s+/m,                // Blockquote
    /^[\*\-]\s+/m,           // Unordered list
    /^\d+\.\s+/m,            // Ordered list
    /`[^`]+`/,               // Inline code
    /^```/m,                 // Code block
    /\[.+\]\(.+\)/,          // Links
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}

// Process inline markdown (bold, italic, code)
function processInline(text: string): string {
  // Handle images first - use a function to properly handle base64 and complex URLs
  let result = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    // Only create img tag if src is not empty
    if (src && src.trim()) {
      return `<img src="${src}" alt="${alt || ''}" />`;
    }
    return '';
  });
  
  return result
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
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

// Emoji data organized by categories with keywords for search
const EMOJI_DATA: Record<string, Array<{ emoji: string; keywords: string[] }>> = {
  'Smileys': [
    { emoji: '😀', keywords: ['smile', 'happy', 'grin', 'face'] },
    { emoji: '😃', keywords: ['smile', 'happy', 'joy', 'face'] },
    { emoji: '😄', keywords: ['smile', 'happy', 'laugh', 'face'] },
    { emoji: '😁', keywords: ['smile', 'happy', 'grin', 'teeth'] },
    { emoji: '😆', keywords: ['laugh', 'happy', 'xd', 'face'] },
    { emoji: '😅', keywords: ['sweat', 'smile', 'nervous', 'relief'] },
    { emoji: '🤣', keywords: ['laugh', 'rofl', 'funny', 'lol'] },
    { emoji: '😂', keywords: ['laugh', 'cry', 'tears', 'joy', 'lol'] },
    { emoji: '🙂', keywords: ['smile', 'face', 'slight'] },
    { emoji: '😊', keywords: ['blush', 'smile', 'happy', 'shy'] },
    { emoji: '😇', keywords: ['angel', 'innocent', 'halo', 'smile'] },
    { emoji: '🥰', keywords: ['love', 'heart', 'adore', 'smile'] },
    { emoji: '😍', keywords: ['love', 'heart', 'eyes', 'adore'] },
    { emoji: '🤩', keywords: ['star', 'eyes', 'excited', 'wow'] },
    { emoji: '😘', keywords: ['kiss', 'love', 'heart', 'blow'] },
    { emoji: '😗', keywords: ['kiss', 'face', 'lips'] },
    { emoji: '😚', keywords: ['kiss', 'blush', 'love'] },
    { emoji: '😙', keywords: ['kiss', 'smile', 'face'] },
    { emoji: '🥲', keywords: ['smile', 'tear', 'sad', 'happy'] },
    { emoji: '😋', keywords: ['yum', 'tongue', 'delicious', 'food'] },
    { emoji: '😛', keywords: ['tongue', 'playful', 'silly'] },
    { emoji: '😜', keywords: ['wink', 'tongue', 'playful', 'crazy'] },
    { emoji: '🤪', keywords: ['crazy', 'zany', 'silly', 'goofy'] },
    { emoji: '😝', keywords: ['tongue', 'squint', 'playful'] },
    { emoji: '🤑', keywords: ['money', 'dollar', 'rich', 'face'] },
    { emoji: '🤗', keywords: ['hug', 'embrace', 'hands', 'smile'] },
    { emoji: '🤭', keywords: ['oops', 'cover', 'giggle', 'shy'] },
    { emoji: '🤫', keywords: ['quiet', 'shush', 'secret', 'silent'] },
    { emoji: '🤔', keywords: ['think', 'hmm', 'wonder', 'curious'] },
    { emoji: '🤐', keywords: ['zip', 'mouth', 'quiet', 'secret'] },
    { emoji: '🤨', keywords: ['raise', 'eyebrow', 'skeptic', 'doubt'] },
    { emoji: '😐', keywords: ['neutral', 'face', 'meh', 'blank'] },
    { emoji: '😑', keywords: ['expressionless', 'blank', 'face'] },
    { emoji: '😶', keywords: ['silent', 'speechless', 'no mouth'] },
    { emoji: '😏', keywords: ['smirk', 'smug', 'sly', 'side'] },
    { emoji: '😒', keywords: ['unamused', 'bored', 'meh', 'side'] },
    { emoji: '🙄', keywords: ['eye roll', 'whatever', 'annoyed'] },
    { emoji: '😬', keywords: ['grimace', 'awkward', 'nervous'] },
    { emoji: '🤥', keywords: ['lie', 'pinocchio', 'nose'] },
    { emoji: '😌', keywords: ['relieved', 'calm', 'peaceful'] },
    { emoji: '😔', keywords: ['sad', 'pensive', 'down'] },
    { emoji: '😪', keywords: ['sleepy', 'tired', 'sleep'] },
    { emoji: '🤤', keywords: ['drool', 'hungry', 'yum'] },
    { emoji: '😴', keywords: ['sleep', 'zzz', 'tired', 'snore'] },
    { emoji: '😷', keywords: ['sick', 'mask', 'ill', 'covid'] },
    { emoji: '🤒', keywords: ['sick', 'fever', 'thermometer'] },
    { emoji: '🤕', keywords: ['hurt', 'injury', 'bandage', 'head'] },
    { emoji: '🤢', keywords: ['sick', 'nausea', 'green', 'ill'] },
    { emoji: '🤮', keywords: ['vomit', 'sick', 'puke', 'ill'] },
    { emoji: '🤧', keywords: ['sneeze', 'sick', 'tissue', 'cold'] },
    { emoji: '🥵', keywords: ['hot', 'heat', 'sweat', 'red'] },
    { emoji: '🥶', keywords: ['cold', 'freeze', 'ice', 'blue'] },
    { emoji: '🥴', keywords: ['drunk', 'woozy', 'dizzy'] },
    { emoji: '😵', keywords: ['dizzy', 'dead', 'spiral', 'x eyes'] },
    { emoji: '🤯', keywords: ['mind blown', 'explode', 'shock'] },
    { emoji: '🤠', keywords: ['cowboy', 'hat', 'western'] },
    { emoji: '🥳', keywords: ['party', 'celebrate', 'birthday', 'hat'] },
    { emoji: '🥸', keywords: ['disguise', 'glasses', 'nose', 'mustache'] },
    { emoji: '😎', keywords: ['cool', 'sunglasses', 'awesome'] },
    { emoji: '🤓', keywords: ['nerd', 'glasses', 'geek', 'smart'] },
    { emoji: '🧐', keywords: ['monocle', 'inspect', 'curious'] },
    { emoji: '😢', keywords: ['cry', 'sad', 'tear'] },
    { emoji: '😭', keywords: ['cry', 'sob', 'sad', 'tears'] },
    { emoji: '😤', keywords: ['angry', 'huff', 'triumph'] },
    { emoji: '😠', keywords: ['angry', 'mad', 'face'] },
    { emoji: '😡', keywords: ['angry', 'rage', 'mad', 'red'] },
    { emoji: '🤬', keywords: ['swear', 'curse', 'angry', 'symbols'] },
    { emoji: '😈', keywords: ['devil', 'evil', 'smile', 'horns'] },
    { emoji: '👿', keywords: ['devil', 'angry', 'imp'] },
    { emoji: '💀', keywords: ['skull', 'dead', 'death', 'skeleton'] },
    { emoji: '☠️', keywords: ['skull', 'crossbones', 'death', 'danger'] },
    { emoji: '💩', keywords: ['poop', 'poo', 'shit'] },
    { emoji: '🤡', keywords: ['clown', 'funny', 'circus'] },
    { emoji: '👹', keywords: ['ogre', 'monster', 'demon', 'red'] },
    { emoji: '👺', keywords: ['goblin', 'tengu', 'red', 'mask'] },
    { emoji: '👻', keywords: ['ghost', 'boo', 'halloween', 'spooky'] },
    { emoji: '👽', keywords: ['alien', 'ufo', 'space', 'extraterrestrial'] },
    { emoji: '👾', keywords: ['alien', 'game', 'monster', 'space invader'] },
    { emoji: '🤖', keywords: ['robot', 'machine', 'bot', 'android'] },
    { emoji: '😺', keywords: ['cat', 'smile', 'happy'] },
    { emoji: '😸', keywords: ['cat', 'grin', 'happy'] },
    { emoji: '😹', keywords: ['cat', 'joy', 'tears', 'laugh'] },
    { emoji: '😻', keywords: ['cat', 'heart', 'love'] },
    { emoji: '😼', keywords: ['cat', 'smirk'] },
    { emoji: '😽', keywords: ['cat', 'kiss'] },
    { emoji: '🙀', keywords: ['cat', 'weary', 'surprised'] },
    { emoji: '😿', keywords: ['cat', 'cry', 'sad', 'tear'] },
    { emoji: '😾', keywords: ['cat', 'pout', 'angry'] },
    { emoji: '🙈', keywords: ['monkey', 'see no evil', 'hide', 'eyes'] },
    { emoji: '🙉', keywords: ['monkey', 'hear no evil', 'ears'] },
    { emoji: '🙊', keywords: ['monkey', 'speak no evil', 'mouth', 'oops'] },
    { emoji: '💋', keywords: ['kiss', 'lips', 'love', 'mark'] },
    { emoji: '💌', keywords: ['love letter', 'envelope', 'heart', 'mail'] },
    { emoji: '💘', keywords: ['heart', 'arrow', 'cupid', 'love'] },
    { emoji: '💝', keywords: ['heart', 'ribbon', 'gift', 'love'] },
    { emoji: '💖', keywords: ['heart', 'sparkle', 'love'] },
    { emoji: '💗', keywords: ['heart', 'growing', 'love'] },
    { emoji: '💓', keywords: ['heart', 'beating', 'love'] },
    { emoji: '💞', keywords: ['hearts', 'revolving', 'love'] },
    { emoji: '💕', keywords: ['hearts', 'two', 'love'] },
    { emoji: '💟', keywords: ['heart', 'decoration', 'love'] },
    { emoji: '❣️', keywords: ['heart', 'exclamation', 'love'] },
    { emoji: '💔', keywords: ['heart', 'broken', 'sad', 'love'] },
    { emoji: '❤️‍🔥', keywords: ['heart', 'fire', 'passion', 'love'] },
    { emoji: '❤️‍🩹', keywords: ['heart', 'bandage', 'mending', 'heal'] },
    { emoji: '❤️', keywords: ['heart', 'love', 'red'] },
    { emoji: '🧡', keywords: ['heart', 'orange', 'love'] },
    { emoji: '💛', keywords: ['heart', 'yellow', 'love'] },
    { emoji: '💚', keywords: ['heart', 'green', 'love'] },
    { emoji: '💙', keywords: ['heart', 'blue', 'love'] },
    { emoji: '💜', keywords: ['heart', 'purple', 'love'] },
    { emoji: '🖤', keywords: ['heart', 'black', 'love'] },
    { emoji: '🤍', keywords: ['heart', 'white', 'love'] },
    { emoji: '🤎', keywords: ['heart', 'brown', 'love'] },
    { emoji: '💯', keywords: ['100', 'percent', 'perfect', 'score', 'hundred'] },
    { emoji: '💢', keywords: ['anger', 'angry', 'symbol'] },
    { emoji: '💥', keywords: ['boom', 'collision', 'explosion'] },
    { emoji: '💫', keywords: ['dizzy', 'star', 'sparkle'] },
    { emoji: '💦', keywords: ['sweat', 'water', 'drops', 'splash'] },
    { emoji: '💨', keywords: ['dash', 'wind', 'running', 'fast'] },
    { emoji: '🕳️', keywords: ['hole', 'black'] },
    { emoji: '💣', keywords: ['bomb', 'explosive', 'boom'] },
    { emoji: '💬', keywords: ['speech', 'bubble', 'comment', 'talk', 'message'] },
    { emoji: '👁️‍🗨️', keywords: ['eye', 'speech', 'witness'] },
    { emoji: '🗨️', keywords: ['speech', 'bubble', 'left'] },
    { emoji: '🗯️', keywords: ['anger', 'bubble', 'right'] },
    { emoji: '💭', keywords: ['thought', 'bubble', 'think', 'cloud'] },
    { emoji: '💤', keywords: ['sleep', 'zzz', 'tired', 'snore'] },
  ],
  'Gestures': [
    { emoji: '👋', keywords: ['wave', 'hello', 'bye', 'hand'] },
    { emoji: '🤚', keywords: ['hand', 'stop', 'raised'] },
    { emoji: '🖐️', keywords: ['hand', 'five', 'fingers', 'splayed'] },
    { emoji: '✋', keywords: ['hand', 'stop', 'high five'] },
    { emoji: '🖖', keywords: ['vulcan', 'spock', 'star trek'] },
    { emoji: '👌', keywords: ['ok', 'okay', 'perfect', 'nice'] },
    { emoji: '🤌', keywords: ['pinched', 'italian', 'fingers', 'chef'] },
    { emoji: '🤏', keywords: ['pinch', 'small', 'tiny', 'little'] },
    { emoji: '✌️', keywords: ['peace', 'victory', 'two', 'v'] },
    { emoji: '🤞', keywords: ['cross', 'fingers', 'luck', 'hope'] },
    { emoji: '🤟', keywords: ['love', 'rock', 'hand', 'ily'] },
    { emoji: '🤘', keywords: ['rock', 'metal', 'horns', 'devil'] },
    { emoji: '🤙', keywords: ['call', 'shaka', 'hang loose', 'phone'] },
    { emoji: '👈', keywords: ['point', 'left', 'finger', 'direction'] },
    { emoji: '👉', keywords: ['point', 'right', 'finger', 'direction'] },
    { emoji: '👆', keywords: ['point', 'up', 'finger', 'direction'] },
    { emoji: '🖕', keywords: ['middle finger', 'fuck', 'rude'] },
    { emoji: '👇', keywords: ['point', 'down', 'finger', 'direction'] },
    { emoji: '☝️', keywords: ['point', 'up', 'one', 'finger'] },
    { emoji: '👍', keywords: ['thumbs up', 'good', 'yes', 'like', 'ok'] },
    { emoji: '👎', keywords: ['thumbs down', 'bad', 'no', 'dislike'] },
    { emoji: '✊', keywords: ['fist', 'punch', 'power', 'solidarity'] },
    { emoji: '👊', keywords: ['fist', 'punch', 'bump'] },
    { emoji: '🤛', keywords: ['fist', 'left', 'bump'] },
    { emoji: '🤜', keywords: ['fist', 'right', 'bump'] },
    { emoji: '👏', keywords: ['clap', 'applause', 'bravo', 'hands'] },
    { emoji: '🙌', keywords: ['hands', 'celebrate', 'hooray', 'raise'] },
    { emoji: '👐', keywords: ['hands', 'open', 'jazz'] },
    { emoji: '🤲', keywords: ['hands', 'palms', 'together'] },
    { emoji: '🤝', keywords: ['handshake', 'deal', 'agreement'] },
    { emoji: '🙏', keywords: ['pray', 'please', 'thanks', 'namaste', 'hope'] },
    { emoji: '✍️', keywords: ['write', 'writing', 'hand', 'pen'] },
    { emoji: '💪', keywords: ['muscle', 'strong', 'arm', 'flex', 'bicep'] },
    { emoji: '🦾', keywords: ['robot', 'arm', 'prosthetic', 'mechanical'] },
    { emoji: '🦿', keywords: ['leg', 'prosthetic', 'mechanical'] },
    { emoji: '🦵', keywords: ['leg', 'kick', 'limb'] },
    { emoji: '🦶', keywords: ['foot', 'kick', 'stomp'] },
    { emoji: '👂', keywords: ['ear', 'hear', 'listen', 'sound'] },
    { emoji: '👃', keywords: ['nose', 'smell', 'sniff'] },
    { emoji: '🧠', keywords: ['brain', 'think', 'smart', 'mind'] },
    { emoji: '👀', keywords: ['eyes', 'look', 'see', 'watch'] },
    { emoji: '👁️', keywords: ['eye', 'look', 'see', 'watch'] },
    { emoji: '👅', keywords: ['tongue', 'taste', 'lick'] },
    { emoji: '👄', keywords: ['lips', 'mouth', 'kiss'] },
  ],
  'Animals': [
    { emoji: '🐶', keywords: ['dog', 'puppy', 'pet', 'animal'] },
    { emoji: '🐱', keywords: ['cat', 'kitty', 'pet', 'animal'] },
    { emoji: '🐭', keywords: ['mouse', 'rat', 'animal'] },
    { emoji: '🐹', keywords: ['hamster', 'pet', 'animal'] },
    { emoji: '🐰', keywords: ['rabbit', 'bunny', 'animal'] },
    { emoji: '🦊', keywords: ['fox', 'animal', 'clever'] },
    { emoji: '🐻', keywords: ['bear', 'animal'] },
    { emoji: '🐼', keywords: ['panda', 'bear', 'animal', 'china'] },
    { emoji: '🐨', keywords: ['koala', 'animal', 'australia'] },
    { emoji: '🐯', keywords: ['tiger', 'animal', 'cat'] },
    { emoji: '🦁', keywords: ['lion', 'animal', 'king', 'cat'] },
    { emoji: '🐮', keywords: ['cow', 'animal', 'moo'] },
    { emoji: '🐷', keywords: ['pig', 'animal', 'oink'] },
    { emoji: '🐸', keywords: ['frog', 'animal', 'ribbit'] },
    { emoji: '🐵', keywords: ['monkey', 'animal', 'ape'] },
    { emoji: '🙈', keywords: ['monkey', 'see no evil', 'hide'] },
    { emoji: '🙉', keywords: ['monkey', 'hear no evil'] },
    { emoji: '🙊', keywords: ['monkey', 'speak no evil', 'oops'] },
    { emoji: '🐔', keywords: ['chicken', 'bird', 'animal'] },
    { emoji: '🐧', keywords: ['penguin', 'bird', 'animal', 'cold'] },
    { emoji: '🐦', keywords: ['bird', 'animal', 'fly'] },
    { emoji: '🦆', keywords: ['duck', 'bird', 'quack'] },
    { emoji: '🦅', keywords: ['eagle', 'bird', 'america'] },
    { emoji: '🦉', keywords: ['owl', 'bird', 'wise', 'night'] },
    { emoji: '🦇', keywords: ['bat', 'animal', 'vampire', 'night'] },
    { emoji: '🐺', keywords: ['wolf', 'animal', 'howl'] },
    { emoji: '🐴', keywords: ['horse', 'animal', 'pony'] },
    { emoji: '🦄', keywords: ['unicorn', 'horse', 'magic', 'fantasy'] },
    { emoji: '🐝', keywords: ['bee', 'insect', 'honey', 'buzz'] },
    { emoji: '🦋', keywords: ['butterfly', 'insect', 'beautiful'] },
    { emoji: '🐌', keywords: ['snail', 'slow', 'animal'] },
    { emoji: '🐞', keywords: ['ladybug', 'insect', 'luck'] },
    { emoji: '🐢', keywords: ['turtle', 'slow', 'animal'] },
    { emoji: '🐍', keywords: ['snake', 'animal', 'reptile'] },
    { emoji: '🐙', keywords: ['octopus', 'sea', 'animal'] },
    { emoji: '🦑', keywords: ['squid', 'sea', 'animal'] },
    { emoji: '🦐', keywords: ['shrimp', 'sea', 'food'] },
    { emoji: '🦀', keywords: ['crab', 'sea', 'animal'] },
    { emoji: '🐠', keywords: ['fish', 'sea', 'animal'] },
    { emoji: '🐟', keywords: ['fish', 'sea', 'animal'] },
    { emoji: '🐬', keywords: ['dolphin', 'sea', 'animal'] },
    { emoji: '🐳', keywords: ['whale', 'sea', 'animal'] },
    { emoji: '🦈', keywords: ['shark', 'sea', 'animal', 'danger'] },
  ],
  'Food': [
    { emoji: '🍎', keywords: ['apple', 'fruit', 'red', 'food'] },
    { emoji: '🍐', keywords: ['pear', 'fruit', 'food'] },
    { emoji: '🍊', keywords: ['orange', 'fruit', 'food', 'citrus'] },
    { emoji: '🍋', keywords: ['lemon', 'fruit', 'food', 'citrus', 'sour'] },
    { emoji: '🍌', keywords: ['banana', 'fruit', 'food', 'yellow'] },
    { emoji: '🍉', keywords: ['watermelon', 'fruit', 'food', 'summer'] },
    { emoji: '🍇', keywords: ['grape', 'fruit', 'food', 'wine'] },
    { emoji: '🍓', keywords: ['strawberry', 'fruit', 'food', 'red'] },
    { emoji: '🍒', keywords: ['cherry', 'fruit', 'food', 'red'] },
    { emoji: '🍑', keywords: ['peach', 'fruit', 'food', 'butt'] },
    { emoji: '🥭', keywords: ['mango', 'fruit', 'food', 'tropical'] },
    { emoji: '🍍', keywords: ['pineapple', 'fruit', 'food', 'tropical'] },
    { emoji: '🥥', keywords: ['coconut', 'fruit', 'food', 'tropical'] },
    { emoji: '🥝', keywords: ['kiwi', 'fruit', 'food'] },
    { emoji: '🍅', keywords: ['tomato', 'vegetable', 'food', 'red'] },
    { emoji: '🥑', keywords: ['avocado', 'fruit', 'food', 'guacamole'] },
    { emoji: '🥦', keywords: ['broccoli', 'vegetable', 'food', 'green'] },
    { emoji: '🥒', keywords: ['cucumber', 'vegetable', 'food', 'green'] },
    { emoji: '🌶️', keywords: ['pepper', 'hot', 'spicy', 'chili'] },
    { emoji: '🌽', keywords: ['corn', 'vegetable', 'food', 'yellow'] },
    { emoji: '🥕', keywords: ['carrot', 'vegetable', 'food', 'orange'] },
    { emoji: '🥔', keywords: ['potato', 'vegetable', 'food'] },
    { emoji: '🍞', keywords: ['bread', 'food', 'toast', 'loaf'] },
    { emoji: '🥐', keywords: ['croissant', 'bread', 'food', 'french'] },
    { emoji: '🧀', keywords: ['cheese', 'food', 'dairy'] },
    { emoji: '🥚', keywords: ['egg', 'food', 'breakfast'] },
    { emoji: '🍳', keywords: ['egg', 'fried', 'food', 'breakfast', 'cooking'] },
    { emoji: '🥓', keywords: ['bacon', 'meat', 'food', 'breakfast'] },
    { emoji: '🥩', keywords: ['steak', 'meat', 'food', 'beef'] },
    { emoji: '🍗', keywords: ['chicken', 'meat', 'food', 'leg'] },
    { emoji: '🍖', keywords: ['meat', 'bone', 'food'] },
    { emoji: '🌭', keywords: ['hotdog', 'food', 'sausage'] },
    { emoji: '🍔', keywords: ['burger', 'hamburger', 'food', 'fast food'] },
    { emoji: '🍟', keywords: ['fries', 'french fries', 'food', 'fast food'] },
    { emoji: '🍕', keywords: ['pizza', 'food', 'italian'] },
    { emoji: '🥪', keywords: ['sandwich', 'food', 'bread'] },
    { emoji: '🌮', keywords: ['taco', 'food', 'mexican'] },
    { emoji: '🌯', keywords: ['burrito', 'food', 'mexican', 'wrap'] },
    { emoji: '🥗', keywords: ['salad', 'food', 'healthy', 'vegetable'] },
    { emoji: '🍝', keywords: ['pasta', 'spaghetti', 'food', 'italian'] },
    { emoji: '🍜', keywords: ['noodles', 'ramen', 'food', 'asian'] },
    { emoji: '🍲', keywords: ['stew', 'soup', 'food', 'pot'] },
    { emoji: '🍣', keywords: ['sushi', 'food', 'japanese', 'fish'] },
    { emoji: '🍱', keywords: ['bento', 'food', 'japanese', 'box'] },
    { emoji: '🍤', keywords: ['shrimp', 'food', 'fried', 'tempura'] },
    { emoji: '🍙', keywords: ['rice ball', 'food', 'japanese', 'onigiri'] },
    { emoji: '🍚', keywords: ['rice', 'food', 'bowl', 'asian'] },
    { emoji: '🍧', keywords: ['shaved ice', 'dessert', 'food', 'cold'] },
    { emoji: '🍨', keywords: ['ice cream', 'dessert', 'food', 'cold'] },
    { emoji: '🍦', keywords: ['ice cream', 'cone', 'dessert', 'food'] },
    { emoji: '🥧', keywords: ['pie', 'dessert', 'food'] },
    { emoji: '🧁', keywords: ['cupcake', 'dessert', 'food', 'cake'] },
    { emoji: '🍰', keywords: ['cake', 'dessert', 'food', 'slice'] },
    { emoji: '🎂', keywords: ['birthday', 'cake', 'dessert', 'food', 'party'] },
    { emoji: '🍭', keywords: ['lollipop', 'candy', 'dessert', 'food'] },
    { emoji: '🍬', keywords: ['candy', 'sweet', 'dessert', 'food'] },
    { emoji: '🍫', keywords: ['chocolate', 'candy', 'dessert', 'food'] },
    { emoji: '🍿', keywords: ['popcorn', 'movie', 'food', 'snack'] },
    { emoji: '🍩', keywords: ['donut', 'doughnut', 'dessert', 'food'] },
    { emoji: '🍪', keywords: ['cookie', 'dessert', 'food', 'biscuit'] },
    { emoji: '☕', keywords: ['coffee', 'drink', 'hot', 'cafe'] },
    { emoji: '🍵', keywords: ['tea', 'drink', 'hot', 'green'] },
    { emoji: '🥤', keywords: ['soda', 'drink', 'cup', 'straw'] },
    { emoji: '🧋', keywords: ['boba', 'bubble tea', 'drink', 'milk tea'] },
    { emoji: '🍺', keywords: ['beer', 'drink', 'alcohol', 'mug'] },
    { emoji: '🍻', keywords: ['beer', 'cheers', 'drink', 'alcohol'] },
    { emoji: '🥂', keywords: ['champagne', 'cheers', 'drink', 'toast', 'celebrate'] },
    { emoji: '🍷', keywords: ['wine', 'drink', 'alcohol', 'red'] },
    { emoji: '🍸', keywords: ['cocktail', 'drink', 'alcohol', 'martini'] },
    { emoji: '🍹', keywords: ['cocktail', 'drink', 'tropical', 'alcohol'] },
  ],
  'Activities': [
    { emoji: '⚽', keywords: ['soccer', 'football', 'ball', 'sport'] },
    { emoji: '🏀', keywords: ['basketball', 'ball', 'sport', 'nba'] },
    { emoji: '🏈', keywords: ['football', 'american', 'ball', 'sport', 'nfl'] },
    { emoji: '⚾', keywords: ['baseball', 'ball', 'sport'] },
    { emoji: '🎾', keywords: ['tennis', 'ball', 'sport', 'racket'] },
    { emoji: '🏐', keywords: ['volleyball', 'ball', 'sport'] },
    { emoji: '🎱', keywords: ['pool', 'billiard', 'ball', '8 ball'] },
    { emoji: '🏓', keywords: ['ping pong', 'table tennis', 'sport'] },
    { emoji: '🏸', keywords: ['badminton', 'sport', 'racket'] },
    { emoji: '🏒', keywords: ['hockey', 'ice', 'sport', 'stick'] },
    { emoji: '⛳', keywords: ['golf', 'sport', 'hole', 'flag'] },
    { emoji: '🏹', keywords: ['archery', 'bow', 'arrow', 'sport'] },
    { emoji: '🎣', keywords: ['fishing', 'fish', 'sport', 'rod'] },
    { emoji: '🥊', keywords: ['boxing', 'sport', 'fight', 'glove'] },
    { emoji: '🥋', keywords: ['martial arts', 'karate', 'judo', 'sport'] },
    { emoji: '🎽', keywords: ['running', 'sport', 'shirt', 'marathon'] },
    { emoji: '🛹', keywords: ['skateboard', 'sport', 'skate'] },
    { emoji: '⛸️', keywords: ['ice skate', 'sport', 'winter'] },
    { emoji: '🎿', keywords: ['ski', 'sport', 'winter', 'snow'] },
    { emoji: '🏂', keywords: ['snowboard', 'sport', 'winter', 'snow'] },
    { emoji: '🏆', keywords: ['trophy', 'win', 'champion', 'award', 'first'] },
    { emoji: '🏅', keywords: ['medal', 'win', 'award', 'sport'] },
    { emoji: '🥇', keywords: ['gold', 'medal', 'first', 'win', '1st'] },
    { emoji: '🥈', keywords: ['silver', 'medal', 'second', '2nd'] },
    { emoji: '🥉', keywords: ['bronze', 'medal', 'third', '3rd'] },
    { emoji: '🎮', keywords: ['game', 'video game', 'controller', 'play'] },
    { emoji: '🕹️', keywords: ['joystick', 'game', 'arcade', 'play'] },
    { emoji: '🎲', keywords: ['dice', 'game', 'random', 'luck'] },
    { emoji: '🎭', keywords: ['theater', 'drama', 'mask', 'performance'] },
    { emoji: '🎨', keywords: ['art', 'paint', 'palette', 'creative'] },
    { emoji: '🎬', keywords: ['movie', 'film', 'cinema', 'action'] },
    { emoji: '🎤', keywords: ['microphone', 'sing', 'karaoke', 'music'] },
    { emoji: '🎧', keywords: ['headphones', 'music', 'listen', 'audio'] },
    { emoji: '🎵', keywords: ['music', 'note', 'song', 'sound'] },
    { emoji: '🎶', keywords: ['music', 'notes', 'song', 'melody'] },
    { emoji: '🎹', keywords: ['piano', 'keyboard', 'music', 'keys'] },
    { emoji: '🎸', keywords: ['guitar', 'music', 'rock', 'instrument'] },
    { emoji: '🎺', keywords: ['trumpet', 'music', 'jazz', 'instrument'] },
    { emoji: '🎻', keywords: ['violin', 'music', 'classical', 'instrument'] },
    { emoji: '🥁', keywords: ['drum', 'music', 'beat', 'instrument'] },
  ],
  'Travel': [
    { emoji: '🚗', keywords: ['car', 'vehicle', 'drive', 'red'] },
    { emoji: '🚕', keywords: ['taxi', 'cab', 'car', 'yellow'] },
    { emoji: '🚌', keywords: ['bus', 'vehicle', 'transport'] },
    { emoji: '🏎️', keywords: ['race car', 'fast', 'formula', 'speed'] },
    { emoji: '🚓', keywords: ['police', 'car', 'cop', 'emergency'] },
    { emoji: '🚑', keywords: ['ambulance', 'emergency', 'hospital'] },
    { emoji: '🚒', keywords: ['fire truck', 'emergency', 'firefighter'] },
    { emoji: '🚚', keywords: ['truck', 'delivery', 'vehicle'] },
    { emoji: '🏍️', keywords: ['motorcycle', 'bike', 'vehicle'] },
    { emoji: '🚲', keywords: ['bicycle', 'bike', 'cycle', 'ride'] },
    { emoji: '✈️', keywords: ['airplane', 'plane', 'fly', 'travel', 'flight'] },
    { emoji: '🚀', keywords: ['rocket', 'space', 'launch', 'fast'] },
    { emoji: '🛸', keywords: ['ufo', 'alien', 'space', 'flying saucer'] },
    { emoji: '🚁', keywords: ['helicopter', 'fly', 'vehicle'] },
    { emoji: '⛵', keywords: ['sailboat', 'boat', 'sea', 'sail'] },
    { emoji: '🚢', keywords: ['ship', 'boat', 'sea', 'cruise'] },
    { emoji: '🚂', keywords: ['train', 'locomotive', 'steam'] },
    { emoji: '🚆', keywords: ['train', 'rail', 'transport'] },
    { emoji: '🚇', keywords: ['metro', 'subway', 'train', 'underground'] },
    { emoji: '🌍', keywords: ['earth', 'world', 'globe', 'europe', 'africa'] },
    { emoji: '🌎', keywords: ['earth', 'world', 'globe', 'america'] },
    { emoji: '🌏', keywords: ['earth', 'world', 'globe', 'asia', 'australia'] },
    { emoji: '🗺️', keywords: ['map', 'world', 'travel', 'geography'] },
    { emoji: '🧭', keywords: ['compass', 'navigate', 'direction'] },
    { emoji: '🏔️', keywords: ['mountain', 'snow', 'peak'] },
    { emoji: '⛰️', keywords: ['mountain', 'hill', 'nature'] },
    { emoji: '🌋', keywords: ['volcano', 'mountain', 'lava', 'eruption'] },
    { emoji: '🏕️', keywords: ['camping', 'tent', 'nature', 'outdoor'] },
    { emoji: '🏖️', keywords: ['beach', 'umbrella', 'summer', 'vacation'] },
    { emoji: '🏝️', keywords: ['island', 'beach', 'tropical', 'palm'] },
    { emoji: '🌅', keywords: ['sunrise', 'morning', 'sun', 'beach'] },
    { emoji: '🌄', keywords: ['sunrise', 'mountain', 'morning'] },
    { emoji: '🌇', keywords: ['sunset', 'city', 'evening'] },
    { emoji: '🌆', keywords: ['city', 'skyline', 'dusk'] },
    { emoji: '🌃', keywords: ['night', 'city', 'stars'] },
    { emoji: '🌉', keywords: ['bridge', 'night', 'city'] },
    { emoji: '🏠', keywords: ['house', 'home', 'building'] },
    { emoji: '🏡', keywords: ['house', 'home', 'garden'] },
    { emoji: '🏢', keywords: ['office', 'building', 'work'] },
    { emoji: '🏰', keywords: ['castle', 'disney', 'palace'] },
    { emoji: '🗼', keywords: ['tower', 'tokyo', 'landmark'] },
    { emoji: '🗽', keywords: ['statue of liberty', 'usa', 'new york', 'landmark'] },
    { emoji: '⛩️', keywords: ['shrine', 'japan', 'torii', 'temple'] },
  ],
  'Objects': [
    { emoji: '⌚', keywords: ['watch', 'time', 'clock'] },
    { emoji: '📱', keywords: ['phone', 'mobile', 'smartphone', 'iphone'] },
    { emoji: '💻', keywords: ['laptop', 'computer', 'mac', 'work'] },
    { emoji: '⌨️', keywords: ['keyboard', 'type', 'computer'] },
    { emoji: '🖥️', keywords: ['computer', 'desktop', 'monitor', 'screen'] },
    { emoji: '🖨️', keywords: ['printer', 'print', 'paper'] },
    { emoji: '🖱️', keywords: ['mouse', 'computer', 'click'] },
    { emoji: '💾', keywords: ['floppy', 'disk', 'save'] },
    { emoji: '💿', keywords: ['cd', 'disk', 'dvd'] },
    { emoji: '📷', keywords: ['camera', 'photo', 'picture'] },
    { emoji: '📸', keywords: ['camera', 'flash', 'photo'] },
    { emoji: '📹', keywords: ['camera', 'video', 'record'] },
    { emoji: '🎥', keywords: ['movie', 'camera', 'film'] },
    { emoji: '📺', keywords: ['tv', 'television', 'screen', 'watch'] },
    { emoji: '📻', keywords: ['radio', 'music', 'listen'] },
    { emoji: '🎙️', keywords: ['microphone', 'podcast', 'record'] },
    { emoji: '⏰', keywords: ['alarm', 'clock', 'time', 'wake'] },
    { emoji: '⌛', keywords: ['hourglass', 'time', 'wait'] },
    { emoji: '⏳', keywords: ['hourglass', 'time', 'loading'] },
    { emoji: '📡', keywords: ['satellite', 'signal', 'antenna'] },
    { emoji: '🔋', keywords: ['battery', 'power', 'charge'] },
    { emoji: '🔌', keywords: ['plug', 'electric', 'power'] },
    { emoji: '💡', keywords: ['light', 'bulb', 'idea', 'bright'] },
    { emoji: '🔦', keywords: ['flashlight', 'light', 'torch'] },
    { emoji: '💰', keywords: ['money', 'bag', 'cash', 'rich'] },
    { emoji: '💵', keywords: ['money', 'dollar', 'cash', 'bill'] },
    { emoji: '💴', keywords: ['money', 'yen', 'cash', 'japan'] },
    { emoji: '💶', keywords: ['money', 'euro', 'cash', 'europe'] },
    { emoji: '💷', keywords: ['money', 'pound', 'cash', 'uk'] },
    { emoji: '💳', keywords: ['credit card', 'payment', 'money'] },
    { emoji: '💎', keywords: ['diamond', 'gem', 'jewel', 'precious'] },
    { emoji: '🔧', keywords: ['wrench', 'tool', 'fix', 'repair'] },
    { emoji: '🔨', keywords: ['hammer', 'tool', 'build'] },
    { emoji: '🔩', keywords: ['nut', 'bolt', 'tool'] },
    { emoji: '⚙️', keywords: ['gear', 'settings', 'cog'] },
    { emoji: '🔗', keywords: ['link', 'chain', 'connect', 'url'] },
    { emoji: '📎', keywords: ['paperclip', 'attach', 'office', 'clip'] },
    { emoji: '🖇️', keywords: ['paperclips', 'attach', 'linked'] },
    { emoji: '✂️', keywords: ['scissors', 'cut', 'tool'] },
    { emoji: '📏', keywords: ['ruler', 'measure', 'straight'] },
    { emoji: '📐', keywords: ['triangle', 'ruler', 'measure'] },
    { emoji: '🔒', keywords: ['lock', 'secure', 'closed', 'private'] },
    { emoji: '🔓', keywords: ['unlock', 'open', 'free'] },
    { emoji: '🔐', keywords: ['lock', 'key', 'secure'] },
    { emoji: '🔑', keywords: ['key', 'lock', 'password', 'access'] },
    { emoji: '🗝️', keywords: ['key', 'old', 'vintage', 'antique'] },
    { emoji: '📌', keywords: ['pin', 'pushpin', 'location', 'marker', 'tack'] },
    { emoji: '📍', keywords: ['pin', 'location', 'map', 'marker', 'place'] },
    { emoji: '🖊️', keywords: ['pen', 'write', 'ballpoint'] },
    { emoji: '🖋️', keywords: ['pen', 'fountain', 'write'] },
    { emoji: '✏️', keywords: ['pencil', 'write', 'draw', 'edit'] },
    { emoji: '✒️', keywords: ['pen', 'nib', 'write'] },
    { emoji: '🖍️', keywords: ['crayon', 'draw', 'color'] },
    { emoji: '📦', keywords: ['box', 'package', 'shipping', 'delivery'] },
    { emoji: '📫', keywords: ['mailbox', 'mail', 'letter', 'post'] },
    { emoji: '📬', keywords: ['mailbox', 'mail', 'letter', 'flag'] },
    { emoji: '📭', keywords: ['mailbox', 'empty', 'mail'] },
    { emoji: '📮', keywords: ['postbox', 'mail', 'letter'] },
    { emoji: '📧', keywords: ['email', 'mail', 'message', 'e-mail'] },
    { emoji: '📨', keywords: ['envelope', 'mail', 'incoming'] },
    { emoji: '📩', keywords: ['envelope', 'mail', 'arrow'] },
    { emoji: '📝', keywords: ['memo', 'note', 'write', 'paper', 'document'] },
    { emoji: '📄', keywords: ['page', 'document', 'paper', 'file'] },
    { emoji: '📃', keywords: ['page', 'curl', 'document'] },
    { emoji: '📑', keywords: ['bookmark', 'tabs', 'document'] },
    { emoji: '📊', keywords: ['chart', 'graph', 'bar', 'data', 'statistics'] },
    { emoji: '📈', keywords: ['chart', 'graph', 'up', 'growth', 'increase'] },
    { emoji: '📉', keywords: ['chart', 'graph', 'down', 'decrease'] },
    { emoji: '📋', keywords: ['clipboard', 'paste', 'list', 'document'] },
    { emoji: '📁', keywords: ['folder', 'file', 'directory'] },
    { emoji: '📂', keywords: ['folder', 'open', 'file'] },
    { emoji: '🗂️', keywords: ['folder', 'dividers', 'index'] },
    { emoji: '🗃️', keywords: ['card', 'file', 'box', 'index'] },
    { emoji: '🗄️', keywords: ['cabinet', 'file', 'drawer'] },
    { emoji: '🗑️', keywords: ['trash', 'bin', 'delete', 'garbage'] },
    { emoji: '📚', keywords: ['books', 'read', 'study', 'library'] },
    { emoji: '📖', keywords: ['book', 'read', 'open'] },
    { emoji: '📕', keywords: ['book', 'red', 'closed'] },
    { emoji: '📗', keywords: ['book', 'green'] },
    { emoji: '📘', keywords: ['book', 'blue'] },
    { emoji: '📙', keywords: ['book', 'orange'] },
    { emoji: '🔖', keywords: ['bookmark', 'mark', 'save', 'tag'] },
    { emoji: '🏷️', keywords: ['tag', 'label', 'price'] },
    { emoji: '📰', keywords: ['newspaper', 'news', 'read'] },
    { emoji: '🗞️', keywords: ['newspaper', 'news', 'rolled'] },
    { emoji: '🎁', keywords: ['gift', 'present', 'birthday', 'christmas'] },
    { emoji: '🎀', keywords: ['ribbon', 'bow', 'gift', 'pink'] },
    { emoji: '🎈', keywords: ['balloon', 'party', 'birthday'] },
    { emoji: '🎉', keywords: ['party', 'celebrate', 'tada', 'confetti'] },
    { emoji: '🎊', keywords: ['confetti', 'party', 'ball'] },
    { emoji: '🎄', keywords: ['christmas', 'tree', 'holiday'] },
    { emoji: '🎃', keywords: ['pumpkin', 'halloween', 'jack-o-lantern'] },
    { emoji: '🧨', keywords: ['firecracker', 'dynamite', 'explosive'] },
    { emoji: '🪄', keywords: ['wand', 'magic', 'wizard'] },
    { emoji: '🔮', keywords: ['crystal ball', 'magic', 'fortune'] },
    { emoji: '🧿', keywords: ['evil eye', 'nazar', 'protection'] },
    { emoji: '🎯', keywords: ['target', 'dart', 'bullseye', 'goal'] },
    { emoji: '🧲', keywords: ['magnet', 'attract'] },
    { emoji: '🧪', keywords: ['test tube', 'science', 'lab', 'experiment'] },
    { emoji: '🧫', keywords: ['petri dish', 'science', 'lab'] },
    { emoji: '🧬', keywords: ['dna', 'gene', 'science', 'biology'] },
    { emoji: '🔬', keywords: ['microscope', 'science', 'lab', 'research'] },
    { emoji: '🔭', keywords: ['telescope', 'space', 'astronomy', 'star'] },
    { emoji: '💊', keywords: ['pill', 'medicine', 'drug', 'health'] },
    { emoji: '💉', keywords: ['syringe', 'needle', 'vaccine', 'injection'] },
    { emoji: '🩺', keywords: ['stethoscope', 'doctor', 'medical'] },
    { emoji: '🩹', keywords: ['bandage', 'band-aid', 'injury'] },
    { emoji: '🩼', keywords: ['crutch', 'injury', 'support'] },
    { emoji: '🪑', keywords: ['chair', 'seat', 'sit', 'furniture'] },
    { emoji: '🛏️', keywords: ['bed', 'sleep', 'furniture'] },
    { emoji: '🛋️', keywords: ['couch', 'sofa', 'furniture'] },
    { emoji: '🚿', keywords: ['shower', 'bathroom', 'water'] },
    { emoji: '🛁', keywords: ['bathtub', 'bath', 'bathroom'] },
    { emoji: '🚽', keywords: ['toilet', 'bathroom', 'wc'] },
    { emoji: '🧴', keywords: ['lotion', 'bottle', 'sunscreen'] },
    { emoji: '🧷', keywords: ['safety pin', 'pin', 'diaper'] },
    { emoji: '🧹', keywords: ['broom', 'clean', 'sweep'] },
    { emoji: '🧺', keywords: ['basket', 'laundry'] },
    { emoji: '🧻', keywords: ['toilet paper', 'roll', 'tissue'] },
    { emoji: '🪣', keywords: ['bucket', 'pail', 'water'] },
    { emoji: '🧽', keywords: ['sponge', 'clean', 'wash'] },
    { emoji: '🪥', keywords: ['toothbrush', 'teeth', 'dental'] },
    { emoji: '🛒', keywords: ['cart', 'shopping', 'store'] },
    { emoji: '🛍️', keywords: ['bags', 'shopping', 'store'] },
    { emoji: '🎒', keywords: ['backpack', 'bag', 'school'] },
    { emoji: '👓', keywords: ['glasses', 'eyeglasses', 'spectacles'] },
    { emoji: '🕶️', keywords: ['sunglasses', 'cool', 'shades'] },
    { emoji: '🥽', keywords: ['goggles', 'swim', 'safety'] },
    { emoji: '👔', keywords: ['tie', 'necktie', 'shirt', 'formal'] },
    { emoji: '👕', keywords: ['shirt', 't-shirt', 'tshirt', 'clothes'] },
    { emoji: '👖', keywords: ['jeans', 'pants', 'clothes'] },
    { emoji: '👗', keywords: ['dress', 'clothes', 'fashion'] },
    { emoji: '👘', keywords: ['kimono', 'japan', 'clothes'] },
    { emoji: '👙', keywords: ['bikini', 'swimsuit', 'beach'] },
    { emoji: '👚', keywords: ['blouse', 'woman', 'clothes'] },
    { emoji: '👛', keywords: ['purse', 'wallet', 'bag'] },
    { emoji: '👜', keywords: ['handbag', 'bag', 'purse'] },
    { emoji: '👝', keywords: ['clutch', 'bag', 'pouch'] },
    { emoji: '🎩', keywords: ['hat', 'top hat', 'formal', 'magic'] },
    { emoji: '🧢', keywords: ['cap', 'hat', 'baseball'] },
    { emoji: '👑', keywords: ['crown', 'king', 'queen', 'royal'] },
    { emoji: '💄', keywords: ['lipstick', 'makeup', 'cosmetic'] },
    { emoji: '💍', keywords: ['ring', 'wedding', 'engaged', 'diamond'] },
    { emoji: '💼', keywords: ['briefcase', 'work', 'business', 'job'] },
    { emoji: '🧳', keywords: ['luggage', 'suitcase', 'travel'] },
    { emoji: '☂️', keywords: ['umbrella', 'rain', 'weather'] },
    { emoji: '🌂', keywords: ['umbrella', 'closed', 'rain'] },
  ],
  'Symbols': [
    { emoji: '❤️', keywords: ['heart', 'love', 'red'] },
    { emoji: '🧡', keywords: ['heart', 'love', 'orange'] },
    { emoji: '💛', keywords: ['heart', 'love', 'yellow'] },
    { emoji: '💚', keywords: ['heart', 'love', 'green'] },
    { emoji: '💙', keywords: ['heart', 'love', 'blue'] },
    { emoji: '💜', keywords: ['heart', 'love', 'purple'] },
    { emoji: '🖤', keywords: ['heart', 'love', 'black'] },
    { emoji: '🤍', keywords: ['heart', 'love', 'white'] },
    { emoji: '🤎', keywords: ['heart', 'love', 'brown'] },
    { emoji: '💔', keywords: ['heart', 'broken', 'sad', 'love'] },
    { emoji: '❤️‍🔥', keywords: ['heart', 'fire', 'passion', 'love'] },
    { emoji: '💕', keywords: ['hearts', 'love', 'two'] },
    { emoji: '💞', keywords: ['hearts', 'love', 'revolving'] },
    { emoji: '💓', keywords: ['heart', 'love', 'beating'] },
    { emoji: '💗', keywords: ['heart', 'love', 'growing'] },
    { emoji: '💖', keywords: ['heart', 'love', 'sparkling'] },
    { emoji: '💘', keywords: ['heart', 'love', 'arrow', 'cupid'] },
    { emoji: '💝', keywords: ['heart', 'love', 'gift', 'ribbon'] },
    { emoji: '💟', keywords: ['heart', 'love', 'decoration'] },
    { emoji: '☮️', keywords: ['peace', 'symbol', 'hippie'] },
    { emoji: '✝️', keywords: ['cross', 'christian', 'religion'] },
    { emoji: '☯️', keywords: ['yin yang', 'balance', 'tao'] },
    { emoji: '⭐', keywords: ['star', 'favorite', 'rating'] },
    { emoji: '🌟', keywords: ['star', 'glowing', 'sparkle'] },
    { emoji: '✨', keywords: ['sparkles', 'shine', 'magic', 'clean'] },
    { emoji: '⚡', keywords: ['lightning', 'bolt', 'electric', 'fast', 'zap'] },
    { emoji: '🔥', keywords: ['fire', 'hot', 'flame', 'lit'] },
    { emoji: '💥', keywords: ['explosion', 'boom', 'collision'] },
    { emoji: '💫', keywords: ['dizzy', 'star', 'sparkle'] },
    { emoji: '💯', keywords: ['100', 'perfect', 'score', 'hundred'] },
    { emoji: '✅', keywords: ['check', 'done', 'yes', 'correct'] },
    { emoji: '❌', keywords: ['x', 'no', 'wrong', 'cross', 'delete'] },
    { emoji: '❓', keywords: ['question', 'what', 'help'] },
    { emoji: '❗', keywords: ['exclamation', 'important', 'warning'] },
    { emoji: '⚠️', keywords: ['warning', 'caution', 'alert'] },
    { emoji: '🚫', keywords: ['no', 'prohibited', 'forbidden', 'ban'] },
    { emoji: '♻️', keywords: ['recycle', 'environment', 'green'] },
    { emoji: '💬', keywords: ['speech', 'bubble', 'comment', 'talk'] },
    { emoji: '💭', keywords: ['thought', 'bubble', 'think'] },
    { emoji: '🗨️', keywords: ['speech', 'bubble', 'left'] },
    { emoji: '➡️', keywords: ['arrow', 'right', 'next', 'direction'] },
    { emoji: '⬅️', keywords: ['arrow', 'left', 'back', 'direction'] },
    { emoji: '⬆️', keywords: ['arrow', 'up', 'direction'] },
    { emoji: '⬇️', keywords: ['arrow', 'down', 'direction'] },
    { emoji: '↗️', keywords: ['arrow', 'up right', 'direction'] },
    { emoji: '↘️', keywords: ['arrow', 'down right', 'direction'] },
    { emoji: '↙️', keywords: ['arrow', 'down left', 'direction'] },
    { emoji: '↖️', keywords: ['arrow', 'up left', 'direction'] },
    { emoji: '🔄', keywords: ['refresh', 'reload', 'arrows', 'sync'] },
    { emoji: '➕', keywords: ['plus', 'add', 'positive'] },
    { emoji: '➖', keywords: ['minus', 'subtract', 'negative'] },
    { emoji: '✖️', keywords: ['multiply', 'x', 'times'] },
    { emoji: '➗', keywords: ['divide', 'division'] },
    { emoji: '🔴', keywords: ['red', 'circle', 'dot'] },
    { emoji: '🟠', keywords: ['orange', 'circle', 'dot'] },
    { emoji: '🟡', keywords: ['yellow', 'circle', 'dot'] },
    { emoji: '🟢', keywords: ['green', 'circle', 'dot'] },
    { emoji: '🔵', keywords: ['blue', 'circle', 'dot'] },
    { emoji: '🟣', keywords: ['purple', 'circle', 'dot'] },
    { emoji: '⚫', keywords: ['black', 'circle', 'dot'] },
    { emoji: '⚪', keywords: ['white', 'circle', 'dot'] },
    { emoji: '🔶', keywords: ['diamond', 'orange', 'shape'] },
    { emoji: '🔷', keywords: ['diamond', 'blue', 'shape'] },
  ],
  'Nature': [
    { emoji: '☀️', keywords: ['sun', 'sunny', 'weather', 'hot', 'bright'] },
    { emoji: '🌤️', keywords: ['sun', 'cloud', 'weather', 'partly'] },
    { emoji: '⛅', keywords: ['sun', 'cloud', 'weather'] },
    { emoji: '🌥️', keywords: ['cloud', 'sun', 'weather'] },
    { emoji: '☁️', keywords: ['cloud', 'weather', 'cloudy'] },
    { emoji: '🌦️', keywords: ['rain', 'sun', 'weather'] },
    { emoji: '🌧️', keywords: ['rain', 'cloud', 'weather', 'rainy'] },
    { emoji: '⛈️', keywords: ['storm', 'thunder', 'lightning', 'weather'] },
    { emoji: '🌩️', keywords: ['lightning', 'cloud', 'thunder', 'weather'] },
    { emoji: '🌨️', keywords: ['snow', 'cloud', 'weather', 'cold'] },
    { emoji: '❄️', keywords: ['snowflake', 'cold', 'winter', 'snow'] },
    { emoji: '☃️', keywords: ['snowman', 'winter', 'cold', 'snow'] },
    { emoji: '⛄', keywords: ['snowman', 'winter', 'cold'] },
    { emoji: '🌬️', keywords: ['wind', 'blow', 'weather'] },
    { emoji: '💨', keywords: ['wind', 'dash', 'fast', 'blow'] },
    { emoji: '🌪️', keywords: ['tornado', 'wind', 'storm'] },
    { emoji: '🌫️', keywords: ['fog', 'weather', 'mist'] },
    { emoji: '🌈', keywords: ['rainbow', 'weather', 'colorful'] },
    { emoji: '🌊', keywords: ['wave', 'ocean', 'sea', 'water'] },
    { emoji: '💧', keywords: ['water', 'drop', 'droplet', 'tear'] },
    { emoji: '💦', keywords: ['water', 'sweat', 'drops'] },
    { emoji: '🌸', keywords: ['flower', 'cherry', 'blossom', 'spring', 'sakura'] },
    { emoji: '💮', keywords: ['flower', 'white'] },
    { emoji: '🏵️', keywords: ['rosette', 'flower'] },
    { emoji: '🌹', keywords: ['rose', 'flower', 'love', 'red'] },
    { emoji: '🥀', keywords: ['flower', 'wilted', 'sad', 'dead'] },
    { emoji: '🌺', keywords: ['hibiscus', 'flower', 'tropical'] },
    { emoji: '🌻', keywords: ['sunflower', 'flower', 'yellow', 'sun'] },
    { emoji: '🌼', keywords: ['blossom', 'flower', 'yellow'] },
    { emoji: '🌷', keywords: ['tulip', 'flower', 'spring'] },
    { emoji: '🌱', keywords: ['seedling', 'plant', 'grow', 'sprout'] },
    { emoji: '🪴', keywords: ['plant', 'potted', 'houseplant'] },
    { emoji: '🌲', keywords: ['tree', 'evergreen', 'pine', 'christmas'] },
    { emoji: '🌳', keywords: ['tree', 'deciduous', 'nature'] },
    { emoji: '🌴', keywords: ['palm', 'tree', 'tropical', 'beach'] },
    { emoji: '🌵', keywords: ['cactus', 'desert', 'plant'] },
    { emoji: '🌾', keywords: ['rice', 'wheat', 'grain', 'plant'] },
    { emoji: '🌿', keywords: ['herb', 'leaf', 'plant', 'green'] },
    { emoji: '☘️', keywords: ['shamrock', 'clover', 'ireland', 'lucky'] },
    { emoji: '🍀', keywords: ['clover', 'four leaf', 'lucky', 'luck'] },
    { emoji: '🍁', keywords: ['maple', 'leaf', 'fall', 'autumn', 'canada'] },
    { emoji: '🍂', keywords: ['leaves', 'fall', 'autumn'] },
    { emoji: '🍃', keywords: ['leaf', 'wind', 'flutter'] },
    { emoji: '🪨', keywords: ['rock', 'stone'] },
    { emoji: '🪵', keywords: ['wood', 'log', 'timber'] },
    { emoji: '🌙', keywords: ['moon', 'crescent', 'night'] },
    { emoji: '🌛', keywords: ['moon', 'first quarter', 'night'] },
    { emoji: '🌜', keywords: ['moon', 'last quarter', 'night'] },
    { emoji: '🌝', keywords: ['moon', 'full', 'face'] },
    { emoji: '🌚', keywords: ['moon', 'new', 'face'] },
    { emoji: '🌕', keywords: ['moon', 'full'] },
    { emoji: '🌖', keywords: ['moon', 'waning gibbous'] },
    { emoji: '🌗', keywords: ['moon', 'last quarter'] },
    { emoji: '🌘', keywords: ['moon', 'waning crescent'] },
    { emoji: '🌑', keywords: ['moon', 'new'] },
    { emoji: '🌒', keywords: ['moon', 'waxing crescent'] },
    { emoji: '🌓', keywords: ['moon', 'first quarter'] },
    { emoji: '🌔', keywords: ['moon', 'waxing gibbous'] },
    { emoji: '⭐', keywords: ['star', 'favorite', 'rating', 'yellow'] },
    { emoji: '🌟', keywords: ['star', 'glowing', 'sparkle'] },
    { emoji: '💫', keywords: ['dizzy', 'star', 'sparkle', 'shooting'] },
    { emoji: '✨', keywords: ['sparkles', 'shine', 'magic', 'clean', 'glitter'] },
    { emoji: '🔥', keywords: ['fire', 'hot', 'flame', 'lit', 'burn'] },
    { emoji: '🌞', keywords: ['sun', 'face', 'sunny'] },
  ],
  'Flags': [
    { emoji: '🏳️', keywords: ['flag', 'white', 'surrender'] },
    { emoji: '🏴', keywords: ['flag', 'black'] },
    { emoji: '🏴‍☠️', keywords: ['pirate', 'flag', 'skull'] },
    { emoji: '🏁', keywords: ['checkered', 'flag', 'race', 'finish'] },
    { emoji: '🚩', keywords: ['red flag', 'warning', 'triangular', 'pin', 'marker'] },
    { emoji: '🏳️‍🌈', keywords: ['rainbow', 'pride', 'lgbt', 'gay', 'flag'] },
    { emoji: '🇺🇸', keywords: ['usa', 'america', 'united states', 'flag'] },
    { emoji: '🇬🇧', keywords: ['uk', 'britain', 'england', 'flag'] },
    { emoji: '🇯🇵', keywords: ['japan', 'japanese', 'flag'] },
    { emoji: '🇰🇷', keywords: ['korea', 'korean', 'south korea', 'flag'] },
    { emoji: '🇨🇳', keywords: ['china', 'chinese', 'flag'] },
    { emoji: '🇹🇼', keywords: ['taiwan', 'flag'] },
    { emoji: '🇭🇰', keywords: ['hong kong', 'flag'] },
    { emoji: '🇸🇬', keywords: ['singapore', 'flag'] },
    { emoji: '🇹🇭', keywords: ['thailand', 'thai', 'flag'] },
    { emoji: '🇻🇳', keywords: ['vietnam', 'vietnamese', 'flag'] },
    { emoji: '🇵🇭', keywords: ['philippines', 'filipino', 'flag'] },
    { emoji: '🇮🇩', keywords: ['indonesia', 'indonesian', 'flag'] },
    { emoji: '🇲🇾', keywords: ['malaysia', 'malaysian', 'flag'] },
    { emoji: '🇩🇪', keywords: ['germany', 'german', 'flag'] },
    { emoji: '🇫🇷', keywords: ['france', 'french', 'flag'] },
    { emoji: '🇮🇹', keywords: ['italy', 'italian', 'flag'] },
    { emoji: '🇪🇸', keywords: ['spain', 'spanish', 'flag'] },
    { emoji: '🇵🇹', keywords: ['portugal', 'portuguese', 'flag'] },
    { emoji: '🇳🇱', keywords: ['netherlands', 'dutch', 'holland', 'flag'] },
    { emoji: '🇧🇪', keywords: ['belgium', 'belgian', 'flag'] },
    { emoji: '🇨🇭', keywords: ['switzerland', 'swiss', 'flag'] },
    { emoji: '🇦🇹', keywords: ['austria', 'austrian', 'flag'] },
    { emoji: '🇸🇪', keywords: ['sweden', 'swedish', 'flag'] },
    { emoji: '🇳🇴', keywords: ['norway', 'norwegian', 'flag'] },
    { emoji: '🇩🇰', keywords: ['denmark', 'danish', 'flag'] },
    { emoji: '🇫🇮', keywords: ['finland', 'finnish', 'flag'] },
    { emoji: '🇵🇱', keywords: ['poland', 'polish', 'flag'] },
    { emoji: '🇬🇷', keywords: ['greece', 'greek', 'flag'] },
    { emoji: '🇹🇷', keywords: ['turkey', 'turkish', 'flag'] },
    { emoji: '🇷🇺', keywords: ['russia', 'russian', 'flag'] },
    { emoji: '🇺🇦', keywords: ['ukraine', 'ukrainian', 'flag'] },
    { emoji: '🇮🇳', keywords: ['india', 'indian', 'flag'] },
    { emoji: '🇵🇰', keywords: ['pakistan', 'pakistani', 'flag'] },
    { emoji: '🇧🇩', keywords: ['bangladesh', 'bangladeshi', 'flag'] },
    { emoji: '🇦🇪', keywords: ['uae', 'emirates', 'dubai', 'flag'] },
    { emoji: '🇸🇦', keywords: ['saudi arabia', 'saudi', 'flag'] },
    { emoji: '🇮🇱', keywords: ['israel', 'israeli', 'flag'] },
    { emoji: '🇪🇬', keywords: ['egypt', 'egyptian', 'flag'] },
    { emoji: '🇿🇦', keywords: ['south africa', 'flag'] },
    { emoji: '🇳🇬', keywords: ['nigeria', 'nigerian', 'flag'] },
    { emoji: '🇰🇪', keywords: ['kenya', 'kenyan', 'flag'] },
    { emoji: '🇦🇺', keywords: ['australia', 'australian', 'flag'] },
    { emoji: '🇳🇿', keywords: ['new zealand', 'kiwi', 'flag'] },
    { emoji: '🇨🇦', keywords: ['canada', 'canadian', 'flag'] },
    { emoji: '🇲🇽', keywords: ['mexico', 'mexican', 'flag'] },
    { emoji: '🇧🇷', keywords: ['brazil', 'brazilian', 'flag'] },
    { emoji: '🇦🇷', keywords: ['argentina', 'argentinian', 'flag'] },
    { emoji: '🇨🇱', keywords: ['chile', 'chilean', 'flag'] },
    { emoji: '🇨🇴', keywords: ['colombia', 'colombian', 'flag'] },
    { emoji: '🇵🇪', keywords: ['peru', 'peruvian', 'flag'] },
    { emoji: '🇪🇺', keywords: ['eu', 'european union', 'europe', 'flag'] },
  ]
};

// Emoji Picker component for toolbar
function EmojiPicker({ 
  editor
}: { 
  editor: ReturnType<typeof useEditor>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Smileys');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const insertEmoji = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
  };

  // Get all emojis for search (flatten all categories)
  const allEmojis = Object.values(EMOJI_DATA).flat();
  
  // Filter emojis based on search query (match against keywords)
  const filteredEmojis = searchQuery 
    ? allEmojis.filter(item => 
        item.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ) || item.emoji.includes(searchQuery)
      )
    : EMOJI_DATA[activeCategory as keyof typeof EMOJI_DATA] || [];

  const categories = Object.keys(EMOJI_DATA);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Emoji"
        className="p-1.5 rounded transition-colors flex items-center gap-0.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <Smile size={16} />
        <ChevronDown size={12} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-[320px] overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-slate-200 dark:border-gray-700">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emoji..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Category tabs (hidden when searching) */}
          {!searchQuery && (
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-gray-700 px-2 py-2 gap-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeCategory === category
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
          
          {/* Emoji grid */}
          <div className="p-2 max-h-[200px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((item, index) => (
                <button
                  key={`${item.emoji}-${index}`}
                  type="button"
                  onClick={() => {
                    insertEmoji(item.emoji);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title={item.keywords.slice(0, 3).join(', ')}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
            {filteredEmojis.length === 0 && (
              <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
                No emoji found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Image Dropdown component for toolbar - allows upload or URL input
function ImageDropdown({ 
  editor
}: { 
  editor: ReturnType<typeof useEditor>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowUrlInput(false);
        setImageUrl('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setIsOpen(false);
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim() && editor) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl('');
      setShowUrlInput(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    }
    if (e.key === 'Escape') {
      setShowUrlInput(false);
      setImageUrl('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Image"
        className={`p-1.5 rounded transition-colors flex items-center gap-0.5 ${
          editor?.isActive('image')
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <ImageIcon size={16} />
        <ChevronDown size={12} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden">
          {!showUrlInput ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <Upload size={14} />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="w-full px-3 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <Link size={14} />
                From URL
              </button>
            </>
          ) : (
            <div className="p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Link size={12} />
                Image URL
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/image.jpg"
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setImageUrl('');
                  }}
                  className="flex-1 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl.trim()}
                  className="flex-1 px-2 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert
                </button>
              </div>
            </div>
          )}
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
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;
        
        const text = clipboardData.getData('text/plain');
        const html = clipboardData.getData('text/html');
        
        // If there's no HTML content and the text looks like Markdown, convert it
        if (text && !html && looksLikeMarkdown(text)) {
          event.preventDefault();
          const convertedHtml = markdownToHtml(text);
          editor?.commands.insertContent(convertedHtml);
          return true;
        }
        
        return false;
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
          onClick={() => {
            // If already in blockquote, just toggle it off (don't affect list state)
            if (editor.isActive('blockquote')) {
              editor.chain().focus().toggleBlockquote().run();
            } 
            // If in a list but not in blockquote, exit list first then add blockquote
            else if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
              editor.chain().focus().liftListItem('listItem').toggleBlockquote().run();
            } 
            // Normal case: just toggle blockquote
            else {
              editor.chain().focus().toggleBlockquote().run();
            }
          }}
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
        
        <ImageDropdown editor={editor} />
        
        <EmojiPicker editor={editor} />
        
        <div className="w-px h-5 bg-slate-200 dark:bg-gray-600 mx-1" />
        
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
        
        /* Remove default quotes from blockquote */
        .ProseMirror blockquote::before,
        .ProseMirror blockquote::after,
        .ProseMirror blockquote p::before,
        .ProseMirror blockquote p::after {
          content: none !important;
        }
        
        /* Dark mode strong/bold text */
        .dark .ProseMirror strong {
          color: #f3f4f6;
          font-weight: 700;
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