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
  PilcrowSquare,
  Moon,
  Sun,
  // Additional icons for brand symbols
  BookOpen,
  Newspaper,
  Bell,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Shield,
  Megaphone,
  Bookmark,
  Clock,
  Tag,
  GitBranch,
  GitCommit,
  Send,
  MessageSquare,
  Users,
  Award,
  Coffee,
  Music,
  Pen,
  Camera,
  Video,
  Mic,
  Headphones,
  Wifi,
  Battery,
  Compass,
  Map as MapIcon,
  Navigation,
  Truck,
  Package,
  ShoppingCart,
  CreditCard as CardIcon,
  DollarSign,
  Percent,
  PieChart,
  BarChart,
  Activity,
  Hexagon,
  Triangle,
  Pentagon,
  Octagon,
  Diamond
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
function highlightCodeBlocks(html: string, imageMap?: Map<string, string>): string {
  if (!html) return html;
  
  // First, resolve image IDs to actual URLs
  let processedHtml = html;
  if (imageMap) {
    processedHtml = processedHtml.replace(/<img([^>]*)src=["'](__IMG_\d+__)["']([^>]*)>/gi, (match, before, imgId, after) => {
      const actualSrc = imageMap.get(imgId);
      if (actualSrc) {
        return `<img${before}src="${actualSrc}"${after}>`;
      }
      return ''; // Remove if not found in map
    });
  }
  
  // Clean up img tags with empty or missing src to prevent React warnings
  let cleanedHtml = processedHtml
    .replace(/<img[^>]*src=["']["'][^>]*\/?>/gi, '') // Remove img with empty src=""
    .replace(/<img(?![^>]*src=)[^>]*\/?>/gi, '');    // Remove img without src attribute
  
  // Match <pre><code class="language-xxx">...</code></pre> patterns
  const codeBlockRegex = /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/gi;
  
  return cleanedHtml.replace(codeBlockRegex, (match, language, code) => {
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
// imageMap is used to restore full URLs for long/base64 images
function markdownToHtml(markdown: string, imageMap?: Map<string, string>): string {
  if (!markdown) return "<p></p>";
  if (markdown.trim().startsWith("<")) return markdown;
  
  // Remove image URL comments (added for readability in markdown)
  let cleaned = markdown.replace(/<!-- Image URL: .+? -->\n?/g, '');
  
  // First, handle standalone image lines (before other processing)
  // Match ![alt](url) on its own line - preserve them as special markers
  let processed = cleaned.replace(/^!\[([^\]]*)\]\((.+)\)$/gm, (_, alt, src) => {
    let actualSrc = src;
    // Check if this is an image ID that needs to be resolved
    if (src && src.startsWith('__IMG_') && src.endsWith('__') && imageMap) {
      actualSrc = imageMap.get(src) || src;
    }
    if (actualSrc && actualSrc.trim()) {
      return `<img src="${actualSrc}" alt="${alt || ''}" />`;
    }
    return '';
  });
  
  // Handle inline images
  processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    let actualSrc = src;
    // Check if this is an image ID that needs to be resolved
    if (src && src.startsWith('__IMG_') && src.endsWith('__') && imageMap) {
      actualSrc = imageMap.get(src) || src;
    }
    if (actualSrc && actualSrc.trim()) {
      return `<img src="${actualSrc}" alt="${alt || ''}" />`;
    }
    return '';
  });
  
  let html = processed
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
        trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('<p') ||
        trimmed.startsWith('<img')) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }
  
  return result.join('') || "<p></p>";
}

// Image URL length threshold for truncation in Markdown display
const IMAGE_URL_MAX_LENGTH = 80;

