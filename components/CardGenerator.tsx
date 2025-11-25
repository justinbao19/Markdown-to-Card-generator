"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { toPng } from "html-to-image";
import {
  Download,
  Sparkles,
  Monitor,
  Minus,
  Plus,
  Type,
  MoveHorizontal,
  Palette,
  Layout,
  GripVertical,
  CreditCard,
  Info,
  X,
  Check,
  Lock,
  TerminalSquare,
  FileText,
  ChevronRight,
  Circle,
  Command,
  Apple,
  Zap,
  Heart,
  Star,
  Box,
  Layers,
  Code,
  Cloud,
  Cpu,
  Globe,
  Hash,
  Feather,
  Rocket,
  Smile,
  Ghost,
  Flame,
  Droplets,
  AlignLeft,
  RotateCw,
  Reply,
  CornerUpLeft,
  PenLine,
  PilcrowSquare
} from "lucide-react";
import dynamic from "next/dynamic";
import { common, createLowlight } from "lowlight";

// Create lowlight instance for syntax highlighting in card preview
const lowlight = createLowlight(common);

// Dynamically import Novel Editor to avoid SSR issues
const NovelEditor = dynamic(() => import("./NovelEditor"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading editor...</div>
});
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Apply syntax highlighting to code blocks in HTML content
function highlightCodeBlocks(html: string): string {
  if (!html) return html;
  
  // Match <pre><code class="language-xxx">...</code></pre> patterns
  const codeBlockRegex = /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/gi;
  
  return html.replace(codeBlockRegex, (match, language, code) => {
    const lang = language || 'plaintext';
    
    // Decode HTML entities
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    try {
      // Apply syntax highlighting
      const highlighted = lowlight.highlight(lang, decodedCode);
      
      // Convert lowlight result to HTML string
      const toHtml = (nodes: any[]): string => {
        return nodes.map((node: any) => {
          if (node.type === 'text') {
            return node.value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
          }
          if (node.type === 'element') {
            const className = node.properties?.className?.join(' ') || '';
            const children = toHtml(node.children || []);
            return `<span class="${className}">${children}</span>`;
          }
          return '';
        }).join('');
      };
      
      const result = toHtml(highlighted.children || []);
      return `<pre><code class="language-${lang} hljs">${result}</code></pre>`;
    } catch (e) {
      // If highlighting fails, return original with escaped code
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    }
  });
}

// Convert markdown to HTML for Visual mode
function markdownToHtml(markdown: string): string {
  if (!markdown) return "<p></p>";
  if (markdown.trim().startsWith("<")) return markdown;
  
  let html = markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.*$)/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  
  const lines = html.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || 
        trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('<p')) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }
  
  return result.join('') || "<p></p>";
}

// Convert HTML back to Markdown for Markdown mode
function htmlToMarkdown(html: string): string {
  if (!html) return "";
  // If it doesn't look like HTML, return as-is
  if (!html.trim().startsWith("<")) return html;
  
  // First, clean up empty list items that Tiptap adds
  let cleanHtml = html
    // Remove empty li with empty p inside
    .replace(/<li[^>]*>\s*<p[^>]*>\s*<\/p>\s*<\/li>/gi, '')
    // Remove empty li tags
    .replace(/<li[^>]*>\s*<\/li>/gi, '')
    // Remove li with only whitespace
    .replace(/<li[^>]*>[\s\n\r]*<\/li>/gi, '');
  
  let markdown = cleanHtml
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Blockquotes
    .replace(/<blockquote[^>]*><p[^>]*>(.*?)<\/p><\/blockquote>/gi, '> $1\n\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    // Unordered Lists
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
      const listItems: string[] = [];
      // Match each li and extract content
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let match;
      while ((match = liRegex.exec(content)) !== null) {
        let itemContent = match[1]
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1')
          .replace(/<[^>]+>/g, '')
          .trim();
        if (itemContent) {
          listItems.push(`* ${itemContent}`);
        }
      }
      return listItems.length > 0 ? listItems.join('\n') + '\n\n' : '';
    })
    // Ordered Lists
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
      const listItems: string[] = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let match;
      let index = 0;
      while ((match = liRegex.exec(content)) !== null) {
        let itemContent = match[1]
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1')
          .replace(/<[^>]+>/g, '')
          .trim();
        if (itemContent) {
          listItems.push(`${++index}. ${itemContent}`);
        }
      }
      return listItems.length > 0 ? listItems.join('\n') + '\n\n' : '';
    })
    // Code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining tags
    .replace(/<[^>]+>/g, '')
    // Clean up empty bullet points that might have slipped through
    .replace(/^\*\s*$/gm, '')
    .replace(/^\d+\.\s*$/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return markdown;
}