// Convert HTML back to Markdown for Markdown mode
// imageMap is used to store full URLs for long/base64 images
function htmlToMarkdown(
  html: string, 
  imageMap?: Map<string, string>,
  imageCounter?: { current: number }
): string {
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
  
  // Process images first with a more robust approach
  let markdown = cleanHtml
    // Images - use a function to handle complex img tags
    .replace(/<img[^>]*>/gi, (imgTag) => {
      // Extract src attribute
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      
      // Only output if we have a valid src
      if (src) {
        // For long URLs (especially base64), store in map and use short ID
        if (src.length > IMAGE_URL_MAX_LENGTH && imageMap && imageCounter) {
          const imageId = `__IMG_${imageCounter.current++}__`;
          imageMap.set(imageId, src);
          // Show truncated preview in markdown
          const preview = src.substring(0, 50) + '...' + (src.startsWith('data:') ? '[base64]' : '');
          return `![${alt}](${imageId})\n<!-- Image URL: ${preview} -->\n\n`;
        }
        return `![${alt}](${src})\n\n`;
      }
      return '';
    })
    // Code blocks - handle before inline code
    .replace(/<pre[^>]*><code[^>]*class=["']language-(\w+)["'][^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, lang, code) => {
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `\`\`\`${lang}\n${decodedCode}\n\`\`\`\n\n`;
    })
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `\`\`\`\n${decodedCode}\n\`\`\`\n\n`;
    })
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
    // Inline code (after code blocks to avoid conflicts)
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining tags (like div wrappers from image components)
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
  // Popular & General
  sparkles: { icon: Sparkles },
  zap: { icon: Zap },
  star: { icon: Star },
  heart: { icon: Heart },
  rocket: { icon: Rocket },
  lightbulb: { icon: Lightbulb },
  target: { icon: Target },
  award: { icon: Award },
  
  // Content & Docs
  filetext: { icon: FileText },
  bookopen: { icon: BookOpen },
  newspaper: { icon: Newspaper },
  pen: { icon: Pen },
  feather: { icon: Feather },
  bookmark: { icon: Bookmark },
  tag: { icon: Tag },
  
  // Changelog & Updates
  bell: { icon: Bell },
  megaphone: { icon: Megaphone },
  clock: { icon: Clock },
  calendar: { icon: Calendar },
  trendingup: { icon: TrendingUp },
  activity: { icon: Activity },
  
  // Status & Feedback
  checkcircle: { icon: CheckCircle },
  alertcircle: { icon: AlertCircle },
  shield: { icon: Shield },
  
  // Dev & Tech
  code: { icon: Code },
  gitbranch: { icon: GitBranch },
  gitcommit: { icon: GitCommit },
  command: { icon: Command },
  cpu: { icon: Cpu },
  cloud: { icon: Cloud },
  
  // Communication
  send: { icon: Send },
  messagesquare: { icon: MessageSquare },
  users: { icon: Users },
  globe: { icon: Globe },
  
  // Media
  camera: { icon: Camera },
  video: { icon: Video },
  mic: { icon: Mic },
  headphones: { icon: Headphones },
  music: { icon: Music },
  
  // Business
  package: { icon: Package },
  shoppingcart: { icon: ShoppingCart },
  dollarsign: { icon: DollarSign },
  piechart: { icon: PieChart },
  barchart: { icon: BarChart },
  
  // Navigation
  compass: { icon: Compass },
  map: { icon: MapIcon },
  navigation: { icon: Navigation },
  
  // Fun & Misc
  smile: { icon: Smile },
  ghost: { icon: Ghost },
  flame: { icon: Flame },
  coffee: { icon: Coffee },
  droplets: { icon: Droplets },
  
  // Shapes
  circle: { icon: Circle },
  hexagon: { icon: Hexagon },
  diamond: { icon: Diamond },
  triangle: { icon: Triangle },
  box: { icon: Box },
  layers: { icon: Layers },
  
  // Brands
  apple: { icon: Apple },
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

const LINE_HEIGHTS = {
  tight: { name: "Tight", value: "1.4" },
  normal: { name: "Normal", value: "1.6" },
  relaxed: { name: "Relaxed", value: "1.8" },
  loose: { name: "Loose", value: "2.0" }
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
  const [editorMode, setEditorMode] = useState<'markdown' | 'wysiwyg'>('wysiwyg');
  const [editorKey, setEditorKey] = useState(0); // Used to force re-mount NovelEditor when switching modes
  const imageMapRef = useRef<Map<string, string>>(new Map()); // Map of image IDs to full URLs
  const imageCounterRef = useRef(0); // Counter for generating unique image IDs
  const [theme, setTheme] = useState<keyof typeof THEMES>('minimal');
  const [font, setFont] = useState<keyof typeof FONTS>('sans');
  const [fontSize, setFontSize] = useState<keyof typeof SIZES>('lg');
  const [lineHeight, setLineHeight] = useState<keyof typeof LINE_HEIGHTS>('normal');
  const [decoration, setDecoration] = useState<keyof typeof DECORATIONS>('macos');
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>('dots');
  const [scale, setScale] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const [exportWithBackground, setExportWithBackground] = useState(true);
  const [previewWithBackground, setPreviewWithBackground] = useState(true);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const pinchState = useRef({
    active: false,
    initialDistance: 0,
    startScale: 100,
  });
  const [todayDate, setTodayDate] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Export resolution options
  const EXPORT_RESOLUTIONS = [
    { name: '1x', scale: 1, label: 'Standard', size: '~520×auto' },
    { name: '2x', scale: 2, label: 'Retina', size: '~1040×auto' },
    { name: '3x', scale: 3, label: 'High DPI', size: '~1560×auto' },
    { name: '4x', scale: 4, label: 'Ultra HD', size: '~2080×auto' },
  ];

  // Initialize content as HTML when starting in wysiwyg mode
  useEffect(() => {
    if (editorMode === 'wysiwyg' && content === DEFAULT_MARKDOWN) {
      setContent(markdownToHtml(DEFAULT_MARKDOWN, imageMapRef.current));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      // Icon picker is handled via its own backdrop click handler
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [footerText, setFooterText] = useState("FlipMark");
  const [footerIcon, setFooterIcon] = useState<keyof typeof SYMBOLS>('sparkles');
  const [isMobileEditing, setIsMobileEditing] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
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

  useEffect(() => {
    setMounted(true);
    setTodayDate(new Date().toLocaleDateString());
  }, []);

  // Dark mode initialization and toggle effect
  useEffect(() => {
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (savedMode === null && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Helper: Get max scale based on screen size (Mobile: 100%, Desktop: 150%)
  const getMaxScale = () => {
    return typeof window !== 'undefined' && window.innerWidth < 1024 ? 100 : 150;
  };

  const getTouchDistance = (touches: TouchList | React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    if (!touch1 || !touch2) return 0;
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePinchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    if (event.touches.length === 2) {
      const distance = getTouchDistance(event.touches);
      if (!distance) return;
      pinchState.current.active = true;
      pinchState.current.initialDistance = distance;
      pinchState.current.startScale = scale;
    }
  };

  const handlePinchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!pinchState.current.active || event.touches.length < 2) return;
    event.preventDefault();
    const distance = getTouchDistance(event.touches);
    if (!distance || !pinchState.current.initialDistance) return;
    const pinchRatio = distance / pinchState.current.initialDistance;
    const nextScale = pinchState.current.startScale * pinchRatio;
    const maxScale = getMaxScale();
    const clamped = Math.min(maxScale, Math.max(50, nextScale));
    setScale(Math.round(clamped));
  };

  const handlePinchEnd = () => {
    pinchState.current.active = false;
    pinchState.current.initialDistance = 0;
  };

  // Generate preview image
  const generatePreview = useCallback(async (withBackground: boolean = true) => {
    if (cardRef.current === null) return;
    
    try {
      let dataUrl: string;
      
      if (withBackground) {
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
        
        // Generate preview with background
        dataUrl = await toPng(exportContainer, { 
          cacheBust: true, 
          pixelRatio: 2,
        });
        
        // Cleanup
        document.body.removeChild(exportContainer);
      } else {
        // Generate preview without background (card only)
        dataUrl = await toPng(cardRef.current, { 
          cacheBust: true, 
          pixelRatio: 2,
        });
      }
      
      // Set preview image
      setPreviewImageUrl(dataUrl);
      setShowPreview(true);
    } catch (err) {
      console.error('Failed to generate preview', err);
    }
  }, [cardRef, theme, pattern]);

  // Toggle preview background and regenerate
  const togglePreviewBackground = useCallback(async () => {
    const newValue = !previewWithBackground;
    setPreviewWithBackground(newValue);
    await generatePreview(newValue);
  }, [previewWithBackground, generatePreview]);

  // Export with or without background
  const handleExport = useCallback(async (pixelRatio: number = 2, withBackground: boolean = true) => {
    if (cardRef.current === null) return;
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      let dataUrl: string;
      
      if (withBackground) {
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
        
        // Export with background
        dataUrl = await toPng(exportContainer, { 
          cacheBust: true, 
          pixelRatio: pixelRatio,
        });
        
        // Cleanup
        document.body.removeChild(exportContainer);
      } else {
        // Export card only (no background)
        dataUrl = await toPng(cardRef.current, { 
          cacheBust: true, 
          pixelRatio: pixelRatio,
        });
      }
      
      // Download
      const link = document.createElement('a');
      link.download = `flipmark-${withBackground ? 'full' : 'card'}-${theme}-${Date.now()}.png`;
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
        "flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-white dark:bg-gray-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300",
        isDragging && "cursor-col-resize select-none",
        isResizingEditor && "cursor-row-resize select-none"
      )}
    >

      {/* --- PREVIEW MODAL --- */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 preview-modal-backdrop"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden preview-modal-content flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Monitor size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Export Preview</h3>
              </div>
              
              {/* Background Toggle */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Background</span>
                  <button
                    onClick={togglePreviewBackground}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
                      previewWithBackground 
                        ? "bg-indigo-500" 
                        : "bg-slate-300 dark:bg-gray-600"
                    )}
                  >
                    <span 
                      className={cn(
                        "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200",
                        previewWithBackground && "translate-x-5"
                      )}
                    />
                  </button>
                </div>
                
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {previewImageUrl && (
                <img 
                  src={previewImageUrl} 
                  alt="Export Preview" 
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setShowExportMenu(true);
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE INFO MODAL --- */}
      {showMobileInfo && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setShowMobileInfo(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Markdown Guide</div>
              <button
                onClick={() => setShowMobileInfo(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-400 dark:text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">**Bold**</code>
                <span className="font-bold text-slate-600 dark:text-slate-400">Bold Text</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">*Italic*</code>
                <span className="italic text-slate-600 dark:text-slate-400">Italic Text</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs"># Heading</code>
                <span className="font-bold text-slate-800 dark:text-slate-200">Heading 1</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">&gt; Quote</code>
                <span className="border-l-2 border-indigo-400 pl-2 text-slate-500 dark:text-slate-400 italic">Quote</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">- List</code>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                  <span>List Item</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 font-mono text-xs">`Code`</code>
                <span className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">Code</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Tips: Use <code className="font-mono text-slate-500 dark:text-slate-400 text-xs">---</code> for divider.
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE FULLSCREEN EDITOR OVERLAY --- */}
      {isMobileEditing && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col animate-in slide-in-from-bottom-10 duration-200 lg:hidden">
          {/* Header with mode toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
              <button
                onClick={() => {
                  if (editorMode === 'wysiwyg' && content.trim().startsWith('<')) {
                    setContent(htmlToMarkdown(content, imageMapRef.current, imageCounterRef));
                  }
                  setEditorMode('markdown');
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  editorMode === 'markdown' 
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <Code size={12} />
                Markdown
              </button>
              <button
                onClick={() => {
                  if (editorMode === 'markdown' && !content.trim().startsWith('<')) {
                    setContent(markdownToHtml(content, imageMapRef.current));
                  }
                  setEditorKey(k => k + 1); // Force re-mount NovelEditor
                  setEditorMode('wysiwyg');
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  editorMode === 'wysiwyg' 
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <PilcrowSquare size={12} />
                Visual
              </button>
            </div>
            
            <button
              onClick={() => setIsMobileEditing(false)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/50 rounded-full"
            >
              <Check size={14} />
              Done
            </button>
          </div>
          
          {/* Editor Content */}
          {editorMode === 'markdown' ? (
            <>
              <textarea
                className="flex-1 w-full p-5 resize-none outline-none font-mono text-base text-slate-700 dark:text-slate-300 bg-transparent leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="Type markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />
              <div className="px-4 py-3 bg-slate-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-xs text-slate-400 dark:text-slate-500 flex gap-4 font-mono overflow-x-auto">
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
                key={`editor-mobile-${editorKey}`}
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
          "flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-20 shadow-lg relative group/sidebar transition-all",
          // Desktop: Sidebar with dynamic width, Mobile: Full width bottom panel
          "w-full lg:w-[var(--sidebar-width)]",
          "h-[40vh] lg:h-full order-2 lg:order-1" // Mobile: 40% height, Desktop: Full height
        )}
      >

        {/* Header (Desktop Only) */}
        <div className="hidden lg:flex h-14 px-4 border-b border-gray-100 dark:border-gray-800 items-center gap-3 bg-white dark:bg-gray-900 shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">FlipMark</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
            suppressHydrationWarning
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

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
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              <PenLine size={12} className="text-slate-400 dark:text-slate-500" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Editor</span>
            </div>
            {/* Mode Toggle */}
            <div className="flex bg-gray-200/50 dark:bg-gray-800 p-0.5 rounded-md">
              <button
                onClick={() => {
                  // Convert HTML back to Markdown when switching to Markdown mode
                  if (editorMode === 'wysiwyg' && content.trim().startsWith('<')) {
                    setContent(htmlToMarkdown(content, imageMapRef.current, imageCounterRef));
                  }
                  setEditorMode('markdown');
                }}
                className={cn(
                  "px-2 py-1 text-[10px] font-medium rounded transition-all flex items-center gap-1",
                  editorMode === 'markdown' 
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
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
                    setContent(markdownToHtml(content, imageMapRef.current));
                  }
                  setEditorKey(k => k + 1); // Force re-mount NovelEditor
                  setEditorMode('wysiwyg');
                }}
                className={cn(
                  "px-2 py-1 text-[10px] font-medium rounded transition-all flex items-center gap-1",
                  editorMode === 'wysiwyg' 
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
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
              className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-transparent selection:bg-indigo-100 dark:selection:bg-indigo-900 placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                key={`editor-desktop-${editorKey}`}
                initialContent={content}
                onContentChange={(html) => setContent(html)}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Draggable Resizer (Desktop Only) */}
        <div
          className="hidden lg:flex h-2 bg-slate-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-row-resize items-center justify-center border-y border-gray-200 dark:border-gray-700 transition-colors group/editor-resizer shrink-0"
          onMouseDown={startResizingEditor}
        >
          <div className="w-12 h-1 bg-slate-300 dark:bg-gray-600 rounded-full group-hover/editor-resizer:bg-indigo-400 transition-colors" />
        </div>

        {/* Style Controls (Always Visible - Bottom Half on Desktop, Full Panel on Mobile) */}
        <div 
          className={cn(
            "bg-slate-50 dark:bg-gray-900/50 flex flex-col overflow-y-auto",
            "h-full lg:flex-1" // Mobile takes full height, Desktop takes remaining space
          )}
        >

          {/* --- MOBILE TABS HEADER --- */}
          <div className="lg:hidden flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 sticky top-0 z-20">
            {(['theme', 'font', 'style'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative",
                  mobileActiveTab === tab ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20" : "text-slate-400 dark:text-slate-500"
                )}
              >
                {tab}
                {mobileActiveTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
              </button>
            ))}
          </div>

            <div className="px-4 pt-2 pb-24 space-y-4 lg:p-5 lg:space-y-6 lg:pb-5 lg:pt-5"> {/* Extra padding bottom for mobile overlay controls */}

            {/* Theme Selector (Visible on Desktop OR Mobile Theme Tab) */}
            <div className={cn("space-y-3", "lg:block", mobileActiveTab === 'theme' ? "block" : "hidden")}>
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"> {/* Hidden title on mobile */}
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
                        ? "bg-white dark:bg-gray-800 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className={cn("w-full h-8 rounded-md shadow-inner border border-black/5 dark:border-white/20", t.preview)} />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Controls (Visible on Desktop OR Mobile Font Tab) */}
            <div className={cn("space-y-2 lg:space-y-3", "lg:block", mobileActiveTab === 'font' ? "block" : "hidden")}>
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"> {/* Hidden title on mobile */}
                <Type size={12} /> Typography
              </div>

              {/* Mobile: Stack vertically | Desktop: Stack vertically */}
              <div className="flex flex-col gap-3 lg:gap-4">

                {/* Font Family - Grid layout for 6 fonts */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Font Family</label>
                  <div className="grid grid-cols-3 gap-1 bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg w-full">
                    {(Object.keys(FONTS) as Array<keyof typeof FONTS>).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFont(f)}
                        className={cn(
                          "py-2 lg:py-1.5 text-xs font-medium rounded-md transition-all",
                          font === f ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                      >
                        {FONTS[f].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Size</label>
                  <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg w-full">
                    {(Object.keys(SIZES) as Array<keyof typeof SIZES>).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={cn(
                          "flex-1 py-2 lg:py-1.5 text-xs font-medium rounded-md transition-all",
                          fontSize === s ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                      >
                        {s === 'sm' ? 'S' : s === 'base' ? 'M' : s === 'lg' ? 'L' : 'XL'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Line Height</label>
                  <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg w-full">
                    {(Object.keys(LINE_HEIGHTS) as Array<keyof typeof LINE_HEIGHTS>).map((lh) => (
                      <button
                        key={lh}
                        onClick={() => setLineHeight(lh)}
                        className={cn(
                          "flex-1 py-2 lg:py-1.5 text-[10px] font-medium rounded-md transition-all",
                          lineHeight === lh ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                      >
                        {LINE_HEIGHTS[lh].value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Window & Footer Controls (Visible on Desktop OR Mobile Style Tab) */}
            <div className={cn("space-y-2 lg:space-y-3", "lg:block", mobileActiveTab === 'style' ? "block" : "hidden")}>
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"> {/* Hidden title on mobile */}
                <Layout size={12} /> Appearance
              </div>

                {/* Window Decoration Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Window Style</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(DECORATIONS) as Array<keyof typeof DECORATIONS>).map((d) => (
                      <button 
                        key={d}
                        onClick={() => setDecoration(d)}
                        className={cn(
                          "py-1.5 text-[10px] font-medium rounded-md transition-all border",
                          decoration === d 
                            ? "bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400" 
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        {DECORATIONS[d].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Text Input with Icon Picker */}
                <div className="space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Footer</span>
                    {/* Show/Hide Toggle */}
                    <button
                      onClick={() => setShowFooter(!showFooter)}
                      className={cn(
                        "relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
                        showFooter 
                          ? "bg-indigo-500" 
                          : "bg-slate-300 dark:bg-gray-600"
                      )}
                    >
                      <span 
                        className={cn(
                          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200",
                          showFooter && "translate-x-4"
                        )}
                      />
                    </button>
                  </div>
                  
                  {showFooter && (
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                       {/* Clickable Icon - Opens Picker */}
                       <button
                         onClick={() => setShowIconPicker(!showIconPicker)}
                         className={cn(
                           "p-2 rounded-lg transition-all flex-shrink-0",
                           showIconPicker 
                             ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" 
                             : "bg-gray-100 dark:bg-gray-700 text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                         )}
                         title="Choose icon"
                       >
                         {(() => {
                           const IconComponent = SYMBOLS[footerIcon].icon;
                           return <IconComponent size={16} />;
                         })()}
                       </button>
                       
                       <input 
                          type="text"
                          value={footerText}
                          onChange={(e) => setFooterText(e.target.value)}
                          className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          placeholder="Footer text..."
                       />
                    </div>
                  )}
                  
                  {/* Desktop Icon Picker - Positioned below Footer Text */}
                  {showFooter && showIconPicker && (
                    <div 
                      className="hidden lg:block absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 bg-slate-50/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Select Icon</span>
                        <button 
                          onClick={() => setShowIconPicker(false)}
                          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-[120px] p-2 grid grid-cols-10 gap-1">
                        {(Object.keys(SYMBOLS) as Array<keyof typeof SYMBOLS>).map((s) => {
                          const IconComponent = SYMBOLS[s].icon;
                          return (
                            <button 
                              key={s}
                              onClick={() => {
                                setFooterIcon(s);
                                setShowIconPicker(false);
                              }}
                              className={cn(
                                "p-1.5 rounded-md transition-all flex items-center justify-center",
                                footerIcon === s 
                                  ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500" 
                                  : "text-slate-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-slate-600"
                              )}
                              title={s}
                            >
                              <IconComponent size={14} />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Canvas Pattern Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Canvas Pattern</span>
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
                              ? "border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-800" 
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                        >
                          {/* Pattern Preview Background */}
                          <div 
                            className="absolute inset-0 bg-slate-50 dark:bg-gray-800"
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
                              : "bg-white/80 dark:bg-gray-900/80 text-slate-600 dark:text-slate-400 group-hover/pattern:bg-white/90 dark:group-hover/pattern:bg-gray-900/90"
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

                {/* Mobile Footer - Copyright & Social */}
                <div className="lg:hidden flex flex-col items-center gap-2 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>© {new Date().getFullYear()}</span>
                    <span className="font-medium text-slate-500 dark:text-slate-400">FlipMark</span>
                    <span>· Made with</span>
                    <Heart size={10} className="text-rose-400 fill-rose-400" />
                  </div>
                  <a 
                    href="https://x.com/JustinBao_" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {/* X (Twitter) Icon */}
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-3.5 h-3.5 fill-current"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>@JustinBao_</span>
                  </a>
                </div>
            </div>

          </div>
        </div>

        {/* Page Footer - Copyright & Social */}
        <div className="hidden lg:flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">FlipMark</span>
            <span className="hidden sm:inline">· Made with</span>
            <Heart size={10} className="hidden sm:inline text-rose-400 fill-rose-400" />
          </div>
          <a 
            href="https://x.com/JustinBao_" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors group"
          >
            <span className="group-hover:underline">@JustinBao_</span>
            {/* X (Twitter) Icon */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-3.5 h-3.5 fill-current"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* Resizer Handle (Desktop Only) */}
        <div
          className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-colors z-50 group/resizer"
          onMouseDown={startResizing}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover/resizer:opacity-100 transition-opacity pointer-events-none">
            <GripVertical size={12} className="text-slate-400 dark:text-slate-500" />
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
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              backgroundImage: PATTERNS[pattern].css,
              backgroundSize: PATTERNS[pattern].size,
              // 深色主题(Dev Dark, Midnight Blue)下降低 pattern 透明度
              opacity: (theme === 'obsidian' || theme === 'midnight') ? 0.15 : 1
            }}>
          </div>
        )}

        {/* Dark Mode Overlay - adds a subtle dark tint over canvas in dark mode */}
        <div className="absolute inset-0 pointer-events-none bg-black/0 dark:bg-black/40 transition-colors duration-300" />

        {/* Mobile Info & Dark Mode Icons (Fixed Top Right) */}
        <div className="lg:hidden fixed top-4 right-4 z-40 flex items-center gap-2" suppressHydrationWarning>
          <button
            className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full shadow-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
            suppressHydrationWarning
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full shadow-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
            onClick={() => setShowMobileInfo(true)}
          >
            <Info size={20} />
          </button>
        </div>

        {/* Scrollable Canvas Area */}
        <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div
            className="min-h-full flex flex-col items-center px-4 sm:px-20 py-20"
          >

            <div
              className="transition-transform duration-200 ease-out origin-center will-change-transform my-auto"
              style={{ transform: `scale(${scale / 100})` }}
              onTouchStart={handlePinchStart}
              onTouchMove={handlePinchMove}
              onTouchEnd={handlePinchEnd}
              onTouchCancel={handlePinchEnd}
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
                          <div className="px-2 py-0.5 bg-black/5 rounded text-[8px] font-mono opacity-50 hidden sm:block min-w-[60px] text-center">
                            {todayDate || '—'}
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
                  "prose-blockquote:border-l-4 prose-blockquote:border-current/20 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:opacity-80 prose-blockquote:before:content-none prose-blockquote:after:content-none [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none",
                  "prose-li:marker:opacity-50",
                  "prose-code:rounded-md prose-code:bg-black/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
                  "prose-strong:text-current prose-strong:font-bold",
                  // Remove margin from first/last elements for consistent padding
                  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                  // Dynamic Styles
                  THEMES[theme].text,
                  SIZES[fontSize].class
                )}
                style={{ lineHeight: LINE_HEIGHTS[lineHeight].value }}
                >
                  {editorMode === 'markdown' ? (
                    <ReactMarkdown
                      components={{
                        // Custom image component to handle empty src and image IDs
                        img: ({ src, alt, ...props }) => {
                          // Don't render if src is empty or not a string
                          if (!src || typeof src !== 'string' || src.trim() === '') return null;
                          // Resolve image ID from map if needed
                          let actualSrc = src;
                          if (src.startsWith('__IMG_') && src.endsWith('__')) {
                            actualSrc = imageMapRef.current.get(src) || src;
                          }
                          // Don't render if still invalid
                          if (!actualSrc || actualSrc.startsWith('__IMG_')) return null;
                          return <img src={actualSrc} alt={alt || ''} {...props} />;
                        }
                      }}
                    >
                      {content || "Type something..."}
                    </ReactMarkdown>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: highlightCodeBlocks(content, imageMapRef.current) || "<p>Type something...</p>" }} />
                  )}
                </div>

                {/* Footer */}
                {showFooter && (
                  <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between opacity-30 select-none">
                     <div className="flex items-center gap-1.5">
                       {/* Dynamic Symbol */}
                       {(() => {
                         const IconComponent = SYMBOLS[footerIcon].icon;
                         return <IconComponent size={14} className="text-current" />;
                       })()}
                       <span className="text-[10px] uppercase tracking-widest font-bold font-sans">{footerText}</span>
                     </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* --- FLOATING ACTION BAR (Export Only on Mobile maybe? No, keep Zoom) --- */}
        {/* On mobile, this bar floats above the Style Controls. We might want to adjust position */}
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-full z-30 animate-in slide-in-from-bottom-6",
          "bottom-6 lg:bottom-8" // Adjust bottom position
        )}>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(50, s - 10)); }}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Minus size={16} />
            </button>
            {/* Hide Slider on Mobile to save space */}
            <div className="flex-col w-24 gap-1 hidden sm:flex">
              <input
                type="range"
                min="50"
                max="150"
                value={mounted ? scale : 100}
                onChange={(e) => setScale(Math.min(getMaxScale(), Number(e.target.value)))}
                className="w-full h-1 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                suppressHydrationWarning
              />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(getMaxScale(), s + 10)); }}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Plus size={16} />
            </button>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-9 text-right">{scale}%</span>
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          {/* Preview Button */}
          <button
            onClick={(e) => { e.stopPropagation(); generatePreview(previewWithBackground); }}
            className="flex items-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg active:scale-95 border border-gray-200 dark:border-gray-600"
          >
            <Monitor size={16} />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Export Action with Resolution Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
              disabled={isExporting}
              className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
              <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-150">
                {/* Background Toggle */}
                <div className="px-3 py-2.5 bg-slate-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Include Background</span>
                    <button
                      onClick={() => setExportWithBackground(!exportWithBackground)}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
                        exportWithBackground 
                          ? "bg-indigo-500" 
                          : "bg-slate-300 dark:bg-gray-600"
                      )}
                    >
                      <span 
                        className={cn(
                          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200",
                          exportWithBackground && "translate-x-5"
                        )}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    {exportWithBackground ? "Export with canvas background & pattern" : "Export card only (transparent edges)"}
                  </p>
                </div>
                
                {/* Resolution Options */}
                <div className="px-3 py-1.5 bg-slate-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolution</span>
                </div>
                <div className="py-1">
                  {EXPORT_RESOLUTIONS.map((res) => (
                    <button
                      key={res.name}
                      onClick={() => handleExport(res.scale, exportWithBackground)}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-gray-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {res.name}
                        </span>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{res.label}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {exportWithBackground ? res.size : '~520×auto'}
                          </div>
                        </div>
                      </div>
                      <Download size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Icon Picker Modal - Bottom Sheet */}
      {showIconPicker && (
        <>
          {/* Backdrop - only on mobile */}
          <div 
            className="lg:hidden fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowIconPicker(false)}
          />
          
          {/* Mobile: Bottom Sheet */}
          <div 
            className={cn(
              "lg:hidden fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-gray-800 shadow-2xl border-t border-gray-200 dark:border-gray-700",
              "max-h-[60vh] rounded-t-2xl",
              "animate-in slide-in-from-bottom duration-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-slate-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose Icon</span>
              <button 
                onClick={() => setShowIconPicker(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(60vh-52px)] p-3 grid grid-cols-7 gap-2">
              {(Object.keys(SYMBOLS) as Array<keyof typeof SYMBOLS>).map((s) => {
                const IconComponent = SYMBOLS[s].icon;
                return (
                  <button 
                    key={s}
                    onClick={() => {
                      setFooterIcon(s);
                      setShowIconPicker(false);
                    }}
                    className={cn(
                      "p-3 rounded-xl transition-all flex items-center justify-center",
                      footerIcon === s 
                        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    title={s}
                  >
                    <IconComponent size={20} />
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