// --- Constants ---
const SYMBOLS = {
  sparkles: { icon: Sparkles },
  zap: { icon: Zap },
  star: { icon: Star },
  heart: { icon: Heart },
  globe: { icon: Globe },
  code: { icon: Code },
  feather: { icon: Feather },
  rocket: { icon: Rocket },
  smile: { icon: Smile },
  ghost: { icon: Ghost },
  flame: { icon: Flame },
  droplets: { icon: Droplets },
  command: { icon: Command },
  apple: { icon: Apple },
  circle: { icon: Circle },
  box: { icon: Box },
  layers: { icon: Layers },
  cloud: { icon: Cloud },
  cpu: { icon: Cpu },
  hash: { icon: Hash }
};

const DECORATIONS = {
  none: { name: "None" },
  macos: { name: "macOS" },
  mail: { name: "Filo Mail" },
  browser: { name: "Browser" },
  terminal: { name: "Terminal" },
  notion: { name: "Notion" }
};

const PATTERNS = {
  dots: { 
    name: "Dots",
    css: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
    size: "20px 20px"
  },
  grid: { 
    name: "Grid",
    css: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
    size: "24px 24px"
  },
  cross: { 
    name: "Cross",
    css: "radial-gradient(circle, transparent 14px, #e2e8f0 14px, #e2e8f0 15px, transparent 15px), radial-gradient(circle, #cbd5e1 2px, transparent 2px)",
    size: "32px 32px"
  },
  lines: { 
    name: "Lines",
    css: "linear-gradient(#e2e8f0 1px, transparent 1px)",
    size: "100% 20px"
  },
  none: { 
    name: "None",
    css: "none",
    size: "0"
  }
};

const THEMES = {
  minimal: {
    name: "Notion Light",
    bg: "bg-[#F3F4F6]",
    cssBg: "#F3F4F6",
    card: "bg-white border border-gray-200 shadow-xl text-slate-900",
    text: "prose-slate",
    preview: "bg-white"
  },
  obsidian: {
    name: "Dev Dark",
    bg: "bg-[#09090B]",
    cssBg: "#09090B",
    card: "bg-[#18181B] border border-white/10 shadow-2xl shadow-black/80 text-slate-200 ring-1 ring-white/5",
    text: "prose-invert prose-pre:bg-[#27272A]",
    preview: "bg-[#18181B]"
  },
  aurora: {
    name: "Nebula Glass",
    bg: "bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50",
    cssBg: "linear-gradient(to bottom right, #faf5ff, #fdf4ff)",
    card: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border border-violet-100 shadow-xl shadow-purple-200/20 text-slate-800",
    text: "prose-slate prose-headings:text-violet-700 prose-a:text-purple-600",
    preview: "bg-gradient-to-br from-violet-200 to-fuchsia-200"
  },
  bamboo: {
    name: "Bamboo Forest",
    bg: "bg-stone-50",
    cssBg: "#fafaf9",
    card: "bg-[#F0FDF4] border-2 border-green-300 shadow-2xl shadow-green-600/25 text-green-900",
    text: "prose-stone prose-headings:text-green-800",
    preview: "bg-[#F0FDF4]"
  },
  sunset: {
    name: "Sunset Vibes",
    bg: "bg-slate-50",
    cssBg: "#f8fafc",
    card: "bg-gradient-to-br from-orange-50 to-indigo-50 border border-orange-100/50 shadow-lg text-indigo-950",
    text: "prose-slate prose-headings:text-indigo-900",
    preview: "bg-gradient-to-br from-orange-200 to-indigo-200"
  },
  midnight: {
    name: "Midnight Blue",
    bg: "bg-[#020617]",
    cssBg: "#020617",
    card: "bg-[#1E293B] border border-blue-500/30 shadow-2xl shadow-blue-900/40 text-blue-100 ring-1 ring-blue-400/10",
    text: "prose-invert prose-headings:text-blue-200 prose-p:text-slate-300",
    preview: "bg-[#1E293B]"
  },
  skyblue: {
    name: "Filo Blue",
    bg: "bg-[#F0F9FF]",
    cssBg: "#F0F9FF",
    card: "bg-white border border-[#CCE7FB] shadow-xl shadow-blue-100/50 text-slate-800",
    text: "prose-slate prose-headings:text-[#22A0FB] prose-a:text-[#22A0FB]",
    preview: "bg-[#9CD5FF]"
  },
  deepocean: {
    name: "Deep Ocean",
    bg: "bg-slate-100",
    cssBg: "#f1f5f9",
    card: "bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC] border border-sky-200/60 shadow-xl shadow-sky-200/30 text-slate-700",
    text: "prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-sky-600 prose-blockquote:text-slate-500",
    preview: "bg-gradient-to-br from-[#E0F2FE] to-[#7DD3FC]"
  },
  sunsetbloom: {
    name: "Sunset Bloom",
    bg: "bg-orange-50",
    cssBg: "#fff7ed",
    card: "bg-gradient-to-br from-rose-100 via-orange-100 to-amber-100 border border-rose-200 shadow-xl shadow-rose-200/20 text-rose-950",
    text: "prose-slate prose-headings:text-rose-600 prose-a:text-orange-500",
    preview: "bg-gradient-to-br from-rose-300 to-orange-300"
  }
};

const FONTS = {
  sans: { name: "Sans", class: "font-sans", style: {} },
  serif: { name: "Serif", class: "font-serif", style: {} },
  mono: { name: "Mono", class: "font-mono", style: {} },
  georgia: { name: "Georgia", class: "", style: { fontFamily: "Georgia, serif" } },
  palatino: { name: "Palatino", class: "", style: { fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" } },
  garamond: { name: "Garamond", class: "", style: { fontFamily: "Garamond, 'Times New Roman', serif" } }
};

const SIZES = {
  sm: { name: "Small", class: "prose-sm" },
  base: { name: "Medium", class: "prose-base" },
  lg: { name: "Large", class: "prose-lg" },
  xl: { name: "X-Large", class: "prose-xl" }
};

const DEFAULT_MARKDOWN = `# The Art of Code

**Simplicity** is the ultimate sophistication.

> "Code is like humor. When you have to explain it, it’s bad."
> — Cory House

*   Clean Architecture
*   Readable Syntax
*   Efficient Logic

Keep it simple, keep it elegant.`;

// --- Main Component ---
export default function CardGenerator() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // State
  const [content, setContent] = useState(DEFAULT_MARKDOWN);
  const [editorMode, setEditorMode] = useState<'markdown' | 'wysiwyg'>('markdown');
  const [theme, setTheme] = useState<keyof typeof THEMES>('minimal');
  const [font, setFont] = useState<keyof typeof FONTS>('sans');
  const [fontSize, setFontSize] = useState<keyof typeof SIZES>('lg');
  const [decoration, setDecoration] = useState<keyof typeof DECORATIONS>('macos');
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>('dots');
  const [scale, setScale] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Export resolution options
  const EXPORT_RESOLUTIONS = [
    { name: '1x', scale: 1, label: 'Standard', size: '~520×auto' },
    { name: '2x', scale: 2, label: 'Retina', size: '~1040×auto' },
    { name: '3x', scale: 3, label: 'High DPI', size: '~1560×auto' },
    { name: '4x', scale: 4, label: 'Ultra HD', size: '~2080×auto' },
  ];

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [footerText, setFooterText] = useState("FlipMark");
  const [footerIcon, setFooterIcon] = useState<keyof typeof SYMBOLS>('sparkles');
  const [isMobileEditing, setIsMobileEditing] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [editorHeight, setEditorHeight] = useState(55); // percentage
  const [isResizingEditor, setIsResizingEditor] = useState(false);

  // Mobile Tab State
  const [mobileActiveTab, setMobileActiveTab] = useState<'theme' | 'font' | 'style'>('theme');

  // Sidebar Drag Handlers
  const startResizing = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsDragging(false);
    setIsResizingEditor(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isDragging) {
      const newWidth = mouseMoveEvent.clientX;
      const minWidth = 360;
      const maxWidth = Math.min(window.innerWidth * 0.5, 800);
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
    if (isResizingEditor) {
      const sidebar = document.getElementById('sidebar-panel');
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const headerHeight = 56; // h-14 = 56px
        const availableHeight = sidebarRect.height - headerHeight;
        const mouseY = mouseMoveEvent.clientY - sidebarRect.top - headerHeight;
        const percentage = (mouseY / availableHeight) * 100;
        
        // Calculate min/max based on pixel requirements
        const minEditorPx = 380; // Enough to show Editor header + full default markdown text (~12 lines)
        const minControlsPx = 480; // Enough to show Theme (9 blocks) + Typography (Font + Size)
        
        const minEditorPercent = (minEditorPx / availableHeight) * 100;
        const maxEditorPercent = 100 - (minControlsPx / availableHeight) * 100;
        
        const clampedPercentage = Math.min(Math.max(percentage, minEditorPercent), maxEditorPercent);
        setEditorHeight(clampedPercentage);
      }
    }
  }, [isDragging, isResizingEditor]);

  // Editor Resizer Handlers
  const startResizingEditor = useCallback(() => {
    setIsResizingEditor(true);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Set initial scale based on screen size
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setScale(70); // Mobile: 70% for better fit
    } else {
      setScale(100); // Desktop: 100% (full size)
    }
  }, []);

  // Helper: Get max scale based on screen size (Mobile: 100%, Desktop: 150%)
  const getMaxScale = () => {
    return typeof window !== 'undefined' && window.innerWidth < 1024 ? 100 : 150;
  };

  // Export with background (like macOS screenshot)
  const handleExport = useCallback(async (pixelRatio: number = 2) => {
    if (cardRef.current === null) return;
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      // Create a temporary container with background
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        width: 700px;
        padding: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${THEMES[theme].cssBg};
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
      `;
      
      // Add pattern overlay (if not 'none')
      if (pattern !== 'none') {
        const patternOverlay = document.createElement('div');
        patternOverlay.style.cssText = `
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: ${PATTERNS[pattern].css};
          background-size: ${PATTERNS[pattern].size};
        `;
        exportContainer.appendChild(patternOverlay);
      }
      
      // Clone the actual card
      const cardClone = cardRef.current.cloneNode(true) as HTMLElement;
      cardClone.style.position = 'relative';
      exportContainer.appendChild(cardClone);
      
      // Add to document temporarily
      document.body.appendChild(exportContainer);
      
      // Wait a frame for styles to apply
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Export
      const dataUrl = await toPng(exportContainer, { 
        cacheBust: true, 
        pixelRatio: pixelRatio,
      });
      
      // Cleanup
      document.body.removeChild(exportContainer);
      
      // Download
      const link = document.createElement('a');
      link.download = `flipmark-${theme}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export', err);
    } finally {
      setIsExporting(false);
    }
  }, [cardRef, theme, pattern]);

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-white text-slate-900 font-sans",
        isDragging && "cursor-col-resize select-none",
        isResizingEditor && "cursor-row-resize select-none"
      )}
    >

      {/* --- MOBILE INFO MODAL --- */}
      {showMobileInfo && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setShowMobileInfo(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">Markdown Guide</div>
              <button
                onClick={() => setShowMobileInfo(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono text-xs">**Bold**</code>
                <span className="font-bold text-slate-600">Bold Text</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono text-xs">*Italic*</code>
                <span className="italic text-slate-600">Italic Text</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono text-xs"># Heading</code>
                <span className="font-bold text-slate-800">Heading 1</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono text-xs">&gt; Quote</code>
                <span className="border-l-2 border-indigo-400 pl-2 text-slate-500 italic">Quote</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono text-xs">- List</code>
                <div className="flex items-center gap-1 text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <span>List Item</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono text-xs">`Code`</code>
                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">Code</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-slate-400 leading-relaxed">
              Tips: Use <code className="font-mono text-slate-500 text-xs">---</code> for divider.
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE FULLSCREEN EDITOR OVERLAY --- */}
      {isMobileEditing && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-200 lg:hidden">
          {/* Header with mode toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => {
                  if (editorMode === 'wysiwyg' && content.trim().startsWith('<')) {
                    setContent(htmlToMarkdown(content));
                  }
                  setEditorMode('markdown');
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  editorMode === 'markdown' 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500"
                )}
              >
                <Code size={12} />
                Markdown
              </button>
              <button
                onClick={() => {
                  if (editorMode === 'markdown' && !content.trim().startsWith('<')) {
                    setContent(markdownToHtml(content));
                  }
                  setEditorMode('wysiwyg');
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  editorMode === 'wysiwyg' 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500"
                )}
              >
                <PilcrowSquare size={12} />
                Visual
              </button>
            </div>
            
            <button
              onClick={() => setIsMobileEditing(false)}
              className="text-indigo-600 font-semibold text-sm flex items-center gap-1 px-3 py-1.5 bg-indigo-50 rounded-full"
            >
              <Check size={14} />
              Done
            </button>
          </div>
          
          {/* Editor Content */}
          {editorMode === 'markdown' ? (
            <>
              <textarea
                className="flex-1 w-full p-5 resize-none outline-none font-mono text-base text-slate-700 leading-relaxed"
                placeholder="Type markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />
              <div className="px-4 py-3 bg-slate-50 border-t border-gray-100 text-xs text-slate-400 flex gap-4 font-mono overflow-x-auto">
                <span>**Bold**</span>
                <span>*Italic*</span>
                <span># Header</span>
                <span>&gt; Quote</span>
                <span>`Code`</span>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <NovelEditor
                initialContent={content}
                onContentChange={(html) => setContent(html)}
                className="h-full"
              />
            </div>
          )}
        </div>
      )}

      {/* --- LEFT PANEL: EDITOR & CONTROLS (Desktop Sidebar / Mobile Bottom Sheet) --- */}
      <div
        id="sidebar-panel"
        style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
        className={cn(
          "flex-shrink-0 flex flex-col border-r border-gray-200 bg-white z-20 shadow-lg relative group/sidebar transition-all",
          // Desktop: Sidebar with dynamic width, Mobile: Full width bottom panel
          "w-full lg:w-[var(--sidebar-width)]",
          "h-[40vh] lg:h-full order-2 lg:order-1" // Mobile: 40% height, Desktop: Full height
        )}
      >

        {/* Header (Desktop Only) */}
        <div className="hidden lg:flex h-14 px-4 border-b border-gray-100 items-center gap-3 bg-white shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">FlipMark</span>
          </div>

          {/* Info Tooltip */}
          <div className="relative group/info flex-shrink-0">
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <Info size={16} />
            </button>

            {/* Tooltip Content */}
            <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl p-5 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 translate-y-2 group-hover/info:translate-y-0 z-50 pointer-events-none group-hover/info:pointer-events-auto">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                Markdown Guide
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">**Bold**</code>
                  <span className="font-bold text-slate-600">Bold Text</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">*Italic*</code>
                  <span className="italic text-slate-600">Italic Text</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono"># Heading</code>
                  <span className="font-bold text-slate-800 underline decoration-2 decoration-indigo-200">Heading 1</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">&gt; Quote</code>
                  <span className="border-l-2 border-indigo-400 pl-2 text-slate-500 italic">Quote</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">- List</code>
                  <div className="flex items-center gap-1 text-slate-600">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span>List Item</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">`Code`</code>
                  <span className="bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-100">Code</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-slate-400 leading-relaxed">
                Tips: Use <code className="font-mono text-slate-500">---</code> for a divider line.
              </div>
            </div>
          </div>
        </div>

        {/* Editor (Desktop Only - Mobile uses Overlay) */}
        <div 
          className="hidden lg:flex flex-col min-h-0 overflow-hidden"
          style={{ height: `${editorHeight}%` }}
        >
          {/* Editor Header with Mode Toggle */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <PenLine size={12} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Editor</span>
            </div>
            {/* Mode Toggle */}
            <div className="flex bg-gray-200/50 p-0.5 rounded-md">
              <button
                onClick={() => {
                  // Convert HTML back to Markdown when switching to Markdown mode
                  if (editorMode === 'wysiwyg' && content.trim().startsWith('<')) {
                    setContent(htmlToMarkdown(content));
                  }
                  setEditorMode('markdown');
                }}
                className={cn(
                  "px-2 py-1 text-[10px] font-medium rounded transition-all flex items-center gap-1",
                  editorMode === 'markdown' 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
                title="Markdown mode"
              >
                <Code size={10} />
                Markdown
              </button>
              <button
                onClick={() => {
                  // Convert markdown to HTML when switching to Visual mode
                  if (editorMode === 'markdown' && !content.trim().startsWith('<')) {
                    setContent(markdownToHtml(content));
                  }
                  setEditorMode('wysiwyg');
                }}
                className={cn(
                  "px-2 py-1 text-[10px] font-medium rounded transition-all flex items-center gap-1",
                  editorMode === 'wysiwyg' 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
                title="Visual editor (Notion-style)"
              >
                <PilcrowSquare size={10} />
                Visual
              </button>
            </div>
          </div>
          
          {/* Markdown Editor */}
          {editorMode === 'markdown' && (
            <textarea
              className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-slate-600 leading-relaxed bg-transparent selection:bg-indigo-100"
              placeholder="Type markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
            />
          )}
          
          {/* WYSIWYG Editor (Novel) */}
          {editorMode === 'wysiwyg' && (
            <div className="flex-1 overflow-y-auto">
              <NovelEditor
                initialContent={content}
                onContentChange={(html) => setContent(html)}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Draggable Resizer (Desktop Only) */}
        <div
          className="hidden lg:flex h-2 bg-slate-100 hover:bg-indigo-100 cursor-row-resize items-center justify-center border-y border-gray-200 transition-colors group/editor-resizer shrink-0"
          onMouseDown={startResizingEditor}
        >
          <div className="w-12 h-1 bg-slate-300 rounded-full group-hover/editor-resizer:bg-indigo-400 transition-colors" />
        </div>

        {/* Style Controls (Always Visible - Bottom Half on Desktop, Full Panel on Mobile) */}
        <div 
          className={cn(
            "bg-slate-50 flex flex-col overflow-y-auto",
            "h-full lg:flex-1" // Mobile takes full height, Desktop takes remaining space
          )}
        >

          {/* --- MOBILE TABS HEADER --- */}
          <div className="lg:hidden flex items-center border-b border-gray-200 bg-white shrink-0">
            {(['theme', 'font', 'style'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative",
                  mobileActiveTab === tab ? "text-indigo-600 bg-indigo-50/50" : "text-slate-400"
                )}
              >
                {tab}
                {mobileActiveTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-6 pb-20 lg:pb-5"> {/* Extra padding bottom for mobile overlay controls */}

            {/* Theme Selector (Visible on Desktop OR Mobile Theme Tab) */}
            <div className={cn("space-y-3", "lg:block", mobileActiveTab === 'theme' ? "block" : "hidden")}>
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"> {/* Hidden title on mobile */}
                <Palette size={12} /> Theme
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,100px)] gap-2 justify-between">
                {(Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES['minimal']][]).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-200 flex-shrink-0",
                      theme === key
                        ? "bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-full h-8 rounded-md shadow-inner", t.preview)} />
                    <span className="text-[10px] font-medium text-slate-600">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Controls (Visible on Desktop OR Mobile Font Tab) */}
            <div className={cn("space-y-4", "lg:block lg:space-y-3", mobileActiveTab === 'font' ? "block" : "hidden")}>
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"> {/* Hidden title on mobile */}
                <Type size={12} /> Typography
              </div>

              {/* Mobile: Stack vertically | Desktop: Stack vertically */}
              <div className="flex flex-col gap-4">

                {/* Font Family - Grid layout for 6 fonts */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] text-slate-400 font-medium">Font Family</label>
                  <div className="grid grid-cols-3 gap-1 bg-gray-200/50 p-1 rounded-lg w-full">
                    {(Object.keys(FONTS) as Array<keyof typeof FONTS>).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFont(f)}
                        className={cn(
                          "py-2 lg:py-1.5 text-xs font-medium rounded-md transition-all",
                          font === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {FONTS[f].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] text-slate-400 font-medium">Size</label>
                  <div className="flex bg-gray-200/50 p-1 rounded-lg w-full">
                    {(Object.keys(SIZES) as Array<keyof typeof SIZES>).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={cn(
                          "flex-1 py-2 lg:py-1.5 text-xs font-medium rounded-md transition-all",
                          fontSize === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {s === 'sm' ? 'S' : s === 'base' ? 'M' : s === 'lg' ? 'L' : 'XL'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Text & Window Controls (Visible on Desktop OR Mobile Style Tab) */}
            <div className={cn("space-y-3", "lg:block", mobileActiveTab === 'style' ? "block" : "hidden")}>
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"> {/* Hidden title on mobile */}
                <Layout size={12} /> Appearance
              </div>

                {/* Footer Text Input */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Footer Text</span>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200">
                     <div className="p-1.5 bg-gray-100 text-slate-500 rounded-md">
                        <CreditCard size={14} />
                     </div>
                     <input 
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        className="flex-1 text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
                        placeholder="Footer text..."
                     />
                  </div>
                </div>

                {/* Symbol Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Brand Symbol</span>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-gray-200">
                    {(Object.keys(SYMBOLS) as Array<keyof typeof SYMBOLS>).map((s) => {
                      const IconComponent = SYMBOLS[s].icon;
                      return (
                        <button 
                          key={s}
                          onClick={() => setFooterIcon(s)}
                          className={cn(
                            "p-1.5 rounded-md transition-all",
                            footerIcon === s 
                              ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                              : "text-slate-400 hover:bg-gray-50 hover:text-slate-600"
                          )}
                          title={s}
                        >
                          <IconComponent size={14} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Window Decoration Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Window Style</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(DECORATIONS) as Array<keyof typeof DECORATIONS>).map((d) => (
                      <button 
                        key={d}
                        onClick={() => setDecoration(d)}
                        className={cn(
                          "py-1.5 text-[10px] font-medium rounded-md transition-all border",
                          decoration === d 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                            : "bg-white border-gray-200 text-slate-600 hover:border-gray-300"
                        )}
                      >
                        {DECORATIONS[d].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas Pattern Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Canvas Pattern</span>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(PATTERNS) as Array<keyof typeof PATTERNS>).map((p) => {
                      // Smaller preview sizes for better visibility in buttons
                      const previewSizes: Record<string, string> = {
                        dots: "8px 8px",
                        grid: "10px 10px",
                        cross: "14px 14px",
                        lines: "100% 8px",
                        none: "0"
                      };
                      return (
                        <button 
                          key={p}
                          onClick={() => setPattern(p)}
                          className={cn(
                            "relative h-12 rounded-lg transition-all border-2 overflow-hidden group/pattern",
                            pattern === p 
                              ? "border-indigo-400 ring-2 ring-indigo-200" 
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {/* Pattern Preview Background */}
                          <div 
                            className="absolute inset-0 bg-slate-50"
                            style={{
                              backgroundImage: PATTERNS[p].css,
                              backgroundSize: previewSizes[p] || PATTERNS[p].size,
                            }}
                          />
                          {/* Label Overlay */}
                          <div className={cn(
                            "absolute inset-x-0 bottom-0 py-0.5 text-[9px] font-medium backdrop-blur-sm transition-colors",
                            pattern === p 
                              ? "bg-indigo-500/90 text-white" 
                              : "bg-white/80 text-slate-600 group-hover/pattern:bg-white/90"
                          )}>
                            {PATTERNS[p].name}
                          </div>
                          {/* Selected Checkmark */}
                          {pattern === p && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full flex items-center justify-center">
                              <Check size={8} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
            </div>

          </div>
        </div>

        {/* Resizer Handle (Desktop Only) */}
        <div
          className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-colors z-50 group/resizer"
          onMouseDown={startResizing}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover/resizer:opacity-100 transition-opacity pointer-events-none">
            <GripVertical size={12} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: PREVIEW --- */}
      <div className={cn(
        "relative flex flex-col overflow-hidden transition-colors duration-500 order-1 lg:order-2",
        "flex-1", // Takes remaining space (60% on mobile)
        THEMES[theme].bg
      )}>

        {/* Pattern Background */}
        {pattern !== 'none' && (
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: PATTERNS[pattern].css,
              backgroundSize: PATTERNS[pattern].size
            }}>
          </div>
        )}

        {/* Mobile Info Icon (Fixed Top Right) */}
        <button
          className="lg:hidden fixed top-4 right-4 z-40 p-3 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
          onClick={() => setShowMobileInfo(true)}
        >
          <Info size={20} />
        </button>

        {/* Scrollable Canvas Area */}
        <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div
            className="min-h-full flex flex-col items-center px-4 sm:px-20 py-20"
          >

            <div
              className="transition-transform duration-200 ease-out origin-center will-change-transform my-auto"
              style={{ transform: `scale(${scale / 100})` }}
              onClick={() => {
                // Only trigger edit mode on mobile if click target is within card area
                if (window.innerWidth < 1024) {
                  setIsMobileEditing(true);
                }
              }}
            >
              {/* The Card Component */}
              <div 
                ref={cardRef}
                className={cn(
                  "w-[520px] min-h-[300px] rounded-xl p-12 flex flex-col relative transition-all duration-500 cursor-pointer lg:cursor-default", // Pointer on mobile to indicate editable
                  THEMES[theme].card,
                  FONTS[font].class
                )}
                style={FONTS[font].style}
              >
                {/* Window Controls Header */}
                {decoration !== 'none' && (
                  <div className="flex items-center gap-4 mb-8 select-none h-6">
                    {/* macOS Style */}
                    {decoration === 'macos' && (
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
                        <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm" />
                        <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
                      </div>
                    )}

                    {/* Filo Mail Style */}
                    {decoration === 'mail' && (
                      <div className="flex-1 flex items-center justify-between border-b border-black/10 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center border border-black/5 shrink-0">
                            {/* Try to load Filo Icon, fallback to text if missing */}
                            <img 
                              src="/assets/filo-icon.svg" 
                              alt="Filo"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <span className="hidden text-indigo-600 font-bold text-xs">FM</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold opacity-90 leading-tight truncate">Filo Mail</span>
                              <span className="text-[8px] text-indigo-600 bg-indigo-50 px-1.5 rounded-full font-medium">Inbox</span>
                            </div>
                            <span className="text-[9px] opacity-50 leading-tight truncate">To: You &lt;me@filomail.com&gt;</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-black/40">
                            <CornerUpLeft size={12} className="hover:text-black/60 transition-colors" />
                            <Star size={12} className="hover:text-yellow-400 transition-colors" />
                          </div>
                          <div className="px-2 py-0.5 bg-black/5 rounded text-[8px] font-mono opacity-50 hidden sm:block">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Browser Style (Safari) */}
                    {decoration === 'browser' && (
                      <div className="flex-1 flex flex-col gap-3">
                        {/* Optional: Window Dots Row if we want full browser look, or just the address bar */}
                        {/* Let's put address bar directly as the header content */}
                        <div className="flex items-center gap-3 w-full">
                           <div className="flex gap-1.5 shrink-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                           </div>
                           {/* Safari Address Bar */}
                           <div className="flex-1 bg-current/5 rounded-lg flex items-center justify-between px-3 py-1 h-7 border border-black/5 shadow-sm">
                              <AlignLeft size={12} className="opacity-50" />
                              <div className="flex items-center gap-1.5 opacity-90 text-current">
                                <Lock size={10} className="opacity-40" />
                                <span className="text-[11px] font-semibold tracking-tight -mb-0.5">filomail.com</span>
                              </div>
                              <RotateCw size={12} className="opacity-50" />
                           </div>
                           <div className="w-10" /> {/* Spacer to balance dots */}
                        </div>
                      </div>
                    )}

                    {/* Terminal Style */}
                    {decoration === 'terminal' && (
                      <div className="flex-1 flex items-center justify-between bg-black/80 rounded-lg px-3 py-1.5 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-500/80" />
                          <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                          <div className="w-2 h-2 rounded-full bg-green-500/80" />
                        </div>
                        <div className="flex items-center gap-2 opacity-80 font-mono text-[10px] text-white">
                          <TerminalSquare size={10} />
                          <span>zsh</span>
                        </div>
                      </div>
                    )}

                    {/* Notion Style */}
                    {decoration === 'notion' && (
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <div className="flex items-center gap-1">
                          <FileText size={14} />
                          <span className="font-medium">Workspace</span>
                        </div>
                        <ChevronRight size={12} className="opacity-50" />
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Page</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={cn(
                  "prose leading-relaxed max-w-none pointer-events-none lg:pointer-events-auto", // Disable text selection on mobile preview to prevent keyboard
                  // Base Styles
                  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-4",
                  "prose-p:font-medium prose-p:opacity-90 prose-p:my-3",
                  "prose-blockquote:border-l-4 prose-blockquote:border-current/20 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:opacity-80",
                  "prose-li:marker:opacity-50",
                  "prose-code:rounded-md prose-code:bg-black/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
                  // Dynamic Styles
                  THEMES[theme].text,
                  SIZES[fontSize].class
                )}>
                  {editorMode === 'markdown' ? (
                    <ReactMarkdown>{content || "Type something..."}</ReactMarkdown>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: highlightCodeBlocks(content) || "<p>Type something...</p>" }} />
                  )}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-black/5 flex items-center justify-between opacity-30 select-none">
                   <div className="flex items-center gap-1.5">
                     {/* Dynamic Symbol */}
                     {(() => {
                       const IconComponent = SYMBOLS[footerIcon].icon;
                       return <IconComponent size={14} className="text-current" />;
                     })()}
                     <span className="text-[10px] uppercase tracking-widest font-bold font-sans">{footerText}</span>
                   </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* --- FLOATING ACTION BAR (Export Only on Mobile maybe? No, keep Zoom) --- */}
        {/* On mobile, this bar floats above the Style Controls. We might want to adjust position */}
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full z-30 animate-in slide-in-from-bottom-6",
          "bottom-6 lg:bottom-8" // Adjust bottom position
        )}>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(50, s - 10)); }}
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Minus size={16} />
            </button>
            {/* Hide Slider on Mobile to save space */}
            <div className="flex-col w-24 gap-1 hidden sm:flex">
              <input
                type="range"
                min="50"
                max="150"
                value={scale}
                onChange={(e) => setScale(Math.min(getMaxScale(), Number(e.target.value)))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(getMaxScale(), s + 10)); }}
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Plus size={16} />
            </button>
            <span className="text-xs font-mono text-slate-400 w-9 text-right">{scale}%</span>
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Export Action with Resolution Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
              disabled={isExporting}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                <>
                  <span>Export</span>
                  <Download size={16} />
                </>
              )}
            </button>
            
            {/* Resolution Dropdown Menu */}
            {showExportMenu && !isExporting && (
              <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-3 py-2 bg-slate-50 border-b border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Export Resolution</span>
                </div>
                <div className="py-1">
                  {EXPORT_RESOLUTIONS.map((res) => (
                    <button
                      key={res.name}
                      onClick={() => handleExport(res.scale)}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-100 group-hover:bg-indigo-100 rounded-lg text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                          {res.name}
                        </span>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{res.label}</div>
                          <div className="text-[10px] text-slate-400">{res.size}</div>
                        </div>
                      </div>
                      <Download size={14} className="text-slate-300 group-hover:text-indigo-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
